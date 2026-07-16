import { createClient } from '@/lib/supabase/server'
import { CheckCircle2, Circle, Building2, ExternalLink } from 'lucide-react'

const STATUSES = ['Applied', 'Screening', 'Shortlisted', 'Interview', 'Offer', 'Hired']

export default async function TrackerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: applicationsData } = await supabase
    .from('job_applications')
    .select(`
      id, 
      status, 
      created_at,
      job_id,
      job_postings (title, company)
    `)
    .eq('student_id', user?.id || '')
    .order('created_at', { ascending: false })

  const applications = applicationsData && applicationsData.length > 0 ? applicationsData : [
    { id: '1', status: 'Screening', created_at: new Date().toISOString(), job_postings: { title: 'Frontend Developer Intern', company: 'TechCorp' } },
    { id: '2', status: 'Interview', created_at: new Date(Date.now() - 86400000 * 5).toISOString(), job_postings: { title: 'UX Research Intern', company: 'DesignCo' } },
    { id: '3', status: 'Rejected', created_at: new Date(Date.now() - 86400000 * 12).toISOString(), job_postings: { title: 'Junior Data Scientist', company: 'DataDynamics' } },
  ]

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold mb-3 text-ink tracking-tight">Application Tracker</h1>
        <p className="text-ink-text/60 text-lg">Monitor your job applications in real-time and prepare for your next steps.</p>
      </div>

      <div className="space-y-8">
        {applications.map((app) => {
          const currentStatusLower = app.status?.toLowerCase() || 'applied'
          const isRejected = currentStatusLower === 'rejected'
          
          return (
            <div key={app.id} className="bg-paper p-8 rounded-3xl shadow-xl shadow-ink/5 border border-ink/5 overflow-hidden relative">
              {/* Status Header Strip */}
              <div className={`absolute top-0 left-0 w-2 h-full ${isRejected ? 'bg-flag' : currentStatusLower === 'hired' ? 'bg-signal' : 'bg-highlighter'}`} />

              <div className="flex flex-col md:flex-row md:items-start justify-between mb-10 gap-4 pl-4">
                <div className="flex gap-5 items-center">
                  <div className="w-14 h-14 bg-ink/5 rounded-2xl flex items-center justify-center shrink-0">
                    <Building2 className="h-7 w-7 text-ink/40" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-ink mb-1 flex items-center gap-2">
                      {(app.job_postings as any)?.title}
                      <ExternalLink className="h-4 w-4 text-ink/30 cursor-pointer hover:text-ink/60 transition-colors" />
                    </h3>
                    <p className="text-ink-text/70 font-medium text-lg">{(app.job_postings as any)?.company}</p>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-2 ${
                    isRejected ? 'bg-flag/10 text-flag' : 
                    currentStatusLower === 'hired' ? 'bg-signal/10 text-signal' : 
                    'bg-highlighter/10 text-ink'
                  }`}>
                    {app.status || 'Applied'}
                  </div>
                  <div className="text-sm text-ink-text/50 font-medium block">
                    Applied {new Date(app.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <div className="relative pl-4 overflow-x-auto pb-4">
                <div className="min-w-[600px]">
                  {/* Progress Line Background */}
                  <div className="absolute top-5 left-8 w-[calc(100%-4rem)] h-1.5 -translate-y-1/2 bg-ink/5 rounded-full z-0" />
                  
                  <div className="relative flex justify-between z-10">
                    {STATUSES.map((stepStatus, index) => {
                      const stepStatusLower = stepStatus.toLowerCase()
                      const currentIndex = STATUSES.findIndex(s => s.toLowerCase() === currentStatusLower)
                      
                      let isActive = false
                      let isCompleted = false
                      
                      if (isRejected) {
                         isCompleted = index < 2 // mock previous state before rejection
                      } else {
                         isActive = stepStatusLower === currentStatusLower
                         isCompleted = index < currentIndex
                      }

                      return (
                        <div key={stepStatus} className="flex flex-col items-center gap-3 w-28 group">
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center bg-paper border-[3px] transition-all duration-300 shadow-sm
                            ${isCompleted ? 'border-signal text-signal scale-100 bg-signal/5' : 
                              isActive ? 'border-highlighter text-highlighter bg-highlighter/10 scale-110 shadow-md ring-4 ring-highlighter/10' : 
                              isRejected && index === 2 ? 'border-flag text-flag bg-flag/10 scale-110 ring-4 ring-flag/10' : 
                              'border-ink/10 text-ink/20 group-hover:border-ink/30'}
                          `}>
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : 
                             isActive ? <Circle className="w-5 h-5 fill-current" /> : 
                             isRejected && index === 2 ? <Circle className="w-5 h-5 fill-flag text-flag" /> : 
                             <Circle className="w-5 h-5" />}
                          </div>
                          <span className={`text-sm font-bold text-center tracking-wide ${
                            isActive ? 'text-ink' : 
                            isCompleted ? 'text-ink-text/80' :
                            isRejected && index === 2 ? 'text-flag' :
                            'text-ink-text/40'
                          }`}>
                            {isRejected && index === 2 ? 'Rejected' : stepStatus}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

            </div>
          )
        })}
      </div>
    </div>
  )
}
