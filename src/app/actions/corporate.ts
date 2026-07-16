'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Ensure the user is a corporate user and return their corporate_id
export async function getCorporateContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Find their corporate membership
  const { data: member, error } = await supabase
    .from('corporate_members')
    .select('corporate_id, seat_role')
    .eq('user_id', user.id)
    .single()

  if (error || !member) throw new Error("Not associated with a corporate account")
  return { user, corporateId: member.corporate_id, role: member.seat_role }
}

export async function getDashboardData() {
  const supabase = await createClient()
  const { corporateId } = await getCorporateContext()

  // Get active jobs
  const { data: jobs } = await supabase
    .from('job_postings')
    .select('id, title, status, created_at, location, employment_type')
    .eq('corporate_id', corporateId)
    .in('status', ['published', 'draft'])
    .order('created_at', { ascending: false })
    .limit(5)

  // Get total applications count per status for funnel
  const { data: jobsList } = await supabase
    .from('job_postings')
    .select('id')
    .eq('corporate_id', corporateId)

  const jobIds = jobsList?.map(j => j.id) || []
  
  let applications: any[] = []
  if (jobIds.length > 0) {
    const { data: apps } = await supabase
      .from('applications')
      .select('id, status, applied_at, job_id, student_id, match_score')
      .in('job_id', jobIds)
      
    applications = apps || []
  }

  // Recent activity
  let recentApplications: any[] = []
  if (jobIds.length > 0) {
    const { data: recent } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        applied_at,
        match_score,
        job_postings ( title ),
        student_profiles ( full_name, headline )
      `)
      .in('job_id', jobIds)
      .order('applied_at', { ascending: false })
      .limit(5)
    recentApplications = recent || []
  }

  return {
    jobs: jobs || [],
    applications,
    recentApplications
  }
}

export async function getJobDetails(jobId: string) {
  const supabase = await createClient()
  const { corporateId } = await getCorporateContext()

  const { data: job, error } = await supabase
    .from('job_postings')
    .select('*')
    .eq('id', jobId)
    .eq('corporate_id', corporateId)
    .single()

  if (error || !job) throw new Error("Job not found")

  const { data: applications } = await supabase
    .from('applications')
    .select(`
      id,
      status,
      match_score,
      internal_rating,
      internal_notes,
      tags,
      applied_at,
      student_profiles (
        user_id,
        full_name,
        headline,
        location,
        skills,
        links,
        education
      ),
      resumes (
        file_url,
        parsed_json
      )
    `)
    .eq('job_id', jobId)

  return {
    job,
    applications: applications || []
  }
}

export async function updateApplicationStatus(applicationId: string, status: string) {
  const supabase = await createClient()
  await getCorporateContext() // ensure auth
  
  const { error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId)

  if (error) throw new Error(error.message)
  return { success: true }
}

export async function updateApplicationRating(applicationId: string, rating: number) {
  const supabase = await createClient()
  await getCorporateContext()

  const { error } = await supabase
    .from('applications')
    .update({ internal_rating: rating })
    .eq('id', applicationId)

  if (error) throw new Error(error.message)
  return { success: true }
}
