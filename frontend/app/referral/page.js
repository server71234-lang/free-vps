'use client'
import { useAuth } from '../../contexts/AuthContext'
import { useState, useEffect } from 'react'
import { Users, Copy, Share2, Gift, ArrowLeft, TrendingUp } from 'lucide-react'
import { getReferralInfo, getReferralStats } from '../../lib/api'
import toast from 'react-hot-toast'

export default function ReferralPage() {
  const { user, loading } = useAuth()
  const [referralInfo, setReferralInfo] = useState(null)
  const [referralStats, setReferralStats] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (user) {
      loadReferralData()
    }
  }, [user])

  const loadReferralData = async () => {
    try {
      const [info, stats] = await Promise.all([
        getReferralInfo(),
        getReferralStats()
      ])
      setReferralInfo(info)
      setReferralStats(stats)
    } catch (error) {
      console.error('Error loading referral data:', error)
      toast.error('Erreur lors du chargement des données')
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Lien copié dans le presse-papier!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Erreur lors de la copie')
    }
  }

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoins INCONNU VPS',
          text: 'Déploie ton bot WhatsApp gratuitement pendant 3 jours!',
          url: referralInfo.referralLink,
        })
      } catch (err) {
        console.log('Erreur partage:', err)
      }
    } else {
      copyToClipboard(referralInfo.referralLink)
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
                <Users className="h-5 w-5 text-green-400" />
                <h1 className="text-xl font-bold">Système de Parrainage</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* En-tête */}
          <div className="glass-card p-8 rounded-xl mb-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Gagnez des Coins Gratuits</h1>
            <p className="text-gray-300 text-lg">
              Parrainez vos amis et recevez <span className="text-yellow-400 font-semibold">10 coins</span> pour chaque inscription
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Lien de parrainage */}
            <div className="lg:col-span-2 glass-card p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <Share2 className="h-5 w-5 text-blue-400" />
                <span>Votre Lien de Parrainage</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">
                    Code de parrainage
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={referralInfo?.referralCode || ''}
                      readOnly
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 font-mono text-lg"
                    />
                    <button
                      onClick={() => copyToClipboard(referralInfo?.referralCode)}
                      className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">
                    Lien de parrainage complet
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={referralInfo?.referralLink || ''}
                      readOnly
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm"
                    />
                    <button
                      onClick={shareReferral}
                      className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="glass-card p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <span>Vos Statistiques</span>
              </h2>
              
              <div className="space-y-4">
                <StatItem
                  label="Total des parrainages"
                  value={referralStats?.totalReferrals || 0}
                  color="text-blue-400"
                />
                <StatItem
                  label="Cette semaine"
                  value={referralStats?.weeklyReferrals || 0}
                  color="text-green-400"
                />
                <StatItem
                  label="Ce mois"
                  value={referralStats?.monthlyReferrals || 0}
                  color="text-yellow-400"
                />
                <StatItem
                  label="Coins gagnés"
                  value={referralStats?.totalCoins || 0}
                  color="text-yellow-400"
                  isCoins={true}
                />
              </div>
            </div>
          </div>

          {/* Comment ça marche */}
          <div className="glass-card p-6 rounded-xl mb-8">
            <h2 className="text-xl font-semibold mb-6">Comment fonctionne le parrainage ?</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Step
                number="1"
                title="Partagez votre lien"
                description="Envoyez votre lien de parrainage à vos amis"
              />
              <Step
                number="2"
                title="Inscription via GitHub"
                description="Vos amis s'inscrivent avec GitHub via votre lien"
              />
              <Step
                number="3"
                title="Recevez vos coins"
                description="Vous recevez 10 coins immédiatement après leur inscription"
              />
            </div>
          </div>

          {/* Derniers parrainages */}
          {referralStats?.recentReferrals && referralStats.recentReferrals.length > 0 && (
            <div className="glass-card p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Derniers Parrainages</h2>
              <div className="space-y-3">
                {referralStats.recentReferrals.map((referral, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">
                          {referral.referredUser?.username || 'Utilisateur'}
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(referral.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    <div className="text-yellow-400 font-semibold">
                      +{referral.coinsEarned} coins
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatItem({ label, value, color, isCoins = false }) {
  return (
    <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
      <span className="text-gray-400">{label}</span>
      <span className={`font-semibold ${color}`}>
        {value} {isCoins && 'coins'}
      </span>
    </div>
  )
}

function Step({ number, title, description }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-3 mx-auto">
        {number}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  )
          }
