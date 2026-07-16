import { login } from '@/app/actions/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  return (
    <>
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-slate-500 text-sm">Enter your credentials to access your account</p>
      </div>

      <form action={login} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        
        <Button type="submit" className="w-full bg-ink text-paper dark:bg-paper dark:text-ink hover:opacity-90">
          Sign In
        </Button>
      </form>

      <div className="text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link href="/register?role=student" className="text-ink dark:text-paper font-semibold hover:underline">
          Sign up
        </Link>
      </div>
    </>
  )
}
