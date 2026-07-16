import { Client } from 'pg';
import { faker } from '@faker-js/faker';

const connectionString = "postgresql://postgres:vw5-dhHq!GMXkim@db.pjqvsupsshffrsiyemvs.supabase.co:5432/postgres";

async function seed() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log("🌱 Starting Sift database seed via PG directly...");

  try {
    // Enable pgcrypto just in case
    await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    console.log("Cleaning up existing data...");
    await client.query(`DELETE FROM auth.users WHERE email LIKE '%@sift.dev' OR email LIKE '%@acmecorp.com' OR email LIKE '%@example.com' OR email LIKE '%@test.com' OR email LIKE '%faker%';`);
    await client.query(`DELETE FROM public.corporates;`); // Cascades down
    await client.query(`DELETE FROM public.users;`);

    const adminId = crypto.randomUUID();
    await client.query(`
      INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
      VALUES ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@sift.dev', crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{"role": "admin", "full_name": "System Admin"}', now(), now());
    `, [adminId]);
    console.log("✅ Admin created");

    const industries = ['Technology', 'Healthcare', 'Finance', 'E-commerce', 'SaaS'];
    const corporates = [];

    for (let i = 0; i < 6; i++) {
      const corpId = crypto.randomUUID();
      await client.query(`
        INSERT INTO public.corporates (id, name, industry, status, onboarded_by_admin_id)
        VALUES ($1, $2, $3, 'approved', $4)
      `, [corpId, faker.company.name(), faker.helpers.arrayElement(industries), adminId]);
      
      corporates.push(corpId);

      const email = i === 0 ? 'recruiter@acmecorp.com' : `recruiter_${i}@faker.com`;
      const recId = crypto.randomUUID();
      await client.query(`
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', $2, crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', $3, now(), now());
      `, [recId, email, JSON.stringify({ role: 'corporate', full_name: faker.person.fullName() })]);

      await client.query(`
        INSERT INTO public.corporate_members (corporate_id, user_id, seat_role)
        VALUES ($1, $2, 'corporate_admin')
      `, [corpId, recId]);
    }
    console.log("✅ 6 Corporates and Recruiters created");

    const jobPostings = [];
    for (let i = 0; i < 20; i++) {
      const jobId = crypto.randomUUID();
      const corpId = faker.helpers.arrayElement(corporates);
      await client.query(`
        INSERT INTO public.job_postings (id, corporate_id, title, description, skills_required, location, employment_type, salary_min, salary_max, status, published_at)
        VALUES ($1, $2, $3, $4, $5, $6, 'Full-time', $7, $8, 'published', now())
      `, [
        jobId, corpId, faker.person.jobTitle(), faker.lorem.paragraphs(3), 
        faker.helpers.arrayElements(['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'SQL'], 3),
        faker.location.city(), faker.number.int({ min: 60000, max: 90000 }), faker.number.int({ min: 100000, max: 150000 })
      ]);
      jobPostings.push(jobId);
    }
    console.log("✅ 20 Job Postings created");

    const students = [];
    for (let i = 0; i < 40; i++) {
      const email = i === 0 ? 'student@example.com' : `student_${i}@faker.com`;
      const stuId = crypto.randomUUID();
      await client.query(`
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', $2, crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', $3, now(), now());
      `, [stuId, email, JSON.stringify({ role: 'student', full_name: faker.person.fullName() })]);
      
      // Update the student profile created by the trigger
      await client.query(`
        UPDATE public.student_profiles 
        SET headline = $1, skills = $2, location = $3, profile_completeness = 100
        WHERE user_id = $4
      `, [faker.person.jobTitle(), faker.helpers.arrayElements(['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'SQL'], 3), faker.location.city(), stuId]);
      
      students.push(stuId);
    }
    console.log("✅ 40 Students created");

    const statuses = ['applied', 'screening', 'shortlisted', 'interview', 'offer', 'hired', 'rejected'];
    for (let i = 0; i < 80; i++) {
      const studentId = faker.helpers.arrayElement(students);
      const jobId = faker.helpers.arrayElement(jobPostings);
      try {
        await client.query(`
          INSERT INTO public.applications (job_id, student_id, status, match_score, internal_rating)
          VALUES ($1, $2, $3, $4, $5)
        `, [jobId, studentId, faker.helpers.arrayElement(statuses), faker.number.int({ min: 50, max: 99 }), faker.number.int({ min: 1, max: 5 })]);
      } catch (e) {
        // Unique constraint might trigger, ignore
      }
    }
    console.log("✅ Applications created");
    console.log("🎉 Seeding complete via direct Postgres connection!");
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await client.end();
  }
}

seed();
