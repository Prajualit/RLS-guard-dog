import { User, Session } from '@supabase/supabase-js'
import { UserProfile } from './database.types'

// Authentication state types
export interface AuthUser extends User {
  profile?: UserProfile
}

export interface AuthState {
  user: AuthUser | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, profileData: SignUpData) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

// Sign up form data
export interface SignUpData {
  fullName: string
  schoolId: string
  role: 'student' | 'teacher' | 'head_teacher'
  classId?: string
  subject?: string
}

// Login form data
export interface LoginData {
  email: string
  password: string
}

// Form validation schemas (for Zod)
export interface LoginFormData {
  email: string
  password: string
}

export interface SignUpFormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  schoolId: string
  role: 'student' | 'teacher' | 'head_teacher'
  classId?: string
  subject?: string
}

// Role-based access types
export type UserRole = 'student' | 'teacher' | 'head_teacher'

export interface RolePermissions {
  canViewAllProgress: boolean
  canEditProgress: boolean
  canViewSchoolData: boolean
  canManageUsers: boolean
}

// Route protection types
export interface RouteProtection {
  requireAuth: boolean
  allowedRoles?: UserRole[]
  redirectTo?: string
}