export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          school_id: string
          role: 'student' | 'teacher' | 'head_teacher'
          full_name: string
          email: string
          class_id: string | null
          subject: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          school_id: string
          role: 'student' | 'teacher' | 'head_teacher'
          full_name: string
          email: string
          class_id?: string | null
          subject?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          role?: 'student' | 'teacher' | 'head_teacher'
          full_name?: string
          email?: string
          class_id?: string | null
          subject?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      schools: {
        Row: {
          id: string
          name: string
          address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          created_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          school_id: string
          name: string
          teacher_id: string | null
          subject: string
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          name: string
          teacher_id?: string | null
          subject: string
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          name?: string
          teacher_id?: string | null
          subject?: string
          created_at?: string
        }
      }
      progress: {
        Row: {
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
        Insert: {
          id?: string
          student_id: string
          class_id: string
          school_id: string
          assignment_name: string
          score: number
          max_score: number
          date_completed: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          class_id?: string
          school_id?: string
          assignment_name?: string
          score?: number
          max_score?: number
          date_completed?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}