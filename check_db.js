const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
dotenv.config();

async function checkSchema() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'community_posts';
    `;
    console.log(result);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSchema();
