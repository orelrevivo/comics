import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function reset() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  const sql = neon(process.env.DATABASE_URL);
  
  console.log("Dropping all tables...");
  await sql`DROP TABLE IF EXISTS images CASCADE;`;
  await sql`DROP TABLE IF EXISTS chapters CASCADE;`;
  await sql`DROP TABLE IF EXISTS stories CASCADE;`;
  await sql`DROP TABLE IF EXISTS users CASCADE;`;
  console.log("All tables dropped successfully!");
}

reset().catch(console.error);
