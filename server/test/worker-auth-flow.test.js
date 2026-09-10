import test from "node:test";
import assert from "node:assert/strict";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const { handleRequest } = await import("../src/worker.js");

function normalizeSql(sql) {
  return sql.replace(/\s+/g, " ").trim().toLowerCase();
}

function result(rows = []) {
  return { rows, rowCount: rows.length };
}

class FakeDb {
  constructor() {
    this.nextId = 1;
    this.users = [];
    this.roles = [
      { id: "role-worker", name: "WORKER" },
      { id: "role-contractor", name: "CONTRACTOR" },
      { id: "role-admin", name: "ADMIN" },
      { id: "role-super-admin", name: "SUPER_ADMIN" },
    ];
    this.userRoles = [];
    this.sessions = [];
    this.passwordResetTokens = [];
  }

  id(prefix) {
    return `${prefix}-${this.nextId++}`;
  }

  rolesForUser(userId) {
    return this.userRoles
      .filter((entry) => entry.user_id === userId)
      .map((entry) => this.roles.find((role) => role.id === entry.role_id)?.name)
      .filter(Boolean);
  }

  async query(sql, params = []) {
    const q = normalizeSql(sql);

    if (["begin", "commit", "rollback", "select 1"].includes(q) || q.startsWith("set local search_path")) {
      return result();
    }

    if (q.startsWith("insert into users(email,password_hash,display_name,onboarding_path)")) {
      const email = String(params[0]).toLowerCase();
      if (this.users.some((user) => user.email === email)) {
        const error = new Error("duplicate key");
        error.code = "23505";
        throw error;
      }
      const user = {
        id: this.id("user"),
        name: params[2],
        email,
        password_hash: params[1],
        display_name: params[2],
        onboarding_path: params[3],
        role: params[3],
        force_password_change: false,
        email_verified: false,
        phone: null,
        phone_verified: false,
        mfa_enabled: false,
      };
      this.users.push(user);
      return result([{ id: user.id, email: user.email, display_name: user.display_name, onboarding_path: user.onboarding_path }]);
    }

    if (q.startsWith("insert into user_roles(user_id,role_id) select $1,id from roles where name=$2")) {
      const role = this.roles.find((entry) => entry.name === params[1]);
      if (role && !this.userRoles.some((entry) => entry.user_id === params[0] && entry.role_id === role.id)) {
        this.userRoles.push({ user_id: params[0], role_id: role.id });
      }
      return result();
    }

    if (q.startsWith("insert into sessions(user_id,token_hash,expires_at)")) {
      this.sessions.push({
        id: this.id("session"),
        user_id: params[0],
        token_hash: params[1],
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revoked_at: null,
        mfa_verified_at: null,
      });
      return result();
    }

    if (q.startsWith("select * from users where email=$1")) {
      const user = this.users.find((entry) => entry.email === String(params[0]).toLowerCase());
      return result(user ? [{ ...user }] : []);
    }

    if (q.startsWith("select id, coalesce(password_hash, '') as password_hash from users where email=$1 limit 1")) {
      const user = this.users.find((entry) => entry.email === String(params[0]).toLowerCase());
      return result(user ? [{ id: user.id, password_hash: user.password_hash || "" }] : []);
    }

    if (q.startsWith("select id from users where email=$1")) {
      const user = this.users.find((entry) => entry.email === String(params[0]).toLowerCase());
      return result(user ? [{ id: user.id }] : []);
    }

    if (q.startsWith("delete from password_reset_tokens where user_id=$1 or expires_at <= now()")) {
      this.passwordResetTokens = this.passwordResetTokens.filter((entry) => entry.user_id !== params[0] && entry.expires_at > new Date());
      return result();
    }

    if (q.startsWith("insert into password_reset_tokens(user_id,token_hash,expires_at)")) {
      this.passwordResetTokens.push({
        id: this.id("reset"),
        user_id: params[0],
        token_hash: params[1],
        expires_at: new Date(Date.now() + 60 * 60 * 1000),
        used_at: null,
      });
      return result();
    }

    if (q.startsWith("delete from password_reset_tokens where token_hash=$1")) {
      this.passwordResetTokens = this.passwordResetTokens.filter((entry) => entry.token_hash !== params[0]);
      return result();
    }

    if (q.includes("update password_reset_tokens set used_at=now()")) {
      const token = this.passwordResetTokens.find((entry) => entry.token_hash === params[0] && !entry.used_at && entry.expires_at > new Date());
      if (!token) return result();
      token.used_at = new Date();
      return result([{ user_id: token.user_id }]);
    }

    if (q.startsWith("update users set password_hash=$1,force_password_change=false,updated_at=now() where id=$2 returning id,email,display_name,onboarding_path")) {
      const user = this.users.find((entry) => entry.id === params[1]);
      if (!user) return result();
      user.password_hash = params[0];
      user.force_password_change = false;
      return result([{ id: user.id, email: user.email, display_name: user.display_name, onboarding_path: user.onboarding_path }]);
    }

    if (q.startsWith("delete from sessions where user_id=$1")) {
      this.sessions = this.sessions.filter((entry) => entry.user_id !== params[0]);
      return result();
    }

    if (q.startsWith("update sessions set revoked_at=now() where token_hash=$1")) {
      const session = this.sessions.find((entry) => entry.token_hash === params[0]);
      if (session) session.revoked_at = new Date();
      return result();
    }

    if (q.includes("from sessions s join users u on u.id = s.user_id")) {
      const session = this.sessions.find((entry) => entry.token_hash === params[0] && !entry.revoked_at && entry.expires_at > new Date());
      if (!session) return result();
      const user = this.users.find((entry) => entry.id === session.user_id);
      if (!user) return result();
      return result([{ ...user, roles: this.rolesForUser(user.id), mfa_verified_at: session.mfa_verified_at }]);
    }

    throw new Error(`Unhandled SQL in test fake: ${sql}`);
  }
}

