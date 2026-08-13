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
const cors = (request, response) => {
  const origin = request.headers.get("Origin");
  if (origin === "https://bluejob.net" || origin === "http://localhost:5173") {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Vary", "Origin");
  }
  return response;
};

async function withDb(env, callback) {
  if (!env.HYPERDRIVE?.connectionString) throw new Error("Database binding is not configured");
  const client = new Client({
    connectionString: env.HYPERDRIVE.connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query("SET search_path TO bluejob, public");
    return await callback(client);
  } finally {
    await client.end().catch(() => {});
  }
}

async function passwordHash(password, pepper) {
  const salt = randomBytes(16).toString("base64url");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(`${pepper}:${password}`), "PBKDF2", false, ["deriveBits"]);
  const digest = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: 600000 }, key, 256);
  return `pbkdf2$600000$${salt}$${[...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

async function passwordMatches(password, storedHash, pepper) {
  if (storedHash.startsWith("pbkdf2$")) {
    const [algorithm, iterations, salt, expected] = storedHash.split("$");
    if (algorithm !== "pbkdf2" || !/^\d+$/.test(iterations) || !salt || !/^[0-9a-f]{64}$/.test(expected)) return false;
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(`${pepper}:${password}`), "PBKDF2", false, ["deriveBits"]);
    const digest = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: Number(iterations) }, key, 256);
    const actual = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
    return actual === expected;
  }
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${pepper}:${password}`));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("") === storedHash;
}

function resetEmailConfigured(env) {
  return Boolean(env.RESEND_API_KEY && env.PASSWORD_RESET_FROM);
}

async function sendPasswordResetEmail(env, email, token) {
  const origin = new URL(env.APP_ORIGIN || "https://bluejob.net");
  if (origin.protocol !== "https:") throw new Error("Password reset origin must use HTTPS");
  const resetUrl = new URL("/reset-password", origin);
  resetUrl.searchParams.set("token", token);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + env.RESEND_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.PASSWORD_RESET_FROM,
      to: email,
      subject: "Set your BlueJob password",
      html: `<p>Use this one-time link to set your BlueJob password:</p><p><a href="${resetUrl.href}">Set password</a></p><p>This link expires in one hour.</p>`,
    }),
  });
  if (!response.ok) throw new Error("Password reset email delivery failed");
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

function requireRole(user, role) {
  if (!user || !user.roles.includes(role)) return json({ error: "Forbidden" }, 403);
  return null;
}

