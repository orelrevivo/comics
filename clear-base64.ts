import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './db/schema';
import * as dotenv from 'dotenv';
import { like } from 'drizzle-orm';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('No DATABASE_URL found in env vars');
    return;
  }

  const sql = neon(connectionString);
  const db = drizzle(sql, { schema });

  console.log('Cleaning up massive base64 images from the database...');
  
  try {
    const result = await db.delete(schema.images).where(like(schema.images.imageUrl, 'data:image/%'));
    console.log('Successfully deleted base64 images from DB!');
  } catch (error) {
    console.error('Error deleting images:', error);
  }
}

main();
