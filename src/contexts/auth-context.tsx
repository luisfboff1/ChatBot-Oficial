'use client'

import * as React from 'react'
import { createBrowserClient } from '@/lib/supabase-browser'
import { trackUzzEvent } from '@/lib/analytics'

type AuthProfile = {
  clientId: string
  clientName?: string
  userName?: string
}

type AuthUser = {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
}

type AuthSession = {
  user: AuthUser | null
  expires_at?: number
  expires_in?: number
  access_token?: string
  refresh_token?: string
} | null

type AuthContextValue = {
  user: AuthUser | null
  session: AuthSession | null
  profile: AuthProfile | null
  loading: boolean
  login: (credentials: { email: string; password: string }) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithMicrosoft: () => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

const fetchProfile = async (): Promise<AuthProfile | null> => {
  try {
    const response = await fetch('/api/auth/verify-profile', {
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (!data?.success) {
      return null
    }

    return {
      clientId: data.client_id,
      clientName: data.client_name,
      userName: data.user_name,
    }
  } catch (error) {
    console.error('[auth-context] Erro ao buscar profile:', error)
    return null
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabaseRef = React.useRef<ReturnType<typeof createBrowserClient>>()
  const getSupabase = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createBrowserClient()
    }
    return supabaseRef.current
  }

  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [session, setSession] = React.useState<AuthSession | null>(null)
  const [profile, setProfile] = React.useState<AuthProfile | null>(null)
  const [loading, setLoading] = React.useState(true)

  const refreshProfile = React.useCallback(async () => {
    const profileData = await fetchProfile()
    setProfile(profileData)
  }, [])

  React.useEffect(() => {
    const initAuth = async () => {
      setLoading(true)
      const supabase = getSupabase()

      const { data } = await supabase.auth.getSession()

      setSession(data.session as AuthSession | null)
      setUser((data.session?.user as AuthUser) ?? null)

      if (session?.user) {
        await refreshProfile()
      } else {
        setProfile(null)
      }

      setLoading(false)
    }

    initAuth()

    const supabase = getSupabase()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[auth-context] auth event:', event)
      setSession((session as AuthSession) ?? null)
      setUser((session?.user as AuthUser) ?? null)

      if (session?.user) {
        await refreshProfile()
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [refreshProfile])

  const login = React.useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const supabase = getSupabase()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      await refreshProfile()
      trackUzzEvent.login()
    },
    [refreshProfile]
  )

  const loginWithGoogle = React.useCallback(async () => {
    const supabase = getSupabase()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      throw error
    }
  }, [])

  const loginWithMicrosoft = React.useCallback(async () => {
    const supabase = getSupabase()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      throw error
    }
  }, [])

  const logout = React.useCallback(async () => {
    const supabase = getSupabase()
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }

    setSession(null)
    setUser(null)
    setProfile(null)
    trackUzzEvent.logout()
  }, [])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      loading,
      login,
      loginWithGoogle,
      loginWithMicrosoft,
      logout,
      refreshProfile,
    }),
    [
      user,
      session,
      profile,
      loading,
      login,
      loginWithGoogle,
      loginWithMicrosoft,
      logout,
      refreshProfile,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}


