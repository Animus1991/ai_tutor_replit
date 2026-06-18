import pg from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
  console.log("pgvector extension is enabled.");
} finally {
  await client.end();
}
