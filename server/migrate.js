import { Client } from "pg";
import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required to run migrations");

const client = new Client({ connectionString, ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined });
await client.connect();
try {
  // Create the bluejob schema if it does not exist. On some hosted providers
  // (e.g. PlanetScale) the database user may lack CREATE privilege on the
  // database but the schema may have been pre-created by the provider.
  const schemaCheck = await client.query("SELECT to_regnamespace('bluejob') IS NOT NULL AS schema_exists");
  const schemaCreationNeeded = !schemaCheck.rows[0].schema_exists;

  if (schemaCreationNeeded) {
    try {
      await client.query("CREATE SCHEMA IF NOT EXISTS bluejob");
      console.log("bluejob schema created.");
    } catch (createError) {
      if (createError.code !== "42501") {
        throw createError;
      }
      // 42501: permission denied — re-check in case the schema was just created
      // by a concurrent process or is otherwise now visible.
      const recheck = await client.query("SELECT to_regnamespace('bluejob') IS NOT NULL AS schema_exists");
      if (!recheck.rows[0].schema_exists) {
        throw new Error(
          "bluejob schema does not exist and the database user lacks permission to create it (error 42501). " +
          "Grant CREATE on database to the migration user, or pre-create the bluejob schema manually."
        );
      }
      console.log("bluejob schema exists (pre-created by provider) — skipping CREATE SCHEMA.");
    }
  }

  await client.query("BEGIN");
  try {
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
