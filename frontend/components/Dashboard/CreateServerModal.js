'use client'
import { useState, useEffect } from 'react'
import { X, Save, Bot, Shield, Zap, HelpCircle } from 'lucide-react'
import { createServer } from '../../lib/api'
import toast from 'react-hot-toast'

export default function CreateServerModal({ onClose, onSuccess }) {
  const [envVars, setEnvVars] = useState({
    SESSION_ID: '',
    PREFIX: '.',
    MODE: 'public',
    OWNER_NAME: '',
    OWNER_NUMBER: '',
    BOT_NAME: 'INCONNU XD V2',
    AUTO_READ: false,
    AUTO_REACT: false,
    AUTO_STATUS_SEEN: true,
    ANTILINK: false,
    AUTO_BLOCK: true,
    REJECT_CALL: false
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  useEffect(() => {
    // Empêcher le défilement de l'arrière-plan
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!envVars.SESSION_ID) {
      toast.error('SESSION_ID est requis pour créer un serveur')
      return
    }

    if (!envVars.SESSION_ID.includes('INCONNU~XD~')) {
      toast.error('SESSION_ID doit contenir le format INCONNU~XD~')
      return
    }

    setLoading(true)

    try {
      await createServer(envVars)
      onSuccess()
    } catch (error) {
      console.error('Error creating server:', error)
      toast.error(error.message || 'Erreur lors de la création du serveur')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key, value) => {
    setEnvVars(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const tabs = [
    { id: 'basic', label: 'Basique', icon: Bot },
    { id: 'advanced', label: 'Avancé', icon: Zap },
    { id: 'security', label: 'Sécurité', icon: Shield }
  ]

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold">Créer un Serveur VPS</h2>
            <p className="text-gray-400 mt-1">
              Configurez et déployez votre bot WhatsApp INCONNU XD V2
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          {/* Navigation par onglets */}
          <div className="w-64 border-r border-gray-700 bg-gray-800/50">
            <div className="p-4 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Contenu du formulaire */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Onglet Basique */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center space-x-2">
                      <span>SESSION_ID *</span>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </label>
                    <textarea
                      required
                      value={envVars.SESSION_ID}
                      onChange={(e) => handleChange('SESSION_ID', e.target.value)}
                      placeholder="Collez votre SESSION_ID ici (doit contenir INCONNU~XD~...)"
                      rows={4}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-400 resize-none font-mono text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Le SESSION_ID est essentiel pour l'authentification de votre bot WhatsApp.
                      Assurez-vous qu'il contient le format "INCONNU~XD~".
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">PREFIX</label>
                      <input
                        type="text"
                        value={envVars.PREFIX}
                        onChange={(e) => handleChange('PREFIX', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                        placeholder="., !, #, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">MODE</label>
                      <select
                        value={envVars.MODE}
                        onChange={(e) => handleChange('MODE', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                      >
                        <option value="public">Public</option>
                        <option value="private">Privé</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">OWNER_NAME</label>
                      <input
                        type="text"
                        value={envVars.OWNER_NAME}
                        onChange={(e) => handleChange('OWNER_NAME', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                        placeholder="Votre nom"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">OWNER_NUMBER</label>
                      <input
                        type="text"
                        value={envVars.OWNER_NUMBER}
                        onChange={(e) => handleChange('OWNER_NUMBER', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                        placeholder="554488138425"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">BOT_NAME</label>
                    <input
                      type="text"
                      value={envVars.BOT_NAME}
                      onChange={(e) => handleChange('BOT_NAME', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              )}

              {/* Onglet Avancé */}
              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    <span>Fonctionnalités Automatiques</span>
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { key: 'AUTO_READ', label: 'Lecture Automatique', description: 'Marquer les messages comme lus automatiquement' },
                      { key: 'AUTO_REACT', label: 'Réaction Automatique', description: 'Réagir automatiquement aux messages' },
                      { key: 'AUTO_STATUS_SEEN', label: 'Vue des Status', description: 'Voir les status automatiquement' },
                      { key: 'ANTILINK', label: 'Anti-Lien', description: 'Supprimer les liens dans les groupes' },
                    ].map(({ key, label, description }) => (
                      <div key={key} className="flex items-start space-x-3 p-4 bg-gray-800/30 rounded-lg">
                        <input
                          type="checkbox"
                          id={key}
                          checked={envVars[key]}
                          onChange={(e) => handleChange(key, e.target.checked)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <label htmlFor={key} className="font-medium cursor-pointer block mb-1">
                            {label}
                          </label>
                          <p className="text-sm text-gray-400">{description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Onglet Sécurité */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-400" />
                    <span>Paramètres de Sécurité</span>
                  </h3>

                  <div className="space-y-4">
                    {[
                      { key: 'AUTO_BLOCK', label: 'Blocage Automatique', description: 'Bloquer automatiquement les numéros suspects et les spammeurs', default: true },
                      { key: 'REJECT_CALL', label: 'Rejet des Appels', description: 'Rejeter automatiquement les appels entrants', default: false },
                    ].map(({ key, label, description, default: defaultVal }) => (
                      <div key={key} className="flex items-start space-x-3 p-4 bg-gray-800/30 rounded-lg">
                        <input
                          type="checkbox"
                          id={key}
                          checked={envVars[key] !== undefined ? envVars[key] : defaultVal}
                          onChange={(e) => handleChange(key, e.target.checked)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <label htmlFor={key} className="font-medium cursor-pointer block mb-1">
                            {label}
                          </label>
                          <p className="text-sm text-gray-400">{description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Info className="h-5 w-5 text-blue-400" />
                      <div className="text-sm">
                        <p className="text-blue-400 font-medium">Recommandations de sécurité</p>
                        <p className="text-blue-300">
                          Nous recommandons de garder le blocage automatique activé pour protéger votre bot contre les utilisateurs malveillants.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Résumé et actions */}
              <div className="border-t border-gray-700 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Coût du déploiement</p>
                    <p className="text-2xl font-bold text-yellow-400">10 coins</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Durée</p>
                    <p className="text-lg font-semibold text-green-400">3 jours</p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !envVars.SESSION_ID}
                    className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>
                      {loading ? 'Création...' : 'Créer le Serveur'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
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
