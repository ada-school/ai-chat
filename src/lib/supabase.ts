import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from './env'

/**
 * Singleton Supabase client, or `null` when env vars are missing so the app
 * can run in local mode without a backend.
 */
export const supabase: SupabaseClient | null =
  env.supabaseUrl && env.supabaseAnonKey
    ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true },
      })
    : null
