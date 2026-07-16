import { getPlatformTotals } from '@/app/actions/admin';

export default async function AdminDashboardPage() {
  const totals = await getPlatformTotals();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-ink-text">Platform Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="p-6 rounded-xl border border-ink bg-paper shadow-sm">
          <h3 className="text-sm font-medium text-ink-text opacity-70">Total Users</h3>
          <p className="text-4xl font-bold mt-2 text-ink-text">{totals.users}</p>
        </div>
        
        {/* Total Corporates */}
        <div className="p-6 rounded-xl border border-ink bg-paper shadow-sm">
          <h3 className="text-sm font-medium text-ink-text opacity-70">Total Corporates</h3>
          <p className="text-4xl font-bold mt-2 text-ink-text">{totals.corporates}</p>
        </div>
        
        {/* Total Jobs */}
        <div className="p-6 rounded-xl border border-ink bg-paper shadow-sm">
          <h3 className="text-sm font-medium text-ink-text opacity-70">Total Jobs</h3>
          <p className="text-4xl font-bold mt-2 text-ink-text">{totals.jobs}</p>
        </div>
        
        {/* Total Applications */}
        <div className="p-6 rounded-xl border border-ink bg-paper shadow-sm">
          <h3 className="text-sm font-medium text-ink-text opacity-70">Total Applications</h3>
          <p className="text-4xl font-bold mt-2 text-ink-text">{totals.applications}</p>
        </div>
      </div>
    </div>
  );
}
