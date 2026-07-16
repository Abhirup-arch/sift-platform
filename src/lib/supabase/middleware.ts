import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Public routes mapping
  const publicRoutes = ['/', '/login', '/register', '/api', '/auth']
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
  
  if (isPublicRoute && !pathname.startsWith('/api')) {
    if (user && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
      const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (dbUser?.role) {
        return NextResponse.redirect(new URL(`/${dbUser.role}`, request.url))
      }
      return NextResponse.redirect(new URL('/student', request.url))
    }
    return supabaseResponse
  }

  // Protected routes checking
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    // Role-based access control for protected routes
    const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single()
    const role = dbUser?.role || 'student'
    
    if (pathname.startsWith('/admin') && role !== 'admin') {
       return NextResponse.redirect(new URL(`/${role}`, request.url))
    }
    if (pathname.startsWith('/corporate') && role !== 'corporate') {
       return NextResponse.redirect(new URL(`/${role}`, request.url))
    }
    if (pathname.startsWith('/student') && role !== 'student') {
       return NextResponse.redirect(new URL(`/${role}`, request.url))
    }
  }

  return supabaseResponse
}
