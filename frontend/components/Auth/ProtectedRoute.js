'use client'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect } from 'react'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/'
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="loader"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return children
}
