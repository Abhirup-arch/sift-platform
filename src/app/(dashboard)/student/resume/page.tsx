import { uploadResume } from '@/app/actions/student'
import { createClient } from '@/lib/supabase/server'
import { UploadCloud, CheckCircle2, FileText, Zap } from 'lucide-react'

export default async function ResumePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('id', user?.id || '')
    .single()

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-3 text-ink tracking-tight flex items-center gap-3">
          Resume AI <Zap className="h-8 w-8 text-highlighter fill-highlighter" />
        </h1>
        <p className="text-ink-text/60 text-lg max-w-2xl">Upload your resume to instantly extract skills, experiences, and match with the most relevant opportunities.</p>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-paper p-10 rounded-3xl shadow-xl shadow-ink/5 border border-ink/5 flex flex-col items-center justify-center text-center h-[28rem] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-highlighter/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="w-24 h-24 bg-highlighter/10 rounded-full flex items-center justify-center mb-6 z-10">
              <UploadCloud className="h-10 w-10 text-highlighter" />
            </div>
            
            <h3 className="text-2xl font-bold mb-2 text-ink z-10">Drop your resume here</h3>
            <p className="text-ink-text/50 mb-8 z-10">PDF, DOCX formats up to 5MB are supported.</p>
            
            <form action={uploadResume} className="w-full max-w-xs z-10">
              <label className="cursor-pointer flex items-center justify-center px-6 py-4 bg-paper border-2 border-ink border-dashed rounded-xl font-semibold text-ink hover:bg-ink/5 hover:border-solid transition-all w-full mb-4 group-hover:border-highlighter group-hover:text-highlighter">
                <FileText className="mr-2 h-5 w-5" />
                Select File
                <input type="file" className="hidden" name="resume" accept=".pdf,.doc,.docx" />
              </label>
              <button 
                type="submit" 
                className="w-full px-6 py-4 bg-ink text-paper rounded-xl font-bold hover:bg-ink/90 transition-all shadow-md hover:-translate-y-0.5"
              >
                Upload & Parse
              </button>
            </form>
          </div>
        </div>

        <div>
          {profile?.parsed_skills ? (
            <div className="bg-paper p-10 rounded-3xl shadow-xl shadow-ink/5 border border-ink/5 h-[28rem] overflow-y-auto">
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-ink/10">
                <div className="p-4 bg-signal/10 rounded-2xl">
                  <CheckCircle2 className="h-8 w-8 text-signal" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-ink">Parsing Complete</h3>
                  <p className="text-ink-text/60">We've securely extracted your key details.</p>
                </div>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-ink/40 mb-4 flex items-center gap-2">
                    <Zap className="h-4 w-4" /> Extracted Skills
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {profile.parsed_skills.map((skill: string, i: number) => (
                      <span key={i} className="px-4 py-2 bg-highlighter/10 text-ink font-bold rounded-lg text-sm border border-highlighter/20 hover:bg-highlighter/20 transition-colors cursor-default">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-ink/40 mb-4">Experience Summary</h4>
                  <div className="p-5 bg-ink/5 rounded-2xl border border-ink/10 leading-relaxed">
                    <p className="text-ink-text font-medium text-sm md:text-base">
                      {profile.parsed_experience}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-paper p-10 rounded-3xl shadow-sm border-2 border-dashed border-ink/10 h-[28rem] flex flex-col items-center justify-center text-center text-ink-text/40">
              <div className="p-6 bg-ink/5 rounded-full mb-6">
                <FileText className="h-10 w-10 text-ink/20" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Resume Found</h3>
              <p className="max-w-xs mx-auto">Upload a resume to see intelligent insights and instantly boost your profile.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
