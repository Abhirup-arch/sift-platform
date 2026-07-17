import { Client } from 'pg';

const connectionString = "postgresql://postgres:vw5-dhHq!GMXkim@db.pjqvsupsshffrsiyemvs.supabase.co:5432/postgres";

async function wipeDatabase() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log("🔥 Initiating total database wipe...");

  try {
    // Delete in order to respect foreign key constraints
    console.log("Deleting applications...");
    await client.query(`DELETE FROM public.applications;`);
    
    console.log("Deleting job postings...");
    await client.query(`DELETE FROM public.job_postings;`);
    
    console.log("Deleting corporate members...");
    await client.query(`DELETE FROM public.corporate_members;`);
    
    console.log("Deleting corporates...");
    await client.query(`DELETE FROM public.corporates;`);
    
    console.log("Deleting student profiles...");
    await client.query(`DELETE FROM public.student_profiles;`);
    
    console.log("Deleting public users...");
    await client.query(`DELETE FROM public.users;`);
    
    console.log("Deleting ALL auth users (website accounts)...");
    await client.query(`DELETE FROM auth.users;`);
    
    console.log("✅ WIPE COMPLETE. The website database is completely empty.");
  } catch (err) {
    console.error("Wipe error:", err);
  } finally {
    await client.end();
  }
}

wipeDatabase();
