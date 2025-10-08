'use client'

export default function StatsCard({ icon, title, value, color, subtitle }) {
  return (
    <div className="glass-card p-6 rounded-xl hover:transform hover:scale-105 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gray-800/50 group-hover:scale-110 transition-transform duration-300 ${color}`}>
          {icon}
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${color}`}>{value}</div>
          {subtitle && (
            <div className="text-sm text-gray-400 mt-1">{subtitle}</div>
          )}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 mt-2"></div>
    </div>
  )
}
