import { Client } from 'pg';

const connectionString = "postgresql://postgres:vw5-dhHq!GMXkim@db.pjqvsupsshffrsiyemvs.supabase.co:5432/postgres";

async function main() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("Connected to Supabase Postgres.");

    const sql = `
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (
    new.id,
    new.email,
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role)
  );
  
  IF (new.raw_user_meta_data->>'role') = 'student' THEN
    INSERT INTO public.student_profiles (user_id, full_name) VALUES (new.id, new.raw_user_meta_data->>'full_name');
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
    `;
    console.log("Applying fixed trigger...");
    await client.query(sql);
    console.log("✅ Trigger applied successfully!");
  } catch (err) {
    console.error("Error executing schema:", err);
  } finally {
    await client.end();
  }
}
main();
