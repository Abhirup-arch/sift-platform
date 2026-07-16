import Link from 'next/link'
import { FileText, Briefcase, GraduationCap, LayoutDashboard, LineChart } from 'lucide-react'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-paper text-ink-text font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-ink flex flex-col justify-between shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-paper mb-8 flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-highlighter" />
            Sift Portal
          </h1>
          <nav className="space-y-2">
            <NavItem href="/student/onboarding" icon={<LayoutDashboard size={20} />} label="Onboarding" />
            <NavItem href="/student/resume" icon={<FileText size={20} />} label="My Resume" />
            <NavItem href="/student/jobs" icon={<Briefcase size={20} />} label="Job Board" />
            <NavItem href="/student/tracker" icon={<LineChart size={20} />} label="Tracker" />
          </nav>
        </div>
        <div className="p-6 text-paper/50 text-sm">
          &copy; 2026 Sift Platform
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="p-8 md:p-12 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-lg text-paper/70 hover:bg-paper/10 hover:text-paper transition-all duration-200 group"
    >
      <span className="text-paper/50 group-hover:text-highlighter transition-colors">
        {icon}
      </span>
      <span className="font-medium tracking-wide">{label}</span>
    </Link>
  )
}
