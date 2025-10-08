'use client'

export default function Card({ 
  children, 
  className = '',
  hover = false,
  ...props 
}) {
  const baseClasses = 'glass-card rounded-xl border border-gray-700'
  const hoverClasses = hover ? 'hover:border-gray-600 hover:transform hover:scale-105 transition-all duration-300' : ''
  
  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
