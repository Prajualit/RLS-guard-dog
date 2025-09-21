'use client'

import { ProtectedRoute } from '@/components/auth'
import { useAuth } from '@/context'

export default function StudentDashboard() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <StudentDashboardContent />
    </ProtectedRoute>
  )
}

function StudentDashboardContent() {
  const { user, profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Student Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {profile?.full_name || user?.email}
              </span>
              <button
                onClick={signOut}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Student Progress
              </h2>
              <p className="text-gray-600 mb-4">
                Here you can view your academic progress and assignments.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-6">
                <p className="text-blue-800 font-medium">
                  ✅ Student access working!
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  You have successfully accessed the student dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}