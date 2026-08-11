import { Client } from "pg";
import { createHash, randomBytes, randomUUID } from "node:crypto";

const publicPaths = new Set(["/api/healthz", "/api/readyz", "/api/auth/register", "/api/auth/login"]);
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
  const client = new Client({ connectionString: env.HYPERDRIVE.connectionString });
  await client.connect();
  try {
    return await callback(client);
  } finally {
    await client.end().catch(() => {});
  }
}

async function passwordHash(password, pepper) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${pepper}:${password}`));
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

function requireRole(user, role) {
  if (!user || !user.roles.includes(role)) return json({ error: "Forbidden" }, 403);
  return null;
}

async function auth(request, env, db, path) {
  if (path === "/api/auth/register" && request.method === "POST") {
    const input = await body(request);
    if (!input.email || !input.password || input.password.length < 12 || !input.displayName) {
      return json({ error: "email, displayName, and a 12-character password are required" }, 400);
    }
    const password = await passwordHash(input.password, env.PASSWORD_PEPPER || "");
    try {
      const result = await db.query(
        "INSERT INTO users(email,password_hash,display_name) VALUES($1,$2,$3) RETURNING id,email,display_name",
        [input.email.toLowerCase(), password, input.displayName],
      );
      await db.query("INSERT INTO user_roles(user_id,role_id) SELECT $1,id FROM roles WHERE name='WORKER'", [result.rows[0].id]);
      return json(result.rows[0], 201);
    } catch (error) {
      if (error.code === "23505") return json({ error: "Account already exists" }, 409);
      throw error;
    }
  }
  if (path === "/api/auth/login" && request.method === "POST") {
    const input = await body(request);
    const result = await db.query("SELECT * FROM users WHERE email=$1", [input.email?.toLowerCase()]);
    const user = result.rows[0];
    if (!user || user.password_hash !== await passwordHash(input.password || "", env.PASSWORD_PEPPER || "")) {
      return json({ error: "Invalid credentials" }, 401);
    }
    const token = randomBytes(32).toString("base64url");
    await db.query("INSERT INTO sessions(user_id,token_hash,expires_at) VALUES($1,$2,now()+interval '7 days')", [user.id, hash(token)]);
    return json({ ok: true, requiresPasswordChange: user.force_password_change }, 200, {
      "set-cookie": cookie(token, 604800),
    });
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
    if (request.method === "OPTIONS") return cors(request, new Response(null, { status: 204, headers: { "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS", "Access-Control-Allow-Headers": "content-type" } }));
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === "/api/healthz") return cors(request, json({ ok: true, service: "bluejob-api" }));
    try {
      return cors(request, await withDb(env, async (db) => {
        if (path === "/api/readyz") {
          await db.query("SELECT 1");
          return json({ ok: true, database: "ready" });
        }
        const user = await session(request, db);
        const authResponse = await auth(request, env, db, path);
        return authResponse || await api(request, env, db, user, path);
      }));
    } catch (error) {
      console.error("request failed", error.message);
      return cors(request, json({ error: "Service unavailable" }, 503));
    }
  },
};
