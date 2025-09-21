'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, loading } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const redirectedFrom = searchParams.get('redirectedFrom')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setSubmitError(null)
      const result = await signIn(data.email, data.password)
      
      if (result.error) {
        setSubmitError(result.error)
      } else {
        // Redirect to intended page or dashboard
        const redirectTo = redirectedFrom || '/'
        router.push(redirectTo)
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
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
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
                autoComplete="current-password"
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              loading={isSubmitting || loading}
              disabled={isSubmitting || loading}
            >
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}