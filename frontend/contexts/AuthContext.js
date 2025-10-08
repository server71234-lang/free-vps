'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { checkAuth, getUser } from '../lib/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    try {
      const authCheck = await checkAuth()
      if (authCheck.authenticated) {
        const userData = await getUser()
        setUser(userData)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const checkAuth = async () => {
    return checkAuthentication()
  }

  const value = {
    user,
    loading,
    checkAuth: checkAuthentication
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
      }
