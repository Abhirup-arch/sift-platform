import { getCorporates, createCorporate } from '@/app/actions/admin';

export default async function AdminCorporatesPage() {
  const corporates = await getCorporates();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-ink-text">Corporate Directory</h1>
      
      {/* Onboard New Corporate Form */}
      <div className="mb-12 p-6 rounded-xl border border-ink bg-paper shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-ink-text">Onboard New Corporate</h2>
        <form action={createCorporate} className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex-1">
            <label htmlFor="name" className="block text-sm font-medium text-ink-text mb-1">Company Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              required 
              className="w-full px-4 py-2 rounded-md border border-ink bg-paper text-ink-text focus:outline-none focus:ring-2 focus:ring-highlighter" 
              placeholder="e.g. Acme Corp"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="email" className="block text-sm font-medium text-ink-text mb-1">Contact Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required 
              className="w-full px-4 py-2 rounded-md border border-ink bg-paper text-ink-text focus:outline-none focus:ring-2 focus:ring-highlighter" 
              placeholder="admin@acmecorp.com"
            />
          </div>
          <button 
            type="submit" 
            className="px-6 py-2 bg-ink text-paper font-semibold rounded-md hover:bg-highlighter hover:text-ink-text transition-colors h-[42px]"
          >
            Create Account
          </button>
        </form>
      </div>

      {/* Corporates List */}
      <h2 className="text-xl font-semibold mb-4 text-ink-text">Registered Companies</h2>
      <div className="rounded-xl border border-ink overflow-hidden bg-paper shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-ink/5 border-b border-ink">
            <tr>
              <th className="px-6 py-4 font-semibold text-ink-text">Company Name</th>
              <th className="px-6 py-4 font-semibold text-ink-text">Contact Email</th>
              <th className="px-6 py-4 font-semibold text-ink-text">Status</th>
              <th className="px-6 py-4 font-semibold text-ink-text text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink">
            {corporates?.map((corp) => (
              <tr key={corp.id} className="hover:bg-ink/5 transition-colors">
                <td className="px-6 py-4 text-ink-text">{corp.name}</td>
                <td className="px-6 py-4 text-ink-text opacity-80">{corp.contact_email}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-signal/10 text-signal">
                    {corp.status || 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-sm font-medium text-highlighter hover:underline">
                    Edit / Suspend
                  </button>
                </td>
              </tr>
            ))}
            {(!corporates || corporates.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-ink-text opacity-70">
                  No corporate accounts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
