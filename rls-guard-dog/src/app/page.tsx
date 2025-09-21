'use client'

import Link from 'next/link'
import { useAuth } from '@/context'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const { user, profile, loading, signOut } = useAuth()
  const [showSlowLoading, setShowSlowLoading] = useState(false)

  // Show "slow loading" message after 3 seconds
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowSlowLoading(true)
      }, 3000)
      return () => clearTimeout(timer)
    } else {
      setShowSlowLoading(false)
    }
  }, [loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {showSlowLoading ? 'Authentication is taking longer than expected...' : 'Loading authentication...'}
          </p>
          {showSlowLoading && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700">
                If this continues, try refreshing the page or check your internet connection.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">RLS Guard Dog</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700">
                    {profile?.full_name || user.email}
                  </span>
                  {profile && (
                    <span className="text-sm text-gray-500 capitalize">
                      ({profile.role.replace('_', ' ')})
                    </span>
                  )}
                  <button
                    onClick={signOut}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Educational Progress Tracking System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Secure role-based access control system for tracking student progress 
            with Row Level Security (RLS) powered by Supabase.
          </p>

          {user && profile ? (
            <div className="bg-white rounded-lg shadow p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome back, {profile.full_name}!
              </h2>
              <p className="text-gray-600 mb-6">
                Choose your dashboard based on your role:
              </p>
              
              <div className="space-y-4">
                {(profile.role === 'teacher' || profile.role === 'head_teacher') && (
                  <Link
                    href="/teacher"
                    className="block w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Teacher Dashboard
                  </Link>
                )}
                
                {profile.role === 'student' && (
                  <Link
                    href="/student/dashboard"
                    className="block w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Student Dashboard
                  </Link>
                )}
              </div>
              
              <div className="mt-8 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Role:</strong> {profile.role.replace('_', ' ').toUpperCase()}<br/>
                  {profile.class_id && <><strong>Class:</strong> {profile.class_id}<br/></>}
                  {profile.subject && <><strong>Subject:</strong> {profile.subject}</>}
                </p>
              </div>
            </div>
          ) : user && !profile ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome, {user.email}!
              </h2>
              <p className="text-gray-600 mb-6">
                Your account has been created successfully, but your profile setup is not complete yet.
                This is normal for newly created accounts.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Next Steps:</h3>
                <ol className="text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Contact your school administrator to complete your profile</li>
                  <li>Alternatively, your profile may be created automatically during first login</li>
                  <li>Once your profile is ready, you&apos;ll see role-specific dashboards here</li>
                </ol>
              </div>

              <div className="text-center">
                <button
                  onClick={signOut}
                  className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Get Started
                </h2>
                <p className="text-gray-600 mb-6">
                  Sign up or log in to access your personalized dashboard.
                </p>
                
                <div className="space-x-4">
                  <Link
                    href="/signup"
                    className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Create Account
                  </Link>
                  <Link
                    href="/login"
                    className="bg-gray-200 text-gray-800 py-3 px-6 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-8 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Phase 3 Authentication Features
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      ✅ Implemented
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• TypeScript types for authentication</li>
                      <li>• Supabase client configurations</li>
                      <li>• Route protection middleware</li>
                      <li>• Authentication utilities</li>
                      <li>• React context for auth state</li>
                      <li>• Login and signup forms</li>
                      <li>• Protected route wrappers</li>
                      <li>• Role-based access control</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      🔧 Features
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Email/password authentication</li>
                      <li>• Form validation with Zod</li>
                      <li>• Automatic role-based redirects</li>
                      <li>• Session management</li>
                      <li>• Error handling</li>
                      <li>• Loading states</li>
                      <li>• Unauthorized page</li>
                      <li>• Responsive design</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
