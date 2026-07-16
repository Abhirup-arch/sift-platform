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
    await client.query(`DELETE FROM public.corporates;`);
    await client.query(`DELETE FROM public.users;`);
    await client.query(`DELETE FROM auth.users WHERE email LIKE '%@sift.dev' OR email LIKE '%@acmecorp.com' OR email LIKE '%@example.com' OR email LIKE '%@test.com' OR email LIKE '%faker%';`);

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      'https://pjqvsupsshffrsiyemvs.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: adminData } = await supabase.auth.admin.createUser({
      email: 'admin@sift.dev',
      password: 'password123',
      email_confirm: true,
      user_metadata: { role: 'admin', full_name: 'System Admin' }
    });
    const adminId = adminData.user.id;
    await client.query(`
      INSERT INTO public.users (id, email, role)
      VALUES ($1, 'admin@sift.dev', 'admin')
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

      let recId;
      if (i === 0) {
        const { data: recData } = await supabase.auth.admin.createUser({
          email: 'recruiter@acmecorp.com',
          password: 'password123',
          email_confirm: true,
          user_metadata: { role: 'corporate', full_name: faker.person.fullName() }
        });
        recId = recData.user.id;
        await client.query(`
          INSERT INTO public.users (id, email, role) VALUES ($1, 'recruiter@acmecorp.com', 'corporate')
        `, [recId]);
      } else {
        const email = `recruiter_${i}@faker.com`;
        recId = crypto.randomUUID();
        await client.query(`
          INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
          VALUES ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', $2, crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', $3, now(), now());
        `, [recId, email, JSON.stringify({ role: 'corporate', full_name: faker.person.fullName() })]);
        await client.query(`INSERT INTO public.users (id, email, role) VALUES ($1, $2, 'corporate')`, [recId, email]);
      }

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
      let stuId;
      if (i === 0) {
        const { data: stuData } = await supabase.auth.admin.createUser({
          email: 'student@example.com',
          password: 'password123',
          email_confirm: true,
          user_metadata: { role: 'student', full_name: faker.person.fullName() }
        });
        stuId = stuData.user.id;
        await client.query(`INSERT INTO public.users (id, email, role) VALUES ($1, 'student@example.com', 'student')`, [stuId]);
        await client.query(`INSERT INTO public.student_profiles (user_id, full_name) VALUES ($1, $2)`, [stuId, faker.person.fullName()]);
      } else {
        const email = `student_${i}@faker.com`;
        stuId = crypto.randomUUID();
        await client.query(`
          INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
          VALUES ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', $2, crypt('password123', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', $3, now(), now());
        `, [stuId, email, JSON.stringify({ role: 'student', full_name: faker.person.fullName() })]);
        await client.query(`INSERT INTO public.users (id, email, role) VALUES ($1, $2, 'student')`, [stuId, email]);
        await client.query(`INSERT INTO public.student_profiles (user_id, full_name) VALUES ($1, $2)`, [stuId, faker.person.fullName()]);
      }
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
