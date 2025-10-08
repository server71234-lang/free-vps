'use client'

export default function Loading({ 
  size = 'md', 
  text = 'Chargement...',
  className = '' 
}) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-400 ${sizes[size]}`}></div>
      {text && (
        <p className="mt-2 text-gray-400 text-sm">{text}</p>
      )}
    </div>
  )
}
