import pg from "pg";

const client = new pg.Client({
  connectionString: process.env.CAMPUS_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const { rows: cols } = await client.query(
  "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'discovery_preferences'"
);
console.log("Columns of discovery_preferences:", cols);

await client.end();