async function auth(request, env, db, path) {
  if (["/api/auth/register", "/api/auth/signup"].includes(path) && request.method === "POST") {
    const input = await body(request);
    const accountType = input.accountType === "CONTRACTOR" ? "CONTRACTOR" : "WORKER";
    const displayName = input.displayName?.trim();
    const companyName = input.companyName?.trim();
    if (!input.email || !input.password || input.password.length < 12 || !displayName ||
      displayName.length > 120 || (accountType === "CONTRACTOR" && (!companyName || companyName.length > 160))) {
      return json({ error: "email, displayName, and a 12-character password are required" }, 400);
    }
    const password = await passwordHash(input.password, env.PASSWORD_PEPPER || "");
    try {
      await db.query("BEGIN");
      const result = await db.query(
        "INSERT INTO users(email,password_hash,display_name,onboarding_path) VALUES($1,$2,$3,$4) RETURNING id,email,display_name,onboarding_path",
        [input.email.toLowerCase(), password, displayName, accountType],
      );
      const user = result.rows[0];
      await db.query("INSERT INTO user_roles(user_id,role_id) SELECT $1,id FROM roles WHERE name=$2", [user.id, accountType]);
      if (accountType === "CONTRACTOR") {
        const company = await db.query("INSERT INTO companies(name,created_by) VALUES($1,$2) RETURNING id", [companyName, user.id]);
        await db.query("INSERT INTO company_memberships(company_id,user_id,role) VALUES($1,$2,'OWNER')", [company.rows[0].id, user.id]);
      }
      const token = randomBytes(32).toString("base64url");
      await db.query("INSERT INTO sessions(user_id,token_hash,expires_at) VALUES($1,$2,now()+interval '7 days')", [user.id, hash(token)]);
      await db.query("COMMIT");
      return json({ ...user, roles: [accountType] }, 201, { "set-cookie": cookie(token, 604800) });
    } catch (error) {
      await db.query("ROLLBACK").catch(() => {});
      if (error.code === "23505") return json({ error: "Account already exists" }, 409);
      throw error;
    }
  }
  if (path === "/api/auth/login" && request.method === "POST") {
    const input = await body(request);
    const result = await db.query("SELECT * FROM users WHERE email=$1", [input.email?.toLowerCase()]);
    const user = result.rows[0];
    if (!user || !await passwordMatches(input.password || "", user.password_hash, env.PASSWORD_PEPPER || "")) {
      return json({ error: "Invalid credentials" }, 401);
    }
    const token = randomBytes(32).toString("base64url");
    await db.query("INSERT INTO sessions(user_id,token_hash,expires_at) VALUES($1,$2,now()+interval '7 days')", [user.id, hash(token)]);
    const current = await session(new Request(request.url, { headers: { Cookie: `bj_session=${token}` } }), db);
    return json({ ok: true, user: { id: user.id, email: user.email, displayName: user.display_name, roles: current?.roles || [], onboardingPath: user.onboarding_path }, requiresPasswordChange: user.force_password_change }, 200, {
      "set-cookie": cookie(token, 604800),
    });
  }
  if (["/api/auth/password-reset/request", "/api/auth/forgot-password"].includes(path) && request.method === "POST") {
    const email = (await body(request)).email?.trim().toLowerCase();
    if (!email || !resetEmailConfigured(env)) return json({ ok: true });
    const result = await db.query("SELECT id FROM users WHERE email=$1", [email]);
    if (!result.rowCount) return json({ ok: true });
    const token = randomBytes(32).toString("base64url");
    const tokenHash = hash(token);
    await db.query("DELETE FROM password_reset_tokens WHERE user_id=$1 OR expires_at <= now()", [result.rows[0].id]);
    await db.query(
      "INSERT INTO password_reset_tokens(user_id,token_hash,expires_at) VALUES($1,$2,now()+interval '1 hour')",
      [result.rows[0].id, tokenHash],
    );
    try {
      await sendPasswordResetEmail(env, email, token);
    } catch (error) {
      await db.query("DELETE FROM password_reset_tokens WHERE token_hash=$1", [tokenHash]);
      console.error("password reset delivery failed");
    }
    return json({ ok: true });
  }
  if (["/api/auth/password-reset/confirm", "/api/auth/reset-password"].includes(path) && request.method === "POST") {
    const input = await body(request);
    if (!input.token || !input.password || input.password.length < 12) {
      return json({ error: "A valid reset link and a 12-character password are required" }, 400);
    }
    await db.query("BEGIN");
    try {
      const reset = await db.query(
        `UPDATE password_reset_tokens
            SET used_at=now()
          WHERE token_hash=$1 AND used_at IS NULL AND expires_at > now()
        RETURNING user_id`,
        [hash(input.token)],
      );
      if (!reset.rowCount) {
        await db.query("ROLLBACK");
        return json({ error: "This password reset link is invalid or expired" }, 400);
      }
      const password = await passwordHash(input.password, env.PASSWORD_PEPPER || "");
      const user = await db.query(
        "UPDATE users SET password_hash=$1,force_password_change=false,updated_at=now() WHERE id=$2 RETURNING id,email,display_name,onboarding_path",
        [password, reset.rows[0].user_id],
      );
      await db.query("DELETE FROM sessions WHERE user_id=$1", [user.rows[0].id]);
      const token = randomBytes(32).toString("base64url");
      await db.query("INSERT INTO sessions(user_id,token_hash,expires_at) VALUES($1,$2,now()+interval '7 days')", [user.rows[0].id, hash(token)]);
      await db.query("COMMIT");
      const current = await session(new Request(request.url, { headers: { Cookie: `bj_session=${token}` } }), db);
      return json({ ok: true, user: { id: user.rows[0].id, email: user.rows[0].email, displayName: user.rows[0].display_name, roles: current?.roles || [], onboardingPath: user.rows[0].onboarding_path } }, 200, {
        "set-cookie": cookie(token, 604800),
      });
    } catch (error) {
      await db.query("ROLLBACK").catch(() => {});
      throw error;
    }
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
    const history = await db.query("SELECT id,title,details,started_on,ended_on,status,created_at FROM work_history WHERE user_id=$1 ORDER BY started_on DESC NULLS LAST,created_at DESC", [user.id]);
    return json({ passport: result.rows[0] || null, score: scores.rows[0] || { status: "BUILDING" }, scoreHistory: scores.rows, workHistory: history.rows });
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
  if (path === "/api/passport/history" && request.method === "POST") {
    const input = await body(request);
    if (!input.title?.trim() || input.title.length > 160 || (input.details && input.details.length > 4000)) {
      return json({ error: "A work-history title is required" }, 400);
    }
    const result = await db.query(
      "INSERT INTO work_history(user_id,title,details,started_on,ended_on) VALUES($1,$2,$3,$4,$5) RETURNING id,title,details,started_on,ended_on,status,created_at",
      [user.id, input.title.trim(), input.details?.trim() || null, input.startedOn || null, input.endedOn || null],
    );
    return json(result.rows[0], 201);
  }
  if (path === "/api/company" && request.method === "GET") {
    const result = await db.query(
      "SELECT c.id,c.name,c.slug,cm.role FROM companies c JOIN company_memberships cm ON cm.company_id=c.id WHERE cm.user_id=$1 ORDER BY c.created_at LIMIT 1",
      [user.id],
    );
    return json({ company: result.rows[0] || null });
  }
  if (path === "/api/company" && request.method === "PUT") {
    const denied = requireRole(user, "CONTRACTOR");
    if (denied) return denied;
    const input = await body(request);
    const name = input.name?.trim();
    if (!name || name.length > 160) return json({ error: "A company name is required" }, 400);
    const existing = await db.query("SELECT c.id FROM companies c JOIN company_memberships cm ON cm.company_id=c.id WHERE cm.user_id=$1 LIMIT 1", [user.id]);
    const result = existing.rowCount
      ? await db.query("UPDATE companies SET name=$1 WHERE id=$2 RETURNING id,name,slug", [name, existing.rows[0].id])
      : await db.query("INSERT INTO companies(name,created_by) VALUES($1,$2) RETURNING id,name,slug", [name, user.id]);
    if (!existing.rowCount) await db.query("INSERT INTO company_memberships(company_id,user_id,role) VALUES($1,$2,'OWNER')", [result.rows[0].id, user.id]);
    return json({ company: result.rows[0] });
  }
  if (path === "/api/workers" && request.method === "GET") {
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.trim().slice(0, 100) || "";
    const trade = url.searchParams.get("trade")?.trim().slice(0, 100) || "";
    const location = url.searchParams.get("location")?.trim().slice(0, 100) || "";
    const result = await db.query(
      `SELECT u.id,u.display_name,p.trade,p.skills,p.years_experience,p.service_area,p.profile_summary,p.verification_status,
              score.score,ratings.rating,ratings.reliability,COALESCE(history.count,0)::integer work_history_count
         FROM users u JOIN work_passports p ON p.user_id=u.id
         LEFT JOIN LATERAL (SELECT score FROM work_score_snapshots WHERE user_id=u.id ORDER BY created_at DESC LIMIT 1) score ON true
         LEFT JOIN LATERAL (SELECT avg((quality + reliability + communication) / 3.0)::numeric(3,2) rating,avg(reliability)::numeric(3,2) reliability FROM worker_feedback WHERE worker_id=u.id) ratings ON true
         LEFT JOIN LATERAL (SELECT count(*) FROM work_history WHERE user_id=u.id) history ON true
        WHERE ($1='' OR u.display_name ILIKE '%' || $1 || '%' OR p.trade ILIKE '%' || $1 || '%' OR p.skills::text ILIKE '%' || $1 || '%')
          AND ($2='' OR p.trade ILIKE '%' || $2 || '%')
          AND ($3='' OR p.service_area ILIKE '%' || $3 || '%')
        ORDER BY p.verification_status='VERIFIED' DESC, score.score DESC NULLS LAST, u.display_name
        LIMIT 50`,
      [q, trade, location],
    );
    return json({ workers: result.rows });
  }
  const workerMatch = path.match(/^\/api\/workers\/([0-9a-f-]{36})$/i);
  if (workerMatch && request.method === "GET") {
    const profile = await db.query(
      `SELECT u.id,u.display_name,p.trade,p.skills,p.years_experience,p.service_area,p.profile_summary,p.verification_status,
              score.score,ratings.rating,ratings.reliability
         FROM users u JOIN work_passports p ON p.user_id=u.id
         LEFT JOIN LATERAL (SELECT score FROM work_score_snapshots WHERE user_id=u.id ORDER BY created_at DESC LIMIT 1) score ON true
         LEFT JOIN LATERAL (SELECT avg((quality + reliability + communication) / 3.0)::numeric(3,2) rating,avg(reliability)::numeric(3,2) reliability FROM worker_feedback WHERE worker_id=u.id) ratings ON true
        WHERE u.id=$1`,
      [workerMatch[1]],
    );
    if (!profile.rowCount) return json({ error: "Worker not found" }, 404);
    const history = await db.query("SELECT id,title,details,started_on,ended_on,status FROM work_history WHERE user_id=$1 ORDER BY started_on DESC NULLS LAST,created_at DESC", [workerMatch[1]]);
    return json({ worker: profile.rows[0], workHistory: history.rows });
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
  if (path === "/api/admin/dashboard" && request.method === "GET") {
    const denied = requireRole(user, "ADMIN");
    if (denied) return denied;
    const [users, pendingEvidence, openDisputes] = await Promise.all([
      db.query("SELECT count(*)::integer count FROM users"),
      db.query("SELECT count(*)::integer count FROM evidence WHERE status='PENDING'"),
      db.query("SELECT count(*)::integer count FROM disputes WHERE status='OPEN'"),
    ]);
    return json({
      users: users.rows[0].count,
      pendingEvidence: pendingEvidence.rows[0].count,
      openDisputes: openDisputes.rows[0].count,
    });
  }
  return json({ error: "Not found" }, 404);
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return cors(request, new Response(null, { status: 204, headers: { "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS", "Access-Control-Allow-Headers": "content-type" } }));
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      return cors(request, await withDb(env, async (db) => {
        if ((path === "/healthz" || path === "/api/healthz" || path === "/api/readyz") && request.method === "GET") {
          await db.query("SELECT 1");
          return json({ ok: true, database: "connected" });
        }
        const authResponse = await auth(request, env, db, path);
        if (authResponse) return authResponse;
        const user = await session(request, db);
        return api(request, env, db, user, path);
      }));
    } catch (error) {
      console.error("request failed", error.message);
      return cors(request, json({ error: "Service unavailable" }, 503));
    }
  },
};
