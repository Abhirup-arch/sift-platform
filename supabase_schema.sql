-- Supabase Schema for Sift

-- Enums
CREATE TYPE user_role AS ENUM ('student', 'admin', 'corporate');
CREATE TYPE corporate_plan AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE corporate_status AS ENUM ('pending', 'approved', 'suspended');
CREATE TYPE seat_role AS ENUM ('recruiter', 'hiring_manager', 'corporate_admin');
CREATE TYPE job_status AS ENUM ('draft', 'pending_approval', 'published', 'closed');
CREATE TYPE application_status AS ENUM ('applied', 'screening', 'shortlisted', 'interview', 'offer', 'hired', 'rejected');
CREATE TYPE interview_mode AS ENUM ('video', 'phone', 'onsite');

-- 1. User
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. StudentProfile
CREATE TABLE public.student_profiles (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  location TEXT,
  headline TEXT,
  education JSONB[], -- Array of objects: { degree, school, year }
  skills TEXT[],
  links JSONB, -- { linkedin, github, portfolio }
  profile_completeness INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Resume
CREATE TABLE public.resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.student_profiles(user_id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  parsed_json JSONB,
  ats_score INT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Corporate
CREATE TABLE public.corporates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  industry TEXT,
  website TEXT,
  plan corporate_plan DEFAULT 'free',
  status corporate_status DEFAULT 'pending',
  onboarded_by_admin_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CorporateMember (Multi-seat)
CREATE TABLE public.corporate_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  corporate_id UUID REFERENCES public.corporates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  seat_role seat_role DEFAULT 'recruiter',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(corporate_id, user_id)
);

-- 6. JobPosting
CREATE TABLE public.job_postings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  corporate_id UUID REFERENCES public.corporates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[],
  skills_required TEXT[],
  location TEXT,
  employment_type TEXT,
  salary_min INT,
  salary_max INT,
  status job_status DEFAULT 'draft',
  created_by UUID REFERENCES public.users(id),
  approved_by_admin_id UUID REFERENCES public.users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Application
CREATE TABLE public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.student_profiles(user_id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.resumes(id),
  status application_status DEFAULT 'applied',
  status_history JSONB[], -- { status, timestamp, changed_by }
  match_score INT,
  internal_rating INT CHECK (internal_rating >= 1 AND internal_rating <= 5),
  internal_notes JSONB[], -- { author_id, note, timestamp }
  tags TEXT[],
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, student_id)
);

-- 8. InterviewSchedule
CREATE TABLE public.interview_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  mode interview_mode DEFAULT 'video',
  meeting_link TEXT,
  interviewer_ids UUID[], -- Array of user_ids from corporate_members
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Notification
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  related_entity JSONB, -- { type: 'application', id: 'uuid' }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ActivityLog
CREATE TABLE public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies Setup

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corporates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corporate_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Basic Policies (simplified for immediate scaffolding)

-- Users can read their own user data, Admins read all
CREATE POLICY "Users view own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins view all users" ON public.users FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Students edit own profile
CREATE POLICY "Student manage own profile" ON public.student_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Corporate read students" ON public.student_profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'corporate'));
CREATE POLICY "Admin read all students" ON public.student_profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Corporates
CREATE POLICY "Anyone read approved corporates" ON public.corporates FOR SELECT USING (status = 'approved');
CREATE POLICY "Admins manage corporates" ON public.corporates FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Members view own corporate" ON public.corporates FOR SELECT USING (EXISTS (SELECT 1 FROM public.corporate_members WHERE corporate_id = public.corporates.id AND user_id = auth.uid()));

-- Job Postings
CREATE POLICY "Anyone read published jobs" ON public.job_postings FOR SELECT USING (status = 'published');
CREATE POLICY "Members manage corporate jobs" ON public.job_postings FOR ALL USING (EXISTS (SELECT 1 FROM public.corporate_members WHERE corporate_id = public.job_postings.corporate_id AND user_id = auth.uid()));
CREATE POLICY "Admin manage all jobs" ON public.job_postings FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Applications (Tenant Isolated)
CREATE POLICY "Students view own applications" ON public.applications FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students create own applications" ON public.applications FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Members manage corporate applications" ON public.applications FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.job_postings jp
    JOIN public.corporate_members cm ON jp.corporate_id = cm.corporate_id
    WHERE jp.id = public.applications.job_id AND cm.user_id = auth.uid()
  )
);

-- Notifications
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (user_id = auth.uid());

-- User creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (
    new.id,
    new.email,
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role)
  );
  
  IF (new.raw_user_meta_data->>'role') = 'student' THEN
    INSERT INTO public.student_profiles (user_id, full_name) VALUES (new.id, new.raw_user_meta_data->>'full_name');
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
