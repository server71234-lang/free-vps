export function formatDate(dateString) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function formatTimeRemaining(expiresAt) {
  const now = new Date()
  const timeLeft = new Date(expiresAt) - now
  
  if (timeLeft <= 0) {
    return 'Expiré'
  }
  
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) {
    return `${days}j ${hours}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

export function getStatusColor(status) {
  const statusColors = {
    creating: 'text-yellow-400',
    running: 'text-green-400',
    stopped: 'text-gray-400',
    expired: 'text-red-400',
    error: 'text-red-500'
  }
  return statusColors[status] || 'text-gray-400'
}

export function getStatusBadgeColor(status) {
  const statusColors = {
    creating: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    running: 'bg-green-500/20 text-green-400 border-green-500/30',
    stopped: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    expired: 'bg-red-500/20 text-red-400 border-red-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30'
  }
  return statusColors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

export function copyToClipboard(text) {
  return new Promise((resolve, reject) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(resolve).catch(reject)
    } else {
      // Fallback pour les anciens navigateurs
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        resolve()
      } catch (err) {
        reject(err)
      }
      document.body.removeChild(textArea)
    }
  })
}

export function generateRandomId() {
  return Math.random().toString(36).substr(2, 9)
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
