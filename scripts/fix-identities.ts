import { Client } from 'pg';

const connectionString = "postgresql://postgres:vw5-dhHq!GMXkim@db.pjqvsupsshffrsiyemvs.supabase.co:5432/postgres";

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  const { rows } = await client.query('SELECT id, email FROM auth.users WHERE id NOT IN (SELECT user_id FROM auth.identities)');
  for (const row of rows) {
    await client.query(`
      INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id)
      VALUES ($1::text, $1::uuid, $2, 'email', now(), now(), now(), gen_random_uuid())
    `, [row.id, JSON.stringify({ sub: row.id, email: row.email })]);
  }
  console.log(`Fixed ${rows.length} identities.`);
  await client.end();
}
main();
