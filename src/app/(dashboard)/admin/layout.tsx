import Link from 'next/link';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-paper text-ink-text">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-ink bg-paper p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-8 text-ink-text">Admin Portal</h2>
        
        <nav className="flex flex-col gap-4">
          <Link 
            href="/admin" 
            className="px-4 py-2 rounded-md font-medium text-ink-text hover:bg-ink/5 hover:text-highlighter transition-colors"
          >
            Dashboard
          </Link>
          <Link 
            href="/admin/corporates" 
            className="px-4 py-2 rounded-md font-medium text-ink-text hover:bg-ink/5 hover:text-highlighter transition-colors"
          >
            Corporates
          </Link>
          <Link 
            href="/admin/jobs" 
            className="px-4 py-2 rounded-md font-medium text-ink-text hover:bg-ink/5 hover:text-highlighter transition-colors"
          >
            Job Approvals
          </Link>
        </nav>
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 p-8 bg-paper overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
