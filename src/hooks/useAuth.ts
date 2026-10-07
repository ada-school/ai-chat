import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type AuthStatus = 'loading' | 'ready' | 'error'

interface AuthState {
  status: AuthStatus
  session: Session | null
  error: string | null
}

/**
 * Ensures there is a Supabase session, signing in anonymously on first visit.
 * In local mode (no Supabase) it resolves immediately.
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>(() => ({
    status: supabase ? 'loading' : 'ready',
    session: null,
    error: null,
  }))

  useEffect(() => {
    if (!supabase) return
    const client = supabase
    let cancelled = false

    async function bootstrap() {
      try {
        const { data, error } = await client.auth.getSession()
        if (error) throw error
        let session = data.session
        if (!session) {
          const result = await client.auth.signInAnonymously()
          if (result.error) throw result.error
          session = result.data.session
        }
        if (!cancelled) setState({ status: 'ready', session, error: null })
      } catch (err) {
        if (!cancelled) {
          setState({
            status: 'error',
            session: null,
            error: err instanceof Error ? err.message : 'Could not sign in',
          })
        }
      }
    }

    void bootstrap()

    const { data: subscription } = client.auth.onAuthStateChange((_event, session) => {
      if (!cancelled && session) setState({ status: 'ready', session, error: null })
    })

    return () => {
      cancelled = true
      subscription.subscription.unsubscribe()
    }
  }, [])

  return state
}
