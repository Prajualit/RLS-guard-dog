import { createServerSupabaseClient } from './server'
import { UserProfile, UserRole } from '@/types'
import { User } from '@supabase/supabase-js'

// Server-side authentication utilities
export class AuthServer {
  async getCurrentUser() {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  async getCurrentSession() {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }

  async getUserProfile(userId: string): Promise<{ profile: UserProfile | null; error: string | null }> {
    try {
      const supabase = await createServerSupabaseClient()
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        return { profile: null, error: error.message }
      }

      return { profile: data as UserProfile, error: null }
    } catch {
      return { profile: null, error: 'Failed to fetch profile' }
    }
  }

  async requireAuth(): Promise<{ user: User | null; profile: UserProfile | null; error: string | null }> {
    const user = await this.getCurrentUser()
    
    if (!user) {
      return { user: null, profile: null, error: 'Not authenticated' }
    }

    const { profile, error } = await this.getUserProfile(user.id)
    
    return { user, profile, error }
  }

  async requireRole(allowedRoles: UserRole[]): Promise<{ user: User | null; profile: UserProfile | null; error: string | null }> {
    const { user, profile, error } = await this.requireAuth()
    
    if (error || !profile) {
      return { user, profile, error: error || 'Profile not found' }
    }

    if (!allowedRoles.includes(profile.role)) {
      return { user: null, profile: null, error: 'Insufficient permissions' }
    }

    return { user, profile, error: null }
  }
}

// Create singleton instance for easy importing
export const authServer = new AuthServer()

// Re-export shared utilities
export { getRolePermissions, hasPermission, isAuthorizedForRoute } from './auth-utils'