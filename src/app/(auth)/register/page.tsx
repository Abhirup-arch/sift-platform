import { register } from '@/app/actions/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default async function RegisterPage(props: { searchParams: Promise<{ role?: string }> }) {
  const searchParams = await props.searchParams
  const defaultRole = searchParams.role === 'corporate' ? 'corporate' : 'student'

  return (
    <>
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
        <p className="text-slate-500 text-sm">Join Sift to start your hiring journey</p>
      </div>

      <form action={register} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" name="fullName" placeholder="John Doe" required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required minLength={6} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Account Type</Label>
          <Select name="role" defaultValue={defaultRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student / Candidate</SelectItem>
              <SelectItem value="corporate">Corporate / Recruiter</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button type="submit" className="w-full bg-ink text-paper dark:bg-paper dark:text-ink hover:opacity-90">
          Create Account
        </Button>
      </form>

      <div className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="text-ink dark:text-paper font-semibold hover:underline">
          Log in
        </Link>
      </div>
    </>
  )
}
