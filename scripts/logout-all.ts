import { Client } from 'pg';

const connectionString = "postgresql://postgres:vw5-dhHq!GMXkim@db.pjqvsupsshffrsiyemvs.supabase.co:5432/postgres";

async function logoutAllUsers() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log("🔥 Force logging out all users by terminating active sessions...");

  try {
    await client.query(`DELETE FROM auth.sessions;`);
    await client.query(`DELETE FROM auth.refresh_tokens;`);
    
    console.log("✅ All user sessions have been terminated. Everyone is now logged out.");
  } catch (err) {
    console.error("Logout error:", err);
  } finally {
    await client.end();
  }
}

logoutAllUsers();
