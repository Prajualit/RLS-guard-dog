'use client'

import { ProtectedRoute } from '@/components/auth'
import { useAuth } from '@/context'

export default function TeacherDashboard() {
  return (
    <ProtectedRoute allowedRoles={['teacher', 'head_teacher']}>
      <TeacherDashboardContent />
    </ProtectedRoute>
  )
}

function TeacherDashboardContent() {
  const { user, profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Teacher Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {profile?.full_name || user?.email}
              </span>
              <span className="text-sm text-gray-500 capitalize">
                ({profile?.role?.replace('_', ' ')})
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
                Teacher Dashboard
              </h2>
              <p className="text-gray-600 mb-4">
                Welcome to your teaching dashboard. Here you can manage student progress and view class analytics.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mt-6">
                <p className="text-green-800 font-medium">
                  ✅ Authentication is working! 
                </p>
                <p className="text-green-700 text-sm mt-1">
                  You have successfully accessed the teacher-only area.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}