import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getURL } from '@/lib/url'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${getURL()}login?message=Email confirmed successfully. You are now logged in!`)
    }
  }

  // URL to redirect to after sign up process completes
  return NextResponse.redirect(`${getURL()}login?error=Could not verify email`)
}
