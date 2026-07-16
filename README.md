# Sift — AI Resume & Hiring Pipeline Platform

Sift is a multi-tenant platform designed to turn paper resumes into structured hiring signals. It serves three audiences: Students (Candidates), Corporates (Recruiters/HR), and Platform Admins.

## Stack
- Next.js 15 (App Router)
- Supabase (Auth, Postgres DB, Storage)
- Tailwind CSS v4 + Shadcn UI
- Framer Motion & dnd-kit

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Fill in your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Fill in your `SUPABASE_SERVICE_ROLE_KEY` if you plan to run the seed script.

## Demo Credentials (Seeded)

If you have run the seed script, you can use the following credentials to explore the platform:

**Admin Account:**
- Email: `admin@sift.dev`
- Password: `password123`

**Corporate / HR Account:**
- Email: `recruiter@acmecorp.com`
- Password: `password123`

**Student / Candidate Account:**
- Email: `student@example.com`
- Password: `password123`

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.
