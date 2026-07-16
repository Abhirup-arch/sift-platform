import { Client } from 'pg';

const connectionString = "postgresql://postgres:vw5-dhHq!GMXkim@db.pjqvsupsshffrsiyemvs.supabase.co:5432/postgres";

async function main() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    
    const sql = `
      INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
      VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'test_${Date.now()}@test.com',
        'pass',
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"role": "student", "full_name": "Test Student"}',
        now(),
        now()
      );
    `;
    await client.query(sql);
    console.log("✅ Inserted into auth.users successfully!");
  } catch (err) {
    console.error("Error executing insert:", err);
  } finally {
    await client.end();
  }
}
main();
