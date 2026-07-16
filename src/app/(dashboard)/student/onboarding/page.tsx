import { updateStudentProfile } from '@/app/actions/student'
import { createClient } from '@/lib/supabase/server'
import { CheckCircle } from 'lucide-react'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch existing profile if any
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('id', user?.id || '')
    .single()

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold mb-3 text-ink tracking-tight">Complete Your Profile</h1>
        <p className="text-ink-text/60 text-lg">Tell us about yourself to match with the best roles.</p>
      </div>
      
      <div className="bg-paper p-8 rounded-3xl shadow-xl shadow-ink/5 border border-ink/5 relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-highlighter/10 rounded-bl-full -z-10" />

        <form action={updateStudentProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="first_name" className="text-sm font-semibold text-ink/80 tracking-wide">First Name</label>
              <input 
                type="text" 
                id="first_name" 
                name="first_name" 
                defaultValue={profile?.first_name || ''}
                className="w-full px-4 py-3 bg-paper border border-ink/10 rounded-xl focus:ring-2 focus:ring-highlighter focus:border-highlighter outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="last_name" className="text-sm font-semibold text-ink/80 tracking-wide">Last Name</label>
              <input 
                type="text" 
                id="last_name" 
                name="last_name" 
                defaultValue={profile?.last_name || ''}
                className="w-full px-4 py-3 bg-paper border border-ink/10 rounded-xl focus:ring-2 focus:ring-highlighter focus:border-highlighter outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="university" className="text-sm font-semibold text-ink/80 tracking-wide">University / College</label>
            <input 
              type="text" 
              id="university" 
              name="university" 
              defaultValue={profile?.university || ''}
              className="w-full px-4 py-3 bg-paper border border-ink/10 rounded-xl focus:ring-2 focus:ring-highlighter focus:border-highlighter outline-none transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="major" className="text-sm font-semibold text-ink/80 tracking-wide">Major / Field of Study</label>
              <input 
                type="text" 
                id="major" 
                name="major" 
                defaultValue={profile?.major || ''}
                className="w-full px-4 py-3 bg-paper border border-ink/10 rounded-xl focus:ring-2 focus:ring-highlighter focus:border-highlighter outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="graduation_year" className="text-sm font-semibold text-ink/80 tracking-wide">Expected Graduation</label>
              <input 
                type="number" 
                id="graduation_year" 
                name="graduation_year" 
                defaultValue={profile?.graduation_year || new Date().getFullYear() + 1}
                min="2000"
                max="2100"
                className="w-full px-4 py-3 bg-paper border border-ink/10 rounded-xl focus:ring-2 focus:ring-highlighter focus:border-highlighter outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button 
              type="submit" 
              className="px-8 py-3.5 bg-ink text-paper rounded-xl font-bold hover:bg-ink/90 transition-all shadow-md flex items-center gap-2 hover:-translate-y-0.5"
            >
              <CheckCircle className="h-5 w-5 text-highlighter" />
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
