'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getPlatformTotals() {
  const supabase = await createClient();
  
  const [{ count: users }, { count: corporates }, { count: jobs }, { count: applications }] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('corporates').select('*', { count: 'exact', head: true }),
    supabase.from('job_postings').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
  ]);

  return {
    users: users || 0,
    corporates: corporates || 0,
    jobs: jobs || 0,
    applications: applications || 0,
  };
}

export async function getCorporates() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('corporates').select('*').order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching corporates:', error);
    return [];
  }
  
  return data;
}

export async function createCorporate(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  const { error } = await supabase.from('corporates').insert([{ name, contact_email: email, status: 'active' }]);
  if (error) {
    console.error('Error creating corporate:', error);
    throw new Error(error.message);
  }
  
  revalidatePath('/admin/corporates');
}

export async function getJobApprovalQueue() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('job_postings').select('*, corporates(name)').eq('status', 'draft').order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching job approval queue:', error);
    return [];
  }
  
  return data;
}

export async function approveJob(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('job_postings').update({ status: 'published' }).eq('id', id);
  
  if (error) {
    console.error('Error approving job:', error);
    throw new Error(error.message);
  }
  
  revalidatePath('/admin/jobs');
}
