import { Client } from "pg";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) throw new Error("DATABASE_URL is required to run migrations");

// Strip parameters unsupported by the pg library (e.g. sslrootcert=system,
// which is a psql-only shorthand for the OS trust store).
const parsedUrl = new URL(rawUrl);
parsedUrl.searchParams.delete("sslrootcert");
const connectionString = parsedUrl.toString();

const client = new Client({ connectionString, ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined });
await client.connect();
try {
  await client.query("BEGIN");
  try {
    await client.query("CREATE SCHEMA IF NOT EXISTS bluejob");
    await client.query("SET search_path TO bluejob");
    await client.query("CREATE TABLE IF NOT EXISTS bluejob.schema_migrations (filename text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
  await client.query("SET search_path TO bluejob");
  const currentUser = await client.query("SELECT current_user");
  console.log("Migration current_user:", currentUser.rows[0].current_user);
  const searchPath = await client.query("SHOW search_path");
  console.log("Migration search_path:", searchPath.rows[0].search_path);
  const applied = new Set((await client.query("SELECT filename FROM bluejob.schema_migrations")).rows.map((row) => row.filename));
  const files = (await readdir(new URL("./migrations/", import.meta.url)))
    .filter((file) => /^\d+_.+\.sql$/.test(file)).sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await readFile(join(new URL("./migrations/", import.meta.url).pathname, file), "utf8");
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("INSERT INTO bluejob.schema_migrations (filename) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`Applied ${file}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw new Error(`Migration ${file} failed: ${error.message}`, { cause: error });
    }
  }
} finally {
  await client.end();
}
