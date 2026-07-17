import ParseRevealHero from '@/components/marketing/ParseRevealHero'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'

export const dynamic = 'force-dynamic'

export default async function MarketingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let dashboardUrl = '/student'
  if (user) {
    const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (dbUser?.role) {
      dashboardUrl = `/${dbUser.role}`
    }
  }

  return (
    <div className="min-h-screen bg-paper dark:bg-ink selection:bg-highlighter selection:text-ink">
      <header className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-ink/10 dark:border-paper/10">
        <div className="font-serif font-bold text-2xl tracking-tight">Sift</div>
        <nav className="hidden md:flex gap-6 font-medium text-sm">
          <Link href="#how-it-works" className="hover:text-highlighter transition-colors">How it works</Link>
          <Link href="#pricing" className="hover:text-highlighter transition-colors">Pricing</Link>
        </nav>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <Link href={dashboardUrl} className="font-medium text-sm hover:underline">Dashboard</Link>
              <form action={logout}>
                <button type="submit" className="bg-ink text-paper dark:bg-paper dark:text-ink px-4 py-2 rounded font-medium text-sm hover:opacity-90 transition-opacity">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="font-medium text-sm hover:underline">Log in</Link>
              <Link href="/register?role=corporate" className="bg-ink text-paper dark:bg-paper dark:text-ink px-4 py-2 rounded font-medium text-sm hover:opacity-90 transition-opacity">
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        <ParseRevealHero />

        <section id="how-it-works" className="py-24 border-t border-ink/10 dark:border-paper/10">
          <h2 className="font-serif text-3xl font-medium mb-12 text-center">One platform, three perspectives.</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4 p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg">For Students</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Upload your resume once. Our AI parses your skills automatically. Apply with a single click and track exactly where you are in the pipeline.</p>
            </div>
            <div className="space-y-4 p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-highlighter/10 rounded-bl-full"></div>
              <h3 className="font-bold text-lg">For Recruiters</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Stop skimming PDFs. Sift extracts structured data and matches candidates to your job description, ranking them by fit before you even look.</p>
            </div>
            <div className="space-y-4 p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg">For Admins</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Onboard corporate clients, gatekeep job postings for quality, and monitor the health of the entire hiring ecosystem.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
