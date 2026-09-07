import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api, storage, setAuthFailureHandler } from '../services/api'
import type { User, Role } from '../types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (payload: { name: string; email: string; password: string; role: Role }) => Promise<void>
  logout: () => Promise<void>
  loginError: string | null
  signupError: string | null
  isLoginPending: boolean
  isSignupPending: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [signupError, setSignupError] = useState<string | null>(null)

  const logout = useCallback(async () => {
    await storage.clear()
    setUser(null)
  }, [])

  useEffect(() => {
    setAuthFailureHandler(logout)
  }, [logout])

  useEffect(() => {
    storage.getUser().then((u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await api.post('/auth/login', credentials)
      return data.data as { accessToken: string; refreshToken: string; user: User }
    },
    onSuccess: async (result) => {
      await storage.saveTokens(result.accessToken, result.refreshToken)
      await storage.saveUser(result.user)
      setUser(result.user)
      setLoginError(null)
    },
    onError: (err: any) => {
      setLoginError(err?.response?.data?.message ?? 'Erro ao fazer login')
    },
  })

  const signupMutation = useMutation({
    mutationFn: async (payload: { name: string; email: string; password: string; role: Role }) => {
      const { data } = await api.post('/auth/signup', payload)
      return data.data as User
    },
    onError: (err: any) => {
      setSignupError(err?.response?.data?.message ?? 'Erro ao criar conta')
    },
  })

  const login = useCallback(
    async (email: string, password: string) => {
      setLoginError(null)
      await loginMutation.mutateAsync({ email, password })
    },
    [loginMutation]
  )

  const signup = useCallback(
    async (payload: { name: string; email: string; password: string; role: Role }) => {
      setSignupError(null)
      await signupMutation.mutateAsync(payload)
    },
    [signupMutation]
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        loginError,
        signupError,
        isLoginPending: loginMutation.isPending,
        isSignupPending: signupMutation.isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
