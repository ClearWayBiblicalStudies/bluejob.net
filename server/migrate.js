import { Client } from "pg";
import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required to run migrations");

const client = new Client({ connectionString, ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined });
await client.connect();
try {
  await client.query("CREATE TABLE IF NOT EXISTS schema_migrations (filename text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
  const applied = new Set((await client.query("SELECT filename FROM schema_migrations")).rows.map((row) => row.filename));
  const files = (await readdir(new URL("./migrations/", import.meta.url)))
    .filter((file) => /^\d+_.+\.sql$/.test(file)).sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await readFile(join(new URL("./migrations/", import.meta.url).pathname, file), "utf8");
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
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
