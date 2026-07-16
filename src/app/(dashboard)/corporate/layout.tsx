import Link from 'next/link'
import { Briefcase, LayoutDashboard, Users, Settings, LogOut } from 'lucide-react'

export default function CorporateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-zinc-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col transition-all duration-300">
        <div className="p-6">
          <Link href="/corporate" className="flex items-center gap-2 text-primary font-bold text-2xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-highlighter flex items-center justify-center text-ink font-bold">
              S
            </div>
            Sift <span className="text-slate-400 font-normal text-lg">Corp</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          <Link href="/corporate" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-highlighter transition-colors">
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/corporate/jobs" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-highlighter transition-colors">
            <Briefcase size={20} />
            <span className="font-medium">Jobs</span>
          </Link>
          <Link href="/corporate/candidates" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-highlighter transition-colors">
            <Users size={20} />
            <span className="font-medium">Talent Pool</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-zinc-800">
          <Link href="/corporate/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </Link>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-flag hover:bg-flag/10 dark:hover:bg-flag/10 transition-colors mt-2">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
