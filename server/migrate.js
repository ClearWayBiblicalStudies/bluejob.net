import { Client } from "pg";
import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required to run migrations");

const client = new Client({ connectionString, ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined });
await client.connect();
try {
  const context = await client.query("SELECT current_user, current_database(), current_schema()");
  console.log("Migration database context:", context.rows[0]);
  await client.query("BEGIN");
  try {
    await client.query("CREATE SCHEMA IF NOT EXISTS bluejob");
    await client.query("SET search_path TO bluejob, public");
    await client.query("CREATE TABLE IF NOT EXISTS bluejob.schema_migrations (filename text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
  await client.query("SET search_path TO bluejob, public");
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
