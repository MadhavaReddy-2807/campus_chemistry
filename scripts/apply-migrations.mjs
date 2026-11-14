import { readFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const { Client } = pg;
const databaseUrl = process.env.CAMPUS_DATABASE_URL;
if (!databaseUrl) throw new Error("CAMPUS_DATABASE_URL is required and is intentionally not stored in the repository.");

const root = process.cwd();
const migrationsDir = path.join(root, "supabase", "migrations");
const files = (await readdir(migrationsDir)).filter((file) => file.endsWith(".sql")).sort();
const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });

try {
  await client.connect();
  for (const file of files) {
    process.stdout.write(`Applying ${file}... `);
    await client.query(await readFile(path.join(migrationsDir, file), "utf8"));
    console.log("ok");
  }
  process.stdout.write("Applying seed.sql... ");
  await client.query(await readFile(path.join(root, "supabase", "seed.sql"), "utf8"));
  console.log("ok");
  const { rows: [summary] } = await client.query(`
    select
      (select count(*)::int from public.institutes) as institutes,
      (select count(*)::int from public.institute_domains) as domains,
      (select count(*)::int from public.interests) as interests,
      (select count(*)::int from public.profile_prompts) as prompts,
      (select count(*)::int from pg_proc where pronamespace = 'public'::regnamespace and proname in ('register_discovery_action', 'rsvp_event')) as protected_functions,
      (select count(*)::int from pg_class where relnamespace = 'public'::regnamespace and relrowsecurity) as rls_tables
  `);
  console.log(JSON.stringify(summary));
} finally {
  await client.end().catch(() => undefined);
}
