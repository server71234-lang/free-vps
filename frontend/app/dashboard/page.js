'use client'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect, useState } from 'react'
import { Coins, Server, Users, Copy, Plus, Settings, LogOut } from 'lucide-react'
import StatsCard from '../../components/Dashboard/StatsCard'
import ServerList from '../../components/Dashboard/ServerList'
import CreateServerModal from '../../components/Dashboard/CreateServerModal'
import ReferralSection from '../../components/Dashboard/ReferralSection'
import { getServers, getUserData, logout } from '../../lib/api'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user, loading, checkAuth } = useAuth()
  const [servers, setServers] = useState([])
  const [userData, setUserData] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [dashboardLoading, setDashboardLoading] = useState(true)

  useEffect(() => {
    if (user && !loading) {
      loadData()
    }
  }, [user, loading])

  const loadData = async () => {
    try {
      const [serversData, userData] = await Promise.all([
        getServers(),
        getUserData()
      ])
      setServers(serversData)
      setUserData(userData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setDashboardLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      checkAuth()
      toast.success('Déconnexion réussie')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Erreur lors de la déconnexion')
    }
  }

  if (loading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="loader mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Redirection vers la page de connexion...</p>
          <div className="loader mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Navigation Dashboard */}
      <nav className="border-b border-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Server className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Dashboard</h1>
                <p className="text-sm text-gray-400">Bienvenue, {user.username}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-lg">
                <Coins className="h-4 w-4 text-yellow-400" />
                <span className="font-semibold">{userData?.coins || 0} coins</span>
              </div>
              
              <a
                href="/config"
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Config</span>
              </a>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            icon={<Coins className="h-6 w-6" />}
            title="Coins Disponibles"
            value={userData?.coins || 0}
            color="text-yellow-400"
            subtitle="10 coins par serveur"
          />
          <StatsCard
            icon={<Server className="h-6 w-6" />}
            title="Serveurs Actifs"
            value={servers.filter(s => s.status === 'running').length}
            color="text-green-400"
            subtitle="Maximum 1 serveur actif"
          />
          <StatsCard
            icon={<Users className="h-6 w-6" />}
            title="Referrals"
            value={userData?.stats?.referralsCount || 0}
            color="text-blue-400"
            subtitle={`${userData?.stats?.totalReferralCoins || 0} coins gagnés`}
          />
        </div>

        {/* Actions Rapides */}
        <div className="glass-card p-6 rounded-xl mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Actions Rapides</h2>
              <p className="text-gray-400">Gérez vos serveurs et gagnez des coins</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={userData?.coins < 10 || servers.some(s => s.status === 'running')}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Créer un VPS (10 coins)</span>
              </button>
              
              <a
                href="/referral"
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>Parrainage</span>
              </a>
            </div>
          </div>
        </div>

        {/* Contenu Principal */}
        <div className="grid lg:grid-cols-2 gap-8">
          <ServerList servers={servers} onUpdate={loadData} />
          <ReferralSection user={userData} />
        </div>

        {/* Modal de création */}
        {showCreateModal && (
          <CreateServerModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false)
              loadData()
              toast.success('Serveur créé avec succès!')
            }}
          />
        )}
      </div>
    </div>
  )
    }
