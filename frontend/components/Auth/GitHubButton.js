'use client'
import { Github } from 'lucide-react'

export default function GitHubButton({ size = 'md', className = '' }) {
  const handleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/auth/github`
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  return (
    <button
      onClick={handleLogin}
      className={`
        flex items-center space-x-3 bg-gray-800 hover:bg-gray-700 
        border border-gray-600 hover:border-gray-500 
        rounded-lg font-semibold transition-all duration-200
        hover:transform hover:scale-105
        ${sizeClasses[size]} ${className}
      `}
    >
      <Github className="h-5 w-5" />
      <span>Se connecter avec GitHub</span>
    </button>
  )
      }
