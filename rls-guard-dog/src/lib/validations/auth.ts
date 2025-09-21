import { z } from 'zod'

// Login form validation schema
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Sign up form validation schema  
export const signUpSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
  fullName: z.string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters long')
    .max(100, 'Full name cannot exceed 100 characters'),
  schoolId: z.string()
    .min(1, 'Please select a school'),
  role: z.enum(['student', 'teacher', 'head_teacher'], {
    message: 'Please select a role',
  }),
  classId: z.string().optional(),
  subject: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  // Students and teachers must have a class ID
  if (data.role === 'student' || data.role === 'teacher') {
    return data.classId && data.classId.length > 0
  }
  return true
}, {
  message: "Class selection is required for students and teachers",
  path: ["classId"],
}).refine((data) => {
  // Teachers must have a subject
  if (data.role === 'teacher' || data.role === 'head_teacher') {
    return data.subject && data.subject.length > 0
  }
  return true
}, {
  message: "Subject is required for teachers",
  path: ["subject"],
})

export type SignUpFormData = z.infer<typeof signUpSchema>

// Profile update validation schema
export const profileUpdateSchema = z.object({
  fullName: z.string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters long')
    .max(100, 'Full name cannot exceed 100 characters'),
  classId: z.string().optional(),
  subject: z.string().optional(),
})

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>