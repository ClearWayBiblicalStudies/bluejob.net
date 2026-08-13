import { Client } from "pg";
import { createHash, randomBytes } from "node:crypto";

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
const hash = (value) => createHash("sha256").update(value).digest("hex");
const cookie = (token, maxAge) =>
  `bj_session=${token}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`;
const encoder = new TextEncoder();
const PBKDF2_ITERATIONS = 310000;
const cors = (request, response, env) => {
  const origin = request.headers.get("Origin");
  if (origin === (env.APP_ORIGIN || "https://bluejob.net") || origin === "http://localhost:5173") {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Vary", "Origin");
  }
  return response;
};

async function withDb(env, callback) {
  if (!env.HYPERDRIVE?.connectionString) throw new Error("Database binding is not configured");
  const client = new Client({ connectionString: env.HYPERDRIVE.connectionString });
  await client.connect();
  try {
    await client.query("SET search_path TO bluejob");
    return await callback(client);
  } finally {
    await client.end().catch(() => {});
  }
}

const base64url = (bytes) => btoa(String.fromCharCode(...bytes))
  .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromBase64url = (value) => Uint8Array.from(
  atob(value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=")),
  (character) => character.charCodeAt(0),
);

async function derivePassword(password, salt, iterations) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256,
  ));
}

async function passwordHash(password) {
  const salt = randomBytes(16);
  const digest = await derivePassword(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${base64url(salt)}$${base64url(digest)}`;
}

function sameBytes(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

async function verifyPassword(password, stored, pepper) {
  const parts = String(stored || "").split("$");
  if (parts.length === 4 && parts[0] === "pbkdf2") {
    const iterations = Number(parts[1]);
    if (!Number.isSafeInteger(iterations) || iterations < 100000 || iterations > 1000000) return false;
    try {
      return sameBytes(await derivePassword(password, fromBase64url(parts[2]), iterations), fromBase64url(parts[3]));
    } catch {
      return false;
    }
  }
  // Allow existing SHA-256 accounts to sign in once, then upgrade them to PBKDF2.
  return stored === await legacyPasswordHash(password, pepper);
}

async function legacyPasswordHash(password, pepper) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(`${pepper}:${password}`));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function body(request) {
  return request.json().catch(() => ({}));
}

async function session(request, db) {
  const token = request.headers.get("Cookie")?.match(/(?:^|;\s*)bj_session=([^;]+)/)?.[1];
  if (!token) return null;
  const result = await db.query(
    `SELECT u.*, COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') roles,
            s.mfa_verified_at
       FROM sessions s JOIN users u ON u.id = s.user_id
       LEFT JOIN user_roles ur ON ur.user_id = u.id LEFT JOIN roles r ON r.id = ur.role_id
      WHERE s.token_hash = $1 AND s.revoked_at IS NULL AND s.expires_at > now()
      GROUP BY u.id, s.mfa_verified_at`,
    [hash(token)],
  );
  return result.rows[0] ?? null;
}

async function createSession(db, userId) {
  const token = randomBytes(32).toString("base64url");
  await db.query("INSERT INTO sessions(user_id,token_hash,expires_at) VALUES($1,$2,now()+interval '7 days')", [userId, hash(token)]);
  return token;
}

function requireRole(user, role) {
  if (!user || !user.roles.includes(role)) return json({ error: "Forbidden" }, 403);
  return null;
}

async function auth(request, env, db, path) {
  if (path === "/api/auth/register" && request.method === "POST") {
    const input = await body(request);
    const email = String(input.email || "").trim().toLowerCase();
    const displayName = String(input.displayName || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof input.password !== "string" || input.password.length < 12 || !displayName) {
      return json({ error: "email, displayName, and a 12-character password are required" }, 400);
    }
    const password = await passwordHash(input.password);
    try {
      const result = await db.query(
        "INSERT INTO users(email,password_hash,display_name) VALUES($1,$2,$3) RETURNING id,email,display_name",
        [email, password, displayName],
      );
      await db.query("INSERT INTO user_roles(user_id,role_id) SELECT $1,id FROM roles WHERE name='WORKER'", [result.rows[0].id]);
      const token = await createSession(db, result.rows[0].id);
      return json({ ...result.rows[0], ok: true }, 201, { "set-cookie": cookie(token, 604800) });
    } catch (error) {
      if (error.code === "23505") return json({ error: "Account already exists" }, 409);
      throw error;
    }
  }
  if (path === "/api/auth/login" && request.method === "POST") {
    const input = await body(request);
    const email = String(input.email || "").trim().toLowerCase();
    if (!email || typeof input.password !== "string") return json({ error: "email and password are required" }, 400);
    const result = await db.query("SELECT * FROM users WHERE email=$1", [email]);
    const user = result.rows[0];
    if (!user || !await verifyPassword(input.password, user.password_hash, env.PASSWORD_PEPPER || "")) {
      return json({ error: "Invalid credentials" }, 401);
    }
    if (!String(user.password_hash).startsWith("pbkdf2$")) {
      await db.query("UPDATE users SET password_hash=$1,updated_at=now() WHERE id=$2", [await passwordHash(input.password), user.id]);
    }
    const token = await createSession(db, user.id);
    return json({ ok: true, requiresPasswordChange: user.force_password_change }, 200, {
      "set-cookie": cookie(token, 604800),
    });
  }
  if (path === "/api/auth/forgot-password" && request.method === "POST") {
    const email = String((await body(request)).email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "A valid email is required" }, 400);
    const user = await db.query("SELECT id FROM users WHERE email=$1", [email]);
    if (user.rowCount) {
      const token = randomBytes(32).toString("base64url");
      await db.query("INSERT INTO password_reset_tokens(user_id,token_hash,expires_at) VALUES($1,$2,now()+interval '30 minutes')", [user.rows[0].id, hash(token)]);
      if (env.RESEND_API_KEY && env.PASSWORD_RESET_FROM) {
        const origin = env.APP_ORIGIN || "https://bluejob.net";
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { authorization: "Bearer " + env.RESEND_API_KEY, "content-type": "application/json" },
          body: JSON.stringify({ from: env.PASSWORD_RESET_FROM, to: [email], subject: "Reset your BlueJob password", html: `<p>Reset your password: <a href="${origin}/reset-password?token=${encodeURIComponent(token)}">Reset password</a></p>` }),
        });
        if (!response.ok) console.error("password reset delivery failed", response.status);
      }
    }
    return json({ ok: true });
  }
  if (path === "/api/auth/reset-password" && request.method === "POST") {
    const input = await body(request);
    if (typeof input.token !== "string" || typeof input.password !== "string" || input.password.length < 12) {
      return json({ error: "A reset token and a 12-character password are required" }, 400);
    }
    const reset = await db.query("SELECT id,user_id FROM password_reset_tokens WHERE token_hash=$1 AND used_at IS NULL AND expires_at > now()", [hash(input.token)]);
    if (!reset.rowCount) return json({ error: "Reset token is invalid or expired" }, 400);
    await db.query("BEGIN");
    try {
      await db.query("UPDATE users SET password_hash=$1,force_password_change=false,updated_at=now() WHERE id=$2", [await passwordHash(input.password), reset.rows[0].user_id]);
      await db.query("UPDATE password_reset_tokens SET used_at=now() WHERE id=$1", [reset.rows[0].id]);
      await db.query("UPDATE sessions SET revoked_at=now() WHERE user_id=$1", [reset.rows[0].user_id]);
      await db.query("COMMIT");
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
    return json({ ok: true });
  }
  if (path === "/api/auth/logout" && request.method === "POST") {
    const token = request.headers.get("Cookie")?.match(/(?:^|;\s*)bj_session=([^;]+)/)?.[1];
    if (token) await db.query("UPDATE sessions SET revoked_at=now() WHERE token_hash=$1", [hash(token)]);
    return json({ ok: true }, 200, { "set-cookie": cookie("", 0) });
  }
  return null;
}

async function api(request, env, db, user, path) {
  if (path === "/api/me" && request.method === "GET") {
    if (!user) return json({ error: "Authentication required" }, 401);

    if (path === "/api/admin" && request.method === "GET") {
      const denied = requireRole(user, "ADMIN");
      if (denied) return denied;
      return json({ ok: true, email: user.email, roles: user.roles });
    }
    return json({ id: user.id, email: user.email, displayName: user.display_name, roles: user.roles, onboardingPath: user.onboarding_path });
  }
  if (!user) return json({ error: "Authentication required" }, 401);

  if (path === "/api/onboarding" && request.method === "POST") {
    const input = await body(request);
    if (!["WORKER", "CONTRACTOR"].includes(input.path)) return json({ error: "Invalid onboarding path" }, 400);
    await db.query("UPDATE users SET onboarding_path=$1,updated_at=now() WHERE id=$2", [input.path, user.id]);
    return json({ ok: true, path: input.path });
  }
  if (path === "/api/passport" && request.method === "GET") {
    const result = await db.query("SELECT * FROM work_passports WHERE user_id=$1", [user.id]);
    const scores = await db.query("SELECT score,status,factors,created_at FROM work_score_snapshots WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20", [user.id]);
    return json({ passport: result.rows[0] || null, score: scores.rows[0] || { status: "BUILDING" }, history: scores.rows });
  }
  if (path === "/api/passport" && request.method === "PUT") {
    const input = await body(request);
    const result = await db.query(
      `INSERT INTO work_passports(user_id,trade,skills,years_experience,service_area,profile_summary)
       VALUES($1,$2,$3,$4,$5,$6)
       ON CONFLICT(user_id) DO UPDATE SET trade=EXCLUDED.trade,skills=EXCLUDED.skills,years_experience=EXCLUDED.years_experience,service_area=EXCLUDED.service_area,profile_summary=EXCLUDED.profile_summary,updated_at=now()
       RETURNING *`,
      [user.id, input.trade, JSON.stringify(input.skills || []), input.yearsExperience, input.serviceArea, input.profileSummary],
    );
    return json(result.rows[0]);
  }
  if (path === "/api/jobs" && request.method === "POST") {
    const denied = requireRole(user, "CONTRACTOR");
    if (denied) return denied;
    const input = await body(request);
    if (!input.companyId || !input.title || !input.trade) return json({ error: "companyId, title, and trade are required" }, 400);
    const member = await db.query("SELECT 1 FROM company_memberships WHERE company_id=$1 AND user_id=$2 AND role IN ('OWNER','ADMIN')", [input.companyId, user.id]);
    if (!member.rowCount) return json({ error: "Not authorized for company" }, 403);
    const result = await db.query(
      `INSERT INTO jobs(company_id,created_by,title,trade,description,location,budget,budget_type,desired_start_date,estimated_duration,requirements,verification_requirements,status)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [input.companyId, user.id, input.title, input.trade, input.description, input.location, input.budget, input.budgetType, input.desiredStartDate, input.estimatedDuration, JSON.stringify(input.requirements || []), JSON.stringify(input.verificationRequirements || []), input.status || "DRAFT"],
    );
    return json(result.rows[0], 201);
  }
  if (path === "/api/jobs" && request.method === "GET") {
    const result = await db.query("SELECT id,title,trade,description,location,budget,budget_type,status,created_at,response_signal FROM jobs WHERE status <> 'CANCELED' ORDER BY created_at DESC LIMIT 100");
    return json(result.rows);
  }
  const bidMatch = path.match(/^\/api\/jobs\/([^/]+)\/bids$/);
  if (bidMatch && request.method === "POST") {
    const input = await body(request);
    const job = await db.query("SELECT * FROM jobs WHERE id=$1 AND status='OPEN'", [bidMatch[1]]);
    if (!job.rowCount || user.roles.includes("CONTRACTOR")) return json({ error: "Not eligible to bid" }, 403);
    const result = await db.query("INSERT INTO bids(job_id,worker_id,amount,message,estimated_duration) VALUES($1,$2,$3,$4,$5) RETURNING id,job_id,amount,message,estimated_duration,status,created_at", [bidMatch[1], user.id, input.amount, input.message, input.estimatedDuration]);
    await db.query("INSERT INTO notifications(user_id,type,payload) VALUES((SELECT created_by FROM jobs WHERE id=$1),'NEW_BID',jsonb_build_object('jobId',$1))", [bidMatch[1]]);
    return json(result.rows[0], 201);
  }
  const awardMatch = path.match(/^\/api\/jobs\/([^/]+)\/award$/);
  if (awardMatch && request.method === "POST") {
    const input = await body(request);
    await db.query("BEGIN");
    try {
      const job = await db.query("SELECT * FROM jobs WHERE id=$1 FOR UPDATE", [awardMatch[1]]);
      const member = job.rows[0] && await db.query("SELECT 1 FROM company_memberships WHERE company_id=$1 AND user_id=$2 AND role IN ('OWNER','ADMIN')", [job.rows[0].company_id, user.id]);
      if (!job.rowCount || job.rows[0].status !== "OPEN" || !member?.rowCount) throw new Error("FORBIDDEN");
      const bid = await db.query("SELECT * FROM bids WHERE id=$1 AND job_id=$2 FOR UPDATE", [input.bidId, awardMatch[1]]);
      if (!bid.rowCount) throw new Error("BID_NOT_FOUND");
      await db.query("UPDATE jobs SET status='AWARDED' WHERE id=$1", [awardMatch[1]]);
      await db.query("UPDATE bids SET status=CASE WHEN id=$1 THEN 'AWARDED' ELSE 'NOT_SELECTED' END WHERE job_id=$2", [input.bidId, awardMatch[1]]);
      await db.query("INSERT INTO job_awards(job_id,bid_id,awarded_by) VALUES($1,$2,$3)", [awardMatch[1], input.bidId, user.id]);
      await db.query("INSERT INTO notifications(user_id,type,payload) VALUES($1,'JOB_AWARD',jsonb_build_object('jobId',$2))", [bid.rows[0].worker_id, awardMatch[1]]);
      await db.query("COMMIT");
      return json({ ok: true });
    } catch (error) {
      await db.query("ROLLBACK");
      return json({ error: error.message === "FORBIDDEN" ? "Not authorized" : "Unable to award bid" }, error.message === "FORBIDDEN" ? 403 : 409);
    }
    const startMatch = path.match(/^\/api\/jobs\/([^/]+)\/start$/);
    if (startMatch && request.method === "POST") {
      const result = await db.query(
        `UPDATE jobs j SET status='IN_PROGRESS'
          WHERE j.id=$1 AND j.status='AWARDED' AND
            (j.created_by=$2 OR EXISTS (SELECT 1 FROM bids b JOIN job_awards a ON a.bid_id=b.id WHERE a.job_id=j.id AND b.worker_id=$2))
          RETURNING j.*`,
        [startMatch[1], user.id],
      );
      if (!result.rowCount) return json({ error: "Job cannot be started by this participant" }, 409);
      await db.query("INSERT INTO job_completions(job_id) VALUES($1) ON CONFLICT DO NOTHING", [startMatch[1]]);
      return json(result.rows[0]);
    }
    const completeMatch = path.match(/^\/api\/jobs\/([^/]+)\/complete$/);
    if (completeMatch && request.method === "POST") {
      const result = await db.query(
        `UPDATE job_completions c SET worker_confirmed_at=CASE WHEN b.worker_id=$2 THEN COALESCE(c.worker_confirmed_at,now()) ELSE c.worker_confirmed_at END,
            contractor_confirmed_at=CASE WHEN j.created_by=$2 THEN COALESCE(c.contractor_confirmed_at,now()) ELSE c.contractor_confirmed_at END
          FROM jobs j JOIN job_awards a ON a.job_id=j.id JOIN bids b ON b.id=a.bid_id
         WHERE c.job_id=$1 AND j.status IN ('IN_PROGRESS','COMPLETION_PENDING') AND (j.created_by=$2 OR b.worker_id=$2)
         RETURNING c.*, j.created_by, b.worker_id`,
        [completeMatch[1], user.id],
      );
      if (!result.rowCount) return json({ error: "Job completion confirmation is not authorized" }, 403);
      const completion = result.rows[0];
      const status = completion.worker_confirmed_at && completion.contractor_confirmed_at ? "COMPLETED" : "COMPLETION_PENDING";
      await db.query("UPDATE jobs SET status=$1 WHERE id=$2", [status, completeMatch[1]]);
      return json({ status });
    }
    const feedbackMatch = path.match(/^\/api\/jobs\/([^/]+)\/feedback$/);
    if (feedbackMatch && request.method === "POST") {
      const input = await body(request);
      const job = await db.query("SELECT j.*, a.bid_id, b.worker_id FROM jobs j JOIN job_awards a ON a.job_id=j.id JOIN bids b ON b.id=a.bid_id WHERE j.id=$1 AND j.status='COMPLETED'", [feedbackMatch[1]]);
      if (!job.rowCount) return json({ error: "Feedback requires a completed job" }, 409);
      const row = job.rows[0];
      if (user.id === row.created_by) {
        await db.query("INSERT INTO worker_feedback(job_id,worker_id,contractor_id,quality,reliability,communication,schedule_performance,scope_execution,would_hire_again) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)", [row.id, row.worker_id, user.id, input.quality, input.reliability, input.communication, input.schedulePerformance, input.scopeExecution, input.wouldHireAgain]);
      } else if (user.id === row.worker_id) {
        await db.query("INSERT INTO contractor_feedback(job_id,worker_id,company_id,payment_reliability,scope_accuracy,project_readiness,communication,schedule_organization,would_work_again) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)", [row.id, user.id, row.company_id, input.paymentReliability, input.scopeAccuracy, input.projectReadiness, input.communication, input.scheduleOrganization, input.wouldWorkAgain]);
      } else return json({ error: "Not authorized" }, 403);
      const workerScore = await db.query(
        `SELECT avg(value)::numeric(5,2) score, count(*)::integer samples FROM (
           SELECT quality value FROM worker_feedback WHERE worker_id=$1
           UNION ALL SELECT reliability FROM worker_feedback WHERE worker_id=$1
           UNION ALL SELECT communication FROM worker_feedback WHERE worker_id=$1
         ) signals WHERE value IS NOT NULL`,
        [row.worker_id],
      );
      if (workerScore.rows[0].samples) {
        const score = Math.round(Number(workerScore.rows[0].score) * 20);
        await db.query("INSERT INTO work_score_snapshots(user_id,score,status,factors) VALUES($1,$2,'VERIFIED',jsonb_build_object('feedbackSignals',$3))", [row.worker_id, score, workerScore.rows[0].samples]);
      }
      const contractorScore = await db.query(
        `SELECT avg(value)::numeric(5,2) score, count(*)::integer samples FROM (
           SELECT payment_reliability value FROM contractor_feedback WHERE company_id=$1
           UNION ALL SELECT scope_accuracy FROM contractor_feedback WHERE company_id=$1
           UNION ALL SELECT communication FROM contractor_feedback WHERE company_id=$1
         ) signals WHERE value IS NOT NULL`,
        [row.company_id],
      );
      if (contractorScore.rows[0].samples) {
        const score = Math.round(Number(contractorScore.rows[0].score) * 20);
        await db.query("INSERT INTO contractor_score_snapshots(company_id,score,status,factors) VALUES($1,$2,'VERIFIED',jsonb_build_object('feedbackSignals',$3))", [row.company_id, score, contractorScore.rows[0].samples]);
      }
      return json({ ok: true });
    }
    const scoreMatch = path.match(/^\/api\/work-scores\/([^/]+)$/);
    if (scoreMatch && request.method === "GET") {
      const result = await db.query("SELECT score,status,factors,created_at FROM work_score_snapshots WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20", [scoreMatch[1]]);
      return json({ current: result.rows[0] || { status: "BUILDING" }, history: result.rows });
    }
  }
  if (path === "/api/notifications" && request.method === "GET") {
    return json((await db.query("SELECT id,type,payload,read_at,created_at FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100", [user.id])).rows);
  }
  if (path === "/api/disputes" && request.method === "POST") {
    const input = await body(request);
    const allowed = await db.query("SELECT 1 FROM jobs j LEFT JOIN job_awards a ON a.job_id=j.id LEFT JOIN bids b ON b.id=a.bid_id WHERE j.id=$1 AND (j.created_by=$2 OR b.worker_id=$2)", [input.jobId, user.id]);
    if (!allowed.rowCount) return json({ error: "Not authorized" }, 403);
    const result = await db.query("INSERT INTO disputes(job_id,opened_by,reason) VALUES($1,$2,$3) RETURNING *", [input.jobId, user.id, input.reason]);
    await db.query("UPDATE jobs SET status='DISPUTED' WHERE id=$1", [input.jobId]);
    return json(result.rows[0], 201);
  }
  if (path === "/api/admin/verification-queue" && request.method === "GET") {
    const denied = requireRole(user, "ADMIN");
    if (denied || !user.mfa_verified_at) return denied || json({ error: "MFA required" }, 403);
    return json((await db.query("SELECT id,user_id,type,status,submitted_at,metadata FROM evidence WHERE status='PENDING' ORDER BY submitted_at")).rows);
  }
  return json({ error: "Not found" }, 404);
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return cors(request, new Response(null, { status: 204, headers: { "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS", "Access-Control-Allow-Headers": "content-type" } }), env);
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      return cors(request, await withDb(env, async (db) => {
        if ((path === "/healthz" || path === "/api/healthz") && request.method === "GET") {
          await db.query("SELECT 1");
          return json({ ok: true, database: "connected" });
        }
        const user = await session(request, db);
        const authResponse = await auth(request, env, db, path);
        return authResponse || await api(request, env, db, user, path);
      }), env);
    } catch (error) {
      console.error("request failed", error.message);
      return cors(request, json({ error: "Internal server error" }, 500), env);
    }
  },
};
