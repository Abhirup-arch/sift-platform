import { getJobApprovalQueue, approveJob } from '@/app/actions/admin';

export default async function AdminJobsPage() {
  const jobs = await getJobApprovalQueue();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-ink-text">Job Approval Queue</h1>
      
      <div className="grid gap-6">
        {jobs?.map((job) => (
          <div key={job.id} className="p-6 rounded-xl border border-ink bg-paper shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-ink-text">{job.title}</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-flag/10 text-flag">
                  Pending Review
                </span>
              </div>
              <p className="text-ink-text opacity-80 mb-1">
                <span className="font-semibold">Company:</span> {job.corporates?.name || 'Unknown'}
              </p>
              <p className="text-sm text-ink-text opacity-70">
                Submitted on {new Date(job.created_at).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button className="px-4 py-2 rounded-md border border-ink text-ink-text font-medium hover:bg-ink/5 transition-colors">
                View Details
              </button>
              
              <form action={async () => {
                'use server';
                await approveJob(job.id);
              }}>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-md bg-signal text-paper font-medium hover:opacity-90 transition-opacity"
                >
                  Approve & Publish
                </button>
              </form>
            </div>
            
          </div>
        ))}

        {(!jobs || jobs.length === 0) && (
          <div className="p-12 text-center rounded-xl border border-ink bg-paper shadow-sm text-ink-text opacity-70">
            No jobs pending approval in the queue.
          </div>
        )}
      </div>
    </div>
  );
}
