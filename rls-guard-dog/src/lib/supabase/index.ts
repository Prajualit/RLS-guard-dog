// Client-side exports (safe for client components)
export { createClient } from './client'
export { authClient } from './auth-client'
export { clientQueries } from './queries-client'
export * from './auth-utils'
export * from './types'

// Server-side exports should be imported directly from their files
// to avoid mixing server-only imports with client code
// Use: import { authServer } from '@/lib/supabase/auth-server'
// Use: import { createServerSupabaseClient } from '@/lib/supabase/server'