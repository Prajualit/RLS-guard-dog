'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useAuth } from '@/context'
import { signUpSchema, type SignUpFormData } from '@/lib/validations/auth'

// Mock data - in real app this would come from Supabase
const mockSchools = [
  { value: 'school-1', label: 'Lincoln Elementary School' },
  { value: 'school-2', label: 'Washington Middle School' },
  { value: 'school-3', label: 'Roosevelt High School' },
]

const mockClasses = [
  { value: 'class-1', label: 'Grade 5A - Mathematics' },
  { value: 'class-2', label: 'Grade 6B - English' },
  { value: 'class-3', label: 'Grade 7C - Science' },
  { value: 'class-4', label: 'Grade 8A - History' },
]

const roleOptions = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'head_teacher', label: 'Head Teacher' },
]

export default function SignUpForm() {
  const router = useRouter()
  const { signUp, loading } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setSubmitError(null)
      // For now, we just create the auth user
      // Profile creation will be handled in a separate step
      const profileData = {
        fullName: data.fullName,
        schoolId: data.schoolId,
        role: data.role,
        classId: data.classId,
        subject: data.subject,
      }
      const result = await signUp(data.email, data.password, profileData)
      
      if (result.error) {
        setSubmitError(result.error)
      } else {
        // Redirect to login with success message
        router.push('/login?message=Account created successfully. Please log in.')
      }
    } catch {
      setSubmitError('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {submitError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">
                {submitError}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName" required>
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                error={errors.fullName?.message}
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email" required>
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                error={errors.email?.message}
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password" required>
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a password"
                error={errors.password?.message}
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" required>
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm your password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="schoolId" required>
                School
              </Label>
              <Select
                id="schoolId"
                placeholder="Select your school"
                options={mockSchools}
                error={errors.schoolId?.message}
                {...register('schoolId')}
              />
              {errors.schoolId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.schoolId.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="role" required>
                Role
              </Label>
              <Select
                id="role"
                placeholder="Select your role"
                options={roleOptions}
                error={errors.role?.message}
                {...register('role')}
              />
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.role.message}
                </p>
              )}
            </div>

            {(selectedRole === 'student' || selectedRole === 'teacher') && (
              <div>
                <Label htmlFor="classId" required>
                  Class
                </Label>
                <Select
                  id="classId"
                  placeholder="Select your class"
                  options={mockClasses}
                  error={errors.classId?.message}
                  {...register('classId')}
                />
                {errors.classId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.classId.message}
                  </p>
                )}
              </div>
            )}

            {(selectedRole === 'teacher' || selectedRole === 'head_teacher') && (
              <div>
                <Label htmlFor="subject" required>
                  Subject
                </Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Enter your subject (e.g., Mathematics, English)"
                  error={errors.subject?.message}
                  {...register('subject')}
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.subject.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              loading={isSubmitting || loading}
              disabled={isSubmitting || loading}
            >
              Create Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}