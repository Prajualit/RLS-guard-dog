import { createClient } from './client'
import { UserProfile } from '@/types'
import { Session, AuthChangeEvent } from '@supabase/supabase-js'

// Client-side authentication utilities
export class AuthClient {
  private supabase = createClient()

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    return { data, error: null }
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    // Note: Profile creation will be handled after email confirmation
    // In a real app, you'd handle this in a separate step or edge function

    return { data, error: null }
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    return { error: error?.message || null }
  }

  async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser()
    return user
  }

  async getCurrentSession() {
    const { data: { session } } = await this.supabase.auth.getSession()
    return session
  }

  async getUserProfile(userId: string): Promise<{ profile: UserProfile | null; error: string | null }> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle() // Use maybeSingle() instead of single() to handle no results

      if (error) {
        return { profile: null, error: error.message }
      }

      // If no profile exists, return null (not an error - profile may not be created yet)
      return { profile: data as UserProfile | null, error: null }
    } catch (err) {
      console.error('Error in getUserProfile:', err)
      return { profile: null, error: 'Failed to fetch profile' }
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }

  /**
   * Create a basic user profile (for newly signed up users)
   */
  async createUserProfile(userData: {
    id: string
    email: string
    full_name: string
    school_id: string
    role: 'student' | 'teacher' | 'head_teacher'
    class_id?: string
    subject?: string
  }): Promise<{ profile: UserProfile | null; error: string | null }> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .insert([userData])
        .select()
        .single()

      if (error) {
        return { profile: null, error: error.message }
      }

      return { profile: data as UserProfile, error: null }
    } catch (err) {
      console.error('Error creating user profile:', err)
      return { profile: null, error: 'Failed to create profile' }
    }
  }
}

// Create singleton instance for easy importing
export const authClient = new AuthClient()