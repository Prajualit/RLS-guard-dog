// Database types based on the Supabase schema from Phase 2

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile
        Insert: UserProfileInsert
        Update: UserProfileUpdate
      }
      schools: {
        Row: School
        Insert: SchoolInsert
        Update: SchoolUpdate
      }
      classes: {
        Row: Class
        Insert: ClassInsert
        Update: ClassUpdate
      }
      progress: {
        Row: Progress
        Insert: ProgressInsert
        Update: ProgressUpdate
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'student' | 'teacher' | 'head_teacher'
    }
  }
}

// User Profile Types
export interface UserProfile {
  id: string
  school_id: string
  role: 'student' | 'teacher' | 'head_teacher'
  full_name: string
  email: string
  class_id?: string | null
  subject?: string | null
  created_at: string
  updated_at: string
}

export interface UserProfileInsert {
  id: string
  school_id: string
  role: 'student' | 'teacher' | 'head_teacher'
  full_name: string
  email: string
  class_id?: string | null
  subject?: string | null
}

export interface UserProfileUpdate {
  school_id?: string
  role?: 'student' | 'teacher' | 'head_teacher'
  full_name?: string
  email?: string
  class_id?: string | null
  subject?: string | null
  updated_at?: string
}

// School Types
export interface School {
  id: string
  name: string
  address?: string | null
  created_at: string
}

export interface SchoolInsert {
  name: string
  address?: string | null
}

export interface SchoolUpdate {
  name?: string
  address?: string | null
}

// Class Types
export interface Class {
  id: string
  school_id: string
  name: string
  teacher_id?: string | null
  subject: string
  created_at: string
}

export interface ClassInsert {
  school_id: string
  name: string
  teacher_id?: string | null
  subject: string
}

export interface ClassUpdate {
  name?: string
  teacher_id?: string | null
  subject?: string
}

// Progress Types
export interface Progress {
  id: string
  student_id: string
  class_id: string
  school_id: string
  assignment_name: string
  score: number
  max_score: number
  date_completed: string
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface ProgressInsert {
  student_id: string
  class_id: string
  school_id: string
  assignment_name: string
  score: number
  max_score: number
  date_completed: string
  notes?: string | null
}

export interface ProgressUpdate {
  assignment_name?: string
  score?: number
  max_score?: number
  date_completed?: string
  notes?: string | null
  updated_at?: string
}