/**
 * One-shot migration script.
 * Usage: SUPABASE_DB_PASSWORD=xxx node scripts/run-migration.mjs
 *
 * Get your DB password from:
 *   Supabase Dashboard → Settings → Database → Connection string
 *   (the password you set when creating the project, or reset under Database → Reset password)
 */
import postgres from "postgres";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const sql_text = readFileSync(resolve(__dir, "../supabase/migrations/20260316_commercial_profile.sql"), "utf8");

const password = process.env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error("Error: SUPABASE_DB_PASSWORD env var is required.");
  console.error("Usage: SUPABASE_DB_PASSWORD=your_password node scripts/run-migration.mjs");
  console.error("\nFind your password in: Supabase Dashboard → Settings → Database → Connection string");
  process.exit(1);
}

const sql = postgres({
  host: "db.dexcoogqjemuomvbvlye.supabase.co",
  port: 5432,
  database: "postgres",
  username: "postgres",
  password,
  ssl: "require",
});

try {
  console.log("Running migration...");
  await sql.unsafe(sql_text);
  console.log("✓ Migration applied — tables created (or already existed).");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exit(1);
} finally {
  await sql.end();
}
