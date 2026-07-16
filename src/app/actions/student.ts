'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateStudentProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const updates = {
    id: user.id,
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    university: formData.get('university') as string,
    major: formData.get('major') as string,
    graduation_year: parseInt(formData.get('graduation_year') as string, 10),
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('student_profiles')
    .upsert(updates)

  if (error) {
    console.error('Error updating profile:', error)
    // For mockup purposes, return success anyway if DB fails
  }

  revalidatePath('/student/onboarding')
  revalidatePath('/student/resume')
}

export async function applyForJob(jobId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const application = {
    job_id: jobId,
    student_id: user.id,
    status: 'Applied',
  }

  const { error } = await supabase
    .from('job_applications')
    .insert(application)

  if (error) {
    console.error('Error applying for job:', error)
  }

  revalidatePath('/student/jobs')
  revalidatePath('/student/tracker')
}

export async function uploadResume(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Mock processing delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  const { error } = await supabase
    .from('student_profiles')
    .update({ 
      resume_url: 'mock_resume_url.pdf',
      parsed_skills: ['JavaScript', 'React', 'Next.js', 'TypeScript', 'Node.js', 'CSS', 'Tailwind', 'Supabase'],
      parsed_experience: 'Frontend Developer Intern - Built scalable web interfaces using React and TailwindCSS.'
    })
    .eq('id', user.id)

  if (error) {
    console.error('Error uploading resume:', error)
  }
  
  revalidatePath('/student/resume')
}
