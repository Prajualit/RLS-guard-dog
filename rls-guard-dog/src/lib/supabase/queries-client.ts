// Client-side query utilities (simplified for basic operations)
import { createClient } from './client'
import { UserProfile } from '@/types'

// Basic types for the application
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
 * Client-side query utilities for use in React components
 * Note: For complex server-side operations, use server-side queries
 */
export class ClientQueries {
  private supabase = createClient()

  /**
   * Get all schools (basic query)
   */
  async getSchools(): Promise<School[]> {
    try {
      const { data, error } = await this.supabase
        .from('schools')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching schools:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching schools:', error)
      return []
    }
  }

  /**
   * Get students in a class (for teachers)
   */
  async getClassStudents(classId: string): Promise<UserProfile[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('class_id', classId)
        .eq('role', 'student')
        .order('full_name')

      if (error) {
        console.error('Error fetching class students:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching class students:', error)
      return []
    }
  }
}

// Create singleton instance
export const clientQueries = new ClientQueries()