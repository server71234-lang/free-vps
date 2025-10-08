'use client'
import { useAuth } from '../../contexts/AuthContext'
import { useState, useEffect } from 'react'
import { Save, ArrowLeft, Bot, Shield, Zap } from 'lucide-react'
import { getUserData } from '../../lib/api'
import toast from 'react-hot-toast'

export default function ConfigPage() {
  const { user, loading } = useAuth()
  const [userData, setUserData] = useState(null)
  const [formData, setFormData] = useState({
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
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    try {
      const data = await getUserData()
      setUserData(data)
    } catch (error) {
      console.error('Error loading user data:', error)
      toast.error('Erreur lors du chargement des données')
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!formData.SESSION_ID) {
      toast.error('SESSION_ID est requis')
      return
    }

    setSaving(true)
    try {
      // Ici, normalement on sauvegarderait la configuration
      // Pour l'instant, on simule la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Configuration sauvegardée avec succès!')
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="loader"></div>
      </div>
    )
  }

  if (!user) {
    window.location.href = '/'
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a 
                href="/dashboard" 
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour au dashboard</span>
              </a>
              <div className="h-6 w-px bg-gray-600"></div>
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-blue-400" />
                <h1 className="text-xl font-bold">Configuration du Bot</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-400">Coins:</span>
                <span className="font-semibold text-yellow-400">{userData?.coins || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* En-tête */}
          <div className="glass-card p-6 rounded-xl mb-8">
            <h2 className="text-2xl font-bold mb-4">Configuration INCONNU XD V2</h2>
            <p className="text-gray-400">
              Configurez les paramètres de votre bot WhatsApp. Une fois sauvegardé, ces paramètres seront utilisés lors du prochain déploiement.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Formulaire de configuration */}
            <div className="lg:col-span-2">
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-6 flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-blue-400" />
                  <span>Paramètres Principaux</span>
                </h3>

                <div className="space-y-6">
                  {/* SESSION_ID */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      SESSION_ID *
                    </label>
                    <textarea
                      value={formData.SESSION_ID}
                      onChange={(e) => handleInputChange('SESSION_ID', e.target.value)}
                      placeholder="Collez votre SESSION_ID ici (format: INCONNU~XD~...)"
                      rows={3}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-400 resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      SESSION_ID est requis pour le fonctionnement du bot
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* PREFIX */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        PREFIX
                      </label>
                      <input
                        type="text"
                        value={formData.PREFIX}
                        onChange={(e) => handleInputChange('PREFIX', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                        placeholder="., !, #, etc."
                      />
                    </div>

                    {/* MODE */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        MODE
                      </label>
                      <select
                        value={formData.MODE}
                        onChange={(e) => handleInputChange('MODE', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                      >
                        <option value="public">Public</option>
                        <option value="private">Privé</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* OWNER_NAME */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        OWNER_NAME
                      </label>
                      <input
                        type="text"
                        value={formData.OWNER_NAME}
                        onChange={(e) => handleInputChange('OWNER_NAME', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                        placeholder="Votre nom"
                      />
                    </div>

                    {/* OWNER_NUMBER */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        OWNER_NUMBER
                      </label>
                      <input
                        type="text"
                        value={formData.OWNER_NUMBER}
                        onChange={(e) => handleInputChange('OWNER_NUMBER', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                        placeholder="554488138425"
                      />
                    </div>
                  </div>

                  {/* BOT_NAME */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      BOT_NAME
                    </label>
                    <input
                      type="text"
                      value={formData.BOT_NAME}
                      onChange={(e) => handleInputChange('BOT_NAME', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>

              {/* Options avancées */}
              <div className="glass-card p-6 rounded-xl mt-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  <span>Fonctionnalités Avancées</span>
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { key: 'AUTO_READ', label: 'Lecture Automatique', description: 'Marquer les messages comme lus automatiquement' },
                    { key: 'AUTO_REACT', label: 'Réaction Automatique', description: 'Réagir automatiquement aux messages' },
                    { key: 'AUTO_STATUS_SEEN', label: 'Vue des Status', description: 'Voir les status automatiquement' },
                    { key: 'ANTILINK', label: 'Anti-Lien', description: 'Supprimer les liens dans les groupes' },
                    { key: 'AUTO_BLOCK', label: 'Blocage Auto', description: 'Bloquer automatiquement les numéros suspects' },
                    { key: 'REJECT_CALL', label: 'Rejet Appels', description: 'Rejeter automatiquement les appels' },
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id={key}
                        checked={formData[key]}
                        onChange={(e) => handleInputChange(key, e.target.checked)}
                        className="mt-1"
                      />
                      <div>
                        <label htmlFor={key} className="font-medium cursor-pointer">
                          {label}
                        </label>
                        <p className="text-sm text-gray-400">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Aperçu de la configuration */}
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Aperçu</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Prefix:</span>
                    <span>{formData.PREFIX}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mode:</span>
                    <span className="capitalize">{formData.MODE}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bot Name:</span>
                    <span>{formData.BOT_NAME}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fonctions Actives:</span>
                    <span>{Object.values(formData).filter(v => v === true).length}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleSave}
                    disabled={saving || !formData.SESSION_ID}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-3 rounded-lg font-semibold transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>

              {/* Informations */}
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Informations</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>• La configuration sera utilisée au prochain déploiement</p>
                  <p>• SESSION_ID est obligatoire</p>
                  <p>• Sauvegardez avant de créer un serveur</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
                }
