export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8 bg-paper dark:bg-ink">
        <div className="w-full max-w-sm space-y-8">
          {children}
        </div>
      </div>
      <div className="hidden lg:flex items-center justify-center bg-ink text-paper dark:bg-paper dark:text-ink p-12">
        <div className="max-w-md space-y-6">
          <div className="font-serif font-bold text-4xl">Sift</div>
          <p className="text-xl opacity-80">
            The platform that turns paper resumes into structured hiring signals. Join the ecosystem today.
          </p>
        </div>
      </div>
    </div>
  )
}
