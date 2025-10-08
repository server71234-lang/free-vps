'use client'
import { useState } from 'react'
import { Server, Clock, Trash2, Play, StopCircle, AlertCircle, CheckCircle } from 'lucide-react'
import { deleteServer } from '../../lib/api'
import { formatDate, formatTimeRemaining, getStatusBadgeColor, getStatusColor } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function ServerList({ servers, onUpdate }) {
  const [deletingId, setDeletingId] = useState(null)

  const handleDeleteServer = async (serverId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce serveur ?')) {
      return
    }

    setDeletingId(serverId)
    try {
      await deleteServer(serverId)
      toast.success('Serveur supprimé avec succès')
      onUpdate()
    } catch (error) {
      console.error('Error deleting server:', error)
      toast.error('Erreur lors de la suppression du serveur')
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusIcon = (status) => {
    const icons = {
      creating: <AlertCircle className="h-4 w-4 text-yellow-400" />,
      running: <CheckCircle className="h-4 w-4 text-green-400" />,
      stopped: <StopCircle className="h-4 w-4 text-gray-400" />,
      expired: <Clock className="h-4 w-4 text-red-400" />,
      error: <AlertCircle className="h-4 w-4 text-red-400" />
    }
    return icons[status] || <Server className="h-4 w-4" />
  }

  if (servers.length === 0) {
    return (
      <div className="glass-card p-8 rounded-xl text-center">
        <Server className="h-16 w-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Aucun serveur</h3>
        <p className="text-gray-400 mb-4">
          Vous n'avez pas encore créé de serveur VPS.
        </p>
        <p className="text-sm text-gray-500">
          Créez votre premier serveur pour déployer votre bot WhatsApp
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center space-x-2">
          <Server className="h-5 w-5 text-blue-400" />
          <span>Vos Serveurs VPS</span>
        </h2>
        <div className="text-sm text-gray-400">
          {servers.filter(s => s.status === 'running').length} / 1 actif
        </div>
      </div>

      <div className="space-y-4">
        {servers.map((server) => (
          <div
            key={server._id}
            className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getStatusIcon(server.status)}
                <div>
                  <h3 className="font-semibold text-white">{server.name}</h3>
                  <p className="text-sm text-gray-400">
                    Créé le {formatDate(server.createdAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(server.status)}`}>
                  {server.status === 'creating' && 'En création'}
                  {server.status === 'running' && 'En ligne'}
                  {server.status === 'stopped' && 'Arrêté'}
                  {server.status === 'expired' && 'Expiré'}
                  {server.status === 'error' && 'Erreur'}
                </span>
                
                {server.status !== 'expired' && (
                  <button
                    onClick={() => handleDeleteServer(server._id)}
                    disabled={deletingId === server._id}
                    className="p-2 text-gray-400 hover:text-red-400 disabled:opacity-50 transition-colors"
                    title="Supprimer le serveur"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Port:</span>
                <span className="ml-2 text-white">
                  {server.port ? server.port : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Mode:</span>
                <span className="ml-2 text-white capitalize">
                  {server.envVars?.MODE || 'public'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Prefix:</span>
                <span className="ml-2 text-white font-mono">
                  {server.envVars?.PREFIX || '.'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Temps restant:</span>
                <span className={`ml-2 ${server.status === 'expired' ? 'text-red-400' : 'text-green-400'}`}>
                  {formatTimeRemaining(server.expiresAt)}
                </span>
              </div>
            </div>

            {server.status === 'running' && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex items-center space-x-2 text-sm text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Bot opérationnel</span>
                </div>
              </div>
            )}

            {server.status === 'error' && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex items-center space-x-2 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>Erreur lors du déploiement</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-center space-x-3">
          <Info className="h-5 w-5 text-blue-400" />
          <div className="text-sm">
            <p className="text-blue-400 font-medium">Information importante</p>
            <p className="text-blue-300">
              Chaque serveur coûte 10 coins et expire automatiquement après 3 jours.
              Vous ne pouvez avoir qu'un seul serveur actif à la fois.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Info({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  )
      }
