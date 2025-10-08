const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

class APIError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'APIError'
    this.status = status
  }
}

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      if (response.status === 401) {
        // Rediriger vers la page de connexion si non authentifié
        window.location.href = '/'
        throw new APIError('Non authentifié', 401)
      }
      
      const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
      throw new APIError(errorData.error || 'Erreur API', response.status)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    throw new APIError('Erreur réseau', 0)
  }
}

// Auth API
export async function checkAuth() {
  return fetchAPI('/auth/check')
}

export async function getUser() {
  return fetchAPI('/auth/user')
}

export async function logout() {
  return fetchAPI('/auth/logout', { method: 'POST' })
}

// User API
export async function getUserData() {
  return fetchAPI('/api/user/profile')
}

export async function updateProfile(data) {
  return fetchAPI('/api/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// Servers API
export async function getServers() {
  return fetchAPI('/api/servers/my-servers')
}

export async function createServer(envVars) {
  return fetchAPI('/api/servers/create', {
    method: 'POST',
    body: JSON.stringify({ envVars }),
  })
}

export async function deleteServer(serverId) {
  return fetchAPI(`/api/servers/${serverId}`, {
    method: 'DELETE',
  })
}

export async function getServerLogs(serverId) {
  return fetchAPI(`/api/servers/${serverId}/logs`)
}

// Referral API
export async function getReferralInfo() {
  return fetchAPI('/api/referral/info')
}

export async function getReferralStats() {
  return fetchAPI('/api/referral/stats/detailed')
}

export async function generateReferralCode() {
  return fetchAPI('/api/referral/generate-code', {
    method: 'POST',
  })
}

export async function checkReferralCode(code) {
  return fetchAPI(`/api/referral/check/${code}`)
}

export async function getReferralHistory() {
  return fetchAPI('/api/user/referrals/history')
}
