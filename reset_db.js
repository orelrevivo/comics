const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
dotenv.config();

async function resetDb() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('Dropping individual tables...');
    await sql`DROP TABLE IF EXISTS "poll_votes", "poll_options", "polls", "post_likes", "images", "community_posts", "chapters", "stories", "users" CASCADE;`;
    
    console.log('Dropping drizzle schema...');
    await sql`DROP SCHEMA IF EXISTS drizzle CASCADE;`;
    
    console.log('Database wipe successful! You can now run npx drizzle-kit push.');
  } catch (error) {
    console.error('Error resetting database:', error);
  }
}

resetDb();
