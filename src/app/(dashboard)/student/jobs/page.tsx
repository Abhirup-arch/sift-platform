import { applyForJob } from '@/app/actions/student'
import { createClient } from '@/lib/supabase/server'
import { Building2, MapPin, Clock, DollarSign, ArrowRight } from 'lucide-react'

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: jobs } = await supabase
    .from('job_postings')
    .select('*')
    .eq('status', 'published')

  const { data: applications } = await supabase
    .from('job_applications')
    .select('job_id')
    .eq('student_id', user?.id || '')

  const appliedJobIds = new Set(applications?.map(a => a.job_id) || [])

  const displayJobs = jobs && jobs.length > 0 ? jobs : [
    { id: '1', title: 'Frontend Developer Intern', company: 'TechCorp', location: 'Remote', type: 'Full-time', salary: '$80k - $100k' },
    { id: '2', title: 'UX Research Intern', company: 'DesignCo', location: 'New York, NY', type: 'Internship', salary: '$40/hr' },
    { id: '3', title: 'Junior Data Scientist', company: 'DataDynamics', location: 'San Francisco, CA', type: 'Full-time', salary: '$110k - $130k' },
  ]

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold mb-3 text-ink tracking-tight">Job Board</h1>
          <p className="text-ink-text/60 text-lg">Discover and seamlessly apply to roles matched to your profile.</p>
        </div>
        <div className="px-4 py-2 bg-highlighter/10 text-ink font-bold rounded-lg border border-highlighter/20 text-sm">
          {displayJobs.length} matches found
        </div>
      </div>

      <div className="grid gap-6">
        {displayJobs.map((job) => (
          <div key={job.id} className="bg-paper p-6 md:p-8 rounded-3xl shadow-lg shadow-ink/5 border border-ink/5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:border-highlighter/30 transition-all duration-300 group">
            <div className="flex gap-6 items-center w-full md:w-auto">
              <div className="w-20 h-20 bg-ink/5 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-highlighter/10 group-hover:text-highlighter transition-colors">
                <Building2 className="h-8 w-8 text-ink/40 group-hover:text-highlighter transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-1 text-ink">{job.title}</h3>
                <p className="text-ink-text/80 font-medium mb-4">{job.company}</p>
                <div className="flex flex-wrap gap-4 text-sm font-medium text-ink-text/60">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-ink/5 rounded-md"><MapPin className="h-4 w-4 text-ink/40" /> {job.location || 'Remote'}</span>
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-ink/5 rounded-md"><Clock className="h-4 w-4 text-ink/40" /> {job.type || 'Full-time'}</span>
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-ink/5 rounded-md"><DollarSign className="h-4 w-4 text-ink/40" /> {job.salary || 'Competitive'}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 shrink-0 border-t md:border-t-0 md:border-l border-ink/10 pt-4 md:pt-0 md:pl-8">
              {appliedJobIds.has(job.id) ? (
                <div className="px-8 py-3.5 bg-signal/10 text-signal font-bold rounded-xl text-center border border-signal/20 flex items-center justify-center gap-2 cursor-default">
                  Applied ✓
                </div>
              ) : (
                <form action={applyForJob.bind(null, job.id)}>
                  <button type="submit" className="px-8 py-3.5 bg-ink text-paper font-bold rounded-xl hover:bg-ink/90 transition-all w-full md:w-auto shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2 group/btn">
                    1-Click Apply
                    <ArrowRight className="h-4 w-4 opacity-70 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
