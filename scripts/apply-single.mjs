import { readFile } from "node:fs/promises";
import pg from "pg";

const sqlFile = process.argv[2];
if (!sqlFile) throw new Error("Please specify SQL file path");

const client = new pg.Client({
  connectionString: process.env.CAMPUS_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
const sql = await readFile(sqlFile, "utf8");
await client.query(sql);
console.log(`Successfully applied: ${sqlFile}`);
await client.end();
