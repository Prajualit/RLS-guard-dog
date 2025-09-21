import { createServerSupabaseClient } from './server'

// Basic types for the application
export type UserRole = 'student' | 'teacher' | 'head_teacher'

export interface UserProfile {
  id: string
  school_id: string
  role: UserRole
  full_name: string
  email: string
  class_id: string | null
  subject: string | null
  created_at: string
  updated_at: string
}

export interface School {
  id: string
  name: string
  address: string | null
  created_at: string
}

export interface Class {
  id: string
  school_id: string
  name: string
  teacher_id: string | null
  subject: string
  created_at: string
}

export interface Progress {
  id: string
  student_id: string
  class_id: string
  school_id: string
  assignment_name: string
  score: number
  max_score: number
  date_completed: string
  notes: string | null
  created_at: string
  updated_at: string
}

/**
 * Get the current user's profile from the database
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

/**
 * Get all schools (for admin/setup purposes)
 */
export async function getSchools() {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching schools:', error)
    return []
  }

  return data
}

/**
 * Get classes for the current user based on their role
 */
export async function getUserClasses(): Promise<Class[]> {
  const supabase = await createServerSupabaseClient()
  
  const userProfile = await getCurrentUserProfile()
  if (!userProfile) return []

  let query = supabase.from('classes').select('*')

  switch (userProfile.role) {
    case 'head_teacher':
      // Head teachers see all classes in their school
      query = query.eq('school_id', userProfile.school_id)
      break
    case 'teacher':
      // Teachers see only their classes
      query = query.eq('teacher_id', userProfile.id)
      break
    case 'student':
      // Students see only their class
      if (userProfile.class_id) {
        query = query.eq('id', userProfile.class_id)
      } else {
        return []
      }
      break
    default:
      return []
  }

  const { data, error } = await query.order('name')

  if (error) {
    console.error('Error fetching user classes:', error)
    return []
  }

  return data
}

/**
 * Get progress records based on user role and filters
 */
export async function getProgress(filters: {
  classId?: string
  studentId?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
} = {}): Promise<Progress[]> {
  const supabase = await createServerSupabaseClient()
  
  let query = supabase
    .from('progress')
    .select(`
      *,
      student:user_profiles!student_id(full_name, email),
      class:classes!class_id(name, subject)
    `)

  // Apply filters
  if (filters.classId) {
    query = query.eq('class_id', filters.classId)
  }
  
  if (filters.studentId) {
    query = query.eq('student_id', filters.studentId)
  }
  
  if (filters.dateFrom) {
    query = query.gte('date_completed', filters.dateFrom)
  }
  
  if (filters.dateTo) {
    query = query.lte('date_completed', filters.dateTo)
  }

  query = query
    .order('date_completed', { ascending: false })
    .limit(filters.limit || 100)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching progress:', error)
    return []
  }

  return data as Progress[]
}

/**
 * Create a new progress record
 */
export async function createProgress(progressData: {
  student_id: string
  class_id: string
  assignment_name: string
  score: number
  max_score: number
  date_completed: string
  notes?: string
}) {
  const supabase = await createServerSupabaseClient()
  
  // Get the school_id from the class (for RLS compliance)
  const { data: classData } = await supabase
    .from('classes')
    .select('school_id')
    .eq('id', progressData.class_id)
    .single()

  if (!classData) {
    throw new Error('Class not found')
  }

  const { data, error } = await supabase
    .from('progress')
    .insert({
      ...progressData,
      school_id: (classData as Record<string, unknown>).school_id
    } as Record<string, unknown>)
    .select()
    .single()

  if (error) {
    console.error('Error creating progress:', error)
    throw error
  }

  return data
}

/**
 * Update an existing progress record
 */
export async function updateProgress(
  id: string, 
  updates: Partial<Progress>
) {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('progress')
    .update(updates as Record<string, unknown>)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating progress:', error)
    throw error
  }

  return data
}

/**
 * Delete a progress record
 */
export async function deleteProgress(id: string) {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('progress')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting progress:', error)
    throw error
  }
}

/**
 * Get students in a class (for teachers)
 */
export async function getClassStudents(classId: string): Promise<UserProfile[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('class_id', classId)
    .eq('role', 'student')
    .order('full_name')

  if (error) {
    console.error('Error fetching class students:', error)
    return []
  }

  return data
}

/**
 * Check if current user has permission to access a resource
 */
export async function checkUserPermission(
  resource: 'class' | 'student' | 'progress',
  resourceId: string
): Promise<boolean> {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile) return false

  const supabase = await createServerSupabaseClient()

  switch (resource) {
    case 'class':
      const { data: classData } = await supabase
        .from('classes')
        .select('school_id, teacher_id')
        .eq('id', resourceId)
        .single()

      if (!classData) return false

      // Head teachers can access all classes in their school
      if (userProfile.role === 'head_teacher' && 
          userProfile.school_id === (classData as Record<string, unknown>).school_id) {
        return true
      }

      // Teachers can access their own classes
      if (userProfile.role === 'teacher' && 
          userProfile.id === (classData as Record<string, unknown>).teacher_id) {
        return true
      }

      // Students can access their own class
      if (userProfile.role === 'student' && 
          userProfile.class_id === resourceId) {
        return true
      }

      return false

    case 'student':
      const { data: studentData } = await supabase
        .from('user_profiles')
        .select('school_id, class_id')
        .eq('id', resourceId)
        .eq('role', 'student')
        .single()

      if (!studentData) return false

      // Head teachers can access all students in their school
      if (userProfile.role === 'head_teacher' && 
          userProfile.school_id === (studentData as Record<string, unknown>).school_id) {
        return true
      }

      // Teachers can access students in their classes
      if (userProfile.role === 'teacher' && (studentData as Record<string, unknown>).class_id) {
        const { data: teacherClass } = await supabase
          .from('classes')
          .select('id')
          .eq('id', (studentData as Record<string, unknown>).class_id as string)
          .eq('teacher_id', userProfile.id)
          .single()

        return !!teacherClass
      }

      // Students can access their own profile
      return userProfile.id === resourceId

    default:
      return false
  }
}