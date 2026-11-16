import pg from "pg";

const client = new pg.Client({
  connectionString: process.env.CAMPUS_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const { rows: comms } = await client.query("select id, name, slug from public.communities");
console.log("Communities in DB:", comms);

await client.end();