function createEnv() {
  return {
    APP_ORIGIN: "https://bluejob.net",
    PASSWORD_PEPPER: "pepper",
    EMAIL_PROVIDER_URL: "https://mailer.example.test/reset",
  };
}

async function call(db, env, path, options = {}) {
  const headers = new Headers(options.headers || {});
  const init = { method: options.method || "GET", headers };
  if (options.body !== undefined) {
    init.body = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
    if (!headers.has("content-type")) headers.set("content-type", "application/json");
  }
  if (options.cookie) headers.set("Cookie", options.cookie);
  const response = await handleRequest(new Request(`https://bluejob.net${path}`, init), env, db);
  const text = await response.text();
  return {
    status: response.status,
    body: text ? JSON.parse(text) : {},
    headers: response.headers,
    cookie: response.headers.get("set-cookie"),
  };
}

function sessionCookie(setCookie) {
  const value = setCookie?.match(/bj_session=([^;]*)/)?.[1];
  return value ? `bj_session=${value}` : "";
}

test("registration stores a hashed password and starts an authenticated session", async () => {
  const db = new FakeDb();
  const env = createEnv();

  const response = await call(db, env, "/api/auth/signup", {
    method: "POST",
    body: { name: "Casey Worker", email: "casey@example.com", password: "BlueJobPass123!" },
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.ok, true);
  assert.equal(response.body.user.email, "casey@example.com");
  assert.match(response.cookie || "", /HttpOnly/);
  assert.match(response.cookie || "", /SameSite=Lax/);
  assert.equal(db.users.length, 1);
  assert.notEqual(db.users[0].password_hash, "BlueJobPass123!");
  assert.match(db.users[0].password_hash, /^pbkdf2\$/);

  const me = await call(db, env, "/api/me", { cookie: sessionCookie(response.cookie) });
  assert.equal(me.status, 200);
  assert.equal(me.body.user.email, "casey@example.com");
});

test("login rejects an invalid password", async () => {
  const db = new FakeDb();
  const env = createEnv();

  await call(db, env, "/api/auth/signup", {
    method: "POST",
    body: { name: "Casey Worker", email: "casey@example.com", password: "BlueJobPass123!" },
  });

  const response = await call(db, env, "/api/auth/login", {
    method: "POST",
    body: { email: "casey@example.com", password: "wrong-password" },
  });

  assert.equal(response.status, 401);
  assert.equal(response.body.error, "Invalid email or password");
});

test("login session persists across authenticated requests and logout revokes it", async () => {
  const db = new FakeDb();
  const env = createEnv();

  await call(db, env, "/api/auth/signup", {
    method: "POST",
    body: { name: "Casey Worker", email: "casey@example.com", password: "BlueJobPass123!" },
  });

  const login = await call(db, env, "/api/auth/login", {
    method: "POST",
    body: { email: "casey@example.com", password: "BlueJobPass123!" },
  });
  assert.equal(login.status, 200);

  const cookie = sessionCookie(login.cookie);
  const me = await call(db, env, "/api/me", { cookie });
  assert.equal(me.status, 200);
  assert.equal(me.body.user.email, "casey@example.com");

  const logout = await call(db, env, "/api/auth/logout", { method: "POST", cookie });
  assert.equal(logout.status, 200);
  assert.match(logout.cookie || "", /Max-Age=0/);

  const meAfterLogout = await call(db, env, "/api/me", { cookie });
  assert.equal(meAfterLogout.status, 401);
});

test("forgot password creates a single-use reset token and sends a reset link", async (t) => {
  const db = new FakeDb();
  const env = createEnv();
  const outbound = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    outbound.push({ url, options, body: JSON.parse(options.body) });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } });
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  await call(db, env, "/api/auth/signup", {
    method: "POST",
    body: { name: "Casey Worker", email: "casey@example.com", password: "BlueJobPass123!" },
  });

  const response = await call(db, env, "/api/auth/forgot-password", {
    method: "POST",
    body: { email: "casey@example.com" },
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.ok, true);
  assert.equal(db.passwordResetTokens.length, 1);
  assert.equal(outbound.length, 1);
  const resetUrl = new URL(outbound[0].body.resetUrl);
  assert.equal(resetUrl.origin, "https://bluejob.net");
  assert.equal(resetUrl.pathname, "/reset-password");
  assert.ok(resetUrl.searchParams.get("token"));
  assert.equal(db.passwordResetTokens[0].used_at, null);
});

test("password reset rejects invalid and expired reset tokens", async (t) => {
  const db = new FakeDb();
  const env = createEnv();
  const outbound = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_url, options) => {
    outbound.push(JSON.parse(options.body));
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } });
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  await call(db, env, "/api/auth/signup", {
    method: "POST",
    body: { name: "Casey Worker", email: "casey@example.com", password: "BlueJobPass123!" },
  });

  const invalid = await call(db, env, "/api/auth/reset-password", {
    method: "POST",
    body: { token: "not-a-real-token", password: "BlueJobReset123!" },
  });
  assert.equal(invalid.status, 400);
  assert.equal(invalid.body.error, "This password reset link is invalid or expired");

  await call(db, env, "/api/auth/forgot-password", {
    method: "POST",
    body: { email: "casey@example.com" },
  });
  const token = new URL(outbound[0].resetUrl).searchParams.get("token");
  db.passwordResetTokens[0].expires_at = new Date(Date.now() - 1000);

  const expired = await call(db, env, "/api/auth/reset-password", {
    method: "POST",
    body: { token, password: "BlueJobReset123!" },
  });
  assert.equal(expired.status, 400);
  assert.equal(expired.body.error, "This password reset link is invalid or expired");
});

test("password reset invalidates the token, clears old sessions, and allows login with the new password", async (t) => {
  const db = new FakeDb();
  const env = createEnv();
  const outbound = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_url, options) => {
    outbound.push(JSON.parse(options.body));
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } });
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  await call(db, env, "/api/auth/signup", {
    method: "POST",
    body: { name: "Casey Worker", email: "casey@example.com", password: "BlueJobPass123!" },
  });

  const login = await call(db, env, "/api/auth/login", {
    method: "POST",
    body: { email: "casey@example.com", password: "BlueJobPass123!" },
  });
  assert.equal(login.status, 200);
  assert.ok(db.sessions.length > 0);

  await call(db, env, "/api/auth/forgot-password", {
    method: "POST",
    body: { email: "casey@example.com" },
  });
  const token = new URL(outbound[0].resetUrl).searchParams.get("token");

  const reset = await call(db, env, "/api/auth/reset-password", {
    method: "POST",
    body: { token, password: "BlueJobReset123!" },
  });
  assert.equal(reset.status, 200);
  assert.equal(reset.body.ok, true);
  assert.equal(reset.body.redirectTo, "/signin");
  assert.match(reset.cookie || "", /Max-Age=0/);
  assert.equal(db.sessions.length, 0);
  assert.ok(db.passwordResetTokens[0].used_at instanceof Date);

  const reuse = await call(db, env, "/api/auth/reset-password", {
    method: "POST",
    body: { token, password: "BlueJobAgain123!" },
  });
  assert.equal(reuse.status, 400);

  const oldLogin = await call(db, env, "/api/auth/login", {
    method: "POST",
    body: { email: "casey@example.com", password: "BlueJobPass123!" },
  });
  assert.equal(oldLogin.status, 401);

  const newLogin = await call(db, env, "/api/auth/login", {
    method: "POST",
    body: { email: "casey@example.com", password: "BlueJobReset123!" },
  });
  assert.equal(newLogin.status, 200);

  const me = await call(db, env, "/api/me", { cookie: sessionCookie(newLogin.cookie) });
  assert.equal(me.status, 200);
  assert.equal(me.body.user.email, "casey@example.com");
});
