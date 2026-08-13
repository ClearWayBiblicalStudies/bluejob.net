import { Client } from "pg";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const schema = "bluejob";
const migrationTable = `${schema}.schema_migrations`;
const lockName = "bluejob:migrations";

function connectionStringFrom(value) {
  const line = value?.split(/\r?\n/).map((entry) => entry.trim()).find(
    (entry) => /^(?:[A-Za-z_][A-Za-z0-9_]*=)?postgres(?:ql)?:\/\//i.test(entry),
  );

  if (!line) throw new Error("DATABASE_URL is required to run migrations");

  const uri = line.replace(/^[A-Za-z_][A-Za-z0-9_]*=/, "");
  let url;
  try {
    url = new URL(uri);
  } catch {
    throw new Error("DATABASE_URL must contain a valid PostgreSQL URI");
  }

  if (![
    "postgres:",
    "postgresql:",
  ].includes(url.protocol) || !url.username || !url.password || !url.hostname || !url.pathname || url.pathname === "/") {
    throw new Error("DATABASE_URL must contain PostgreSQL credentials, host, and database");
  }

  url.searchParams.delete("sslrootcert");
  return url.toString();
}

const client = new Client({
  connectionString: connectionStringFrom(process.env.DATABASE_URL),
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

const migrationDirectory = fileURLToPath(new URL("./migrations/", import.meta.url));
let connected = false;
let lockAcquired = false;

try {
  await client.connect();
  connected = true;
  await client.query("SELECT pg_advisory_lock(hashtext($1))", [lockName]);
  lockAcquired = true;

  const identity = await client.query("SELECT current_user, current_database()");
  console.log("Migration current_user:", identity.rows[0].current_user);
  console.log("Migration current_database:", identity.rows[0].current_database);
  console.log("Migration schema:", schema);

  await client.query("BEGIN");
  try {
    const schemaExists = await client.query(
      "SELECT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = $1) AS exists",
      [schema],
    );

    if (!schemaExists.rows[0].exists) {
      throw new Error(`${schema} schema is missing`);
    }

    await client.query(
      `CREATE TABLE IF NOT EXISTS ${migrationTable} (
        filename text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )`,
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }

  const applied = new Set(
    (await client.query(`SELECT filename FROM ${migrationTable}`)).rows.map((row) => row.filename),
  );
  const files = (await readdir(migrationDirectory))
    .filter((file) => /^\d+_.+\.sql$/.test(file))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;

    const sql = await readFile(join(migrationDirectory, file), "utf8");
    await client.query("BEGIN");
    try {
      await client.query(`SET LOCAL search_path TO ${schema}, pg_catalog`);
      await client.query(sql);
      await client.query(`INSERT INTO ${migrationTable} (filename) VALUES ($1)`, [file]);
      await client.query("COMMIT");
      console.log(`Applied ${file}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw new Error(`Migration ${file} failed: ${error.message}`, { cause: error });
    }
  }
} finally {
  try {
    if (lockAcquired) {
      await client.query("SELECT pg_advisory_unlock(hashtext($1))", [lockName]);
    }
  } finally {
    if (connected) {
      await client.end();
    }
  }
}
