import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const migrationDirs = [
  path.join(repoRoot, "lib", "db", "migrations"),
  path.join(__dirname, "migrations"),
];

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

function collectFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .map((name) => ({ dir, name, full: path.join(dir, name) }));
}

const files = migrationDirs.flatMap(collectFiles);

if (files.length === 0) {
  console.log("No migration files found.");
  process.exit(0);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  for (const file of files) {
    const sql = fs.readFileSync(file.full, "utf8");
    const rel = path.relative(repoRoot, file.full).replace(/\\/g, "/");
    console.log(`Applying ${rel}...`);
    await client.query(sql);
  }
  console.log("Migrations applied.");
} finally {
  await client.end();
}
