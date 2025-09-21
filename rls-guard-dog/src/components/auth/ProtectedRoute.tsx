'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context'
import { UserRole } from '@/types'
import { isAuthorizedForRoute } from '@/lib/supabase/auth'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: UserRole[]
  fallbackPath?: string
  requireProfile?: boolean
}

export function ProtectedRoute({
  children,
  allowedRoles,
  fallbackPath = '/login',
  requireProfile = true,
}: ProtectedRouteProps) {
  const { user, profile, loading, error } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return // Still loading, don't redirect yet

    // No user, redirect to login
    if (!user) {
      router.push(fallbackPath)
      return
    }

    // User exists but no profile and profile is required
    if (requireProfile && !profile && !error) {
      // In a real app, you might redirect to a profile setup page
      console.warn('User has no profile')
      return
    }

    // Check role-based access
    if (allowedRoles && profile) {
      if (!allowedRoles.includes(profile.role)) {
        router.push('/unauthorized')
        return
      }
    }
  }, [user, profile, loading, error, allowedRoles, requireProfile, fallbackPath, router])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Authentication Error: {error}</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // User not authenticated
  if (!user) {
    return null // Redirect will happen in useEffect
  }

  // User authenticated but no profile (if profile is required)
  if (requireProfile && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Setting up your profile...</p>
          {/* In a real app, show profile setup form */}
        </div>
      </div>
    )
  }

  // User authenticated and authorized
  return <>{children}</>
}

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: UserRole[]
  fallback?: ReactNode
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}

interface RouteGuardProps {
  children: ReactNode
  pathname: string
}

export function RouteGuard({ children, pathname }: RouteGuardProps) {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile || !isAuthorizedForRoute(profile.role, pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don&apos;t have permission to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}