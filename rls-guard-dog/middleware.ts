import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareSupabaseClient } from '@/lib/supabase/middleware'

type UserRole = 'student' | 'teacher' | 'head_teacher'

interface UserProfile {
  role: UserRole
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = await createMiddlewareSupabaseClient(req, res)
  
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession()
  
  const url = req.nextUrl.clone()
  const pathname = url.pathname
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/about', '/contact']
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/api/auth')
  
  // If user is not authenticated and trying to access protected route
  if (!session && !isPublicRoute) {
    url.pathname = '/login'
    url.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(url)
  }
  
  // If user is authenticated and trying to access auth pages, redirect to appropriate dashboard
  if (session && (pathname === '/login' || pathname === '/signup')) {
    // Get user profile to determine redirect destination
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    const profile = profileData as UserProfile | null
    
    if (profile?.role) {
      switch (profile.role) {
        case 'student':
          url.pathname = '/student/dashboard'
          break
        case 'teacher':
          url.pathname = '/teacher'
          break
        case 'head_teacher':
          url.pathname = '/teacher' // Head teachers use the same dashboard as teachers
          break
        default:
          url.pathname = '/'
      }
      return NextResponse.redirect(url)
    }
  }
  
  // Protect teacher routes
  if (pathname.startsWith('/teacher')) {
    if (!session) {
      url.pathname = '/login'
      url.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(url)
    }
    
    // Check if user has teacher or head_teacher role
    const { data: profileData, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    const profile = profileData as UserProfile | null
    const role = profile?.role
    if (error || !role || !(['teacher', 'head_teacher'] as UserRole[]).includes(role)) {
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
  }
  
  // Protect student routes
  if (pathname.startsWith('/student')) {
    if (!session) {
      url.pathname = '/login'
      url.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(url)
    }
    
    // Check if user has student role
    const { data: profileData, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    const profile = profileData as UserProfile | null
    const role = profile?.role
    if (error || !role || role !== 'student') {
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
  }
  
  // Protect head teacher specific routes (if any)
  if (pathname.startsWith('/head-teacher')) {
    if (!session) {
      url.pathname = '/login'
      url.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(url)
    }
    
    // Check if user has head_teacher role
    const { data: profileData, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    const profile = profileData as UserProfile | null
    const role = profile?.role
    if (error || !role || role !== 'head_teacher') {
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
  }
  
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}