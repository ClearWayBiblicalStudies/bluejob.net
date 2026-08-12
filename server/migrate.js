import { Client } from "pg";
import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required to run migrations");

const client = new Client({ connectionString, ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined });
await client.connect();
try {
  const bluejobSchemaExists = (
    await client.query("SELECT to_regnamespace('bluejob') IS NOT NULL AS schema_exists")
  ).rows[0].schema_exists;
  const targetSchema = bluejobSchemaExists ? "bluejob" : "public";
  const migrationTable = `${targetSchema}.schema_migrations`;

  if (!bluejobSchemaExists) {
    console.log("bluejob schema not found; falling back to public schema.");
  }

  await client.query("BEGIN");
  try {
    await client.query(`SET search_path TO ${targetSchema}`);
    await client.query(`CREATE TABLE IF NOT EXISTS ${migrationTable} (filename text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
  await client.query(`SET search_path TO ${targetSchema}`);
  const currentUser = await client.query("SELECT current_user");
  console.log("Migration current_user:", currentUser.rows[0].current_user);
  const searchPath = await client.query("SHOW search_path");
  console.log("Migration search_path:", searchPath.rows[0].search_path);
  console.log("Migration schema:", targetSchema);
  const applied = new Set((await client.query(`SELECT filename FROM ${migrationTable}`)).rows.map((row) => row.filename));
  const files = (await readdir(new URL("./migrations/", import.meta.url)))
    .filter((file) => /^\d+_.+\.sql$/.test(file)).sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    let sql = await readFile(join(new URL("./migrations/", import.meta.url).pathname, file), "utf8");
    if (targetSchema !== "bluejob") {
      sql = sql.replaceAll("bluejob.", `${targetSchema}.`);
    }
    await client.query("BEGIN");
    try {
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
  await client.end();
}
