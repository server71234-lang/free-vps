'use client'
import { useState, useEffect } from 'react'
import { Users, Copy, Share2, Gift, TrendingUp } from 'lucide-react'
import { getReferralInfo, generateReferralCode } from '../../lib/api'
import { copyToClipboard } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function ReferralSection({ user }) {
  const [referralInfo, setReferralInfo] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadReferralInfo()
  }, [user])

  const loadReferralInfo = async () => {
    try {
      const info = await getReferralInfo()
      setReferralInfo(info)
    } catch (error) {
      console.error('Error loading referral info:', error)
    }
  }

  const handleCopyLink = async () => {
    if (!referralInfo?.referralLink) return
    
    try {
      await copyToClipboard(referralInfo.referralLink)
      setCopied(true)
      toast.success('Lien copié dans le presse-papier!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Erreur lors de la copie')
    }
  }

  const handleShare = async () => {
    if (navigator.share && referralInfo?.referralLink) {
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
      handleCopyLink()
    }
  }

  const handleGenerateNewCode = async () => {
    if (!confirm('Générer un nouveau code de parrainage ? L\'ancien ne fonctionnera plus.')) {
      return
    }

    try {
      const result = await generateReferralCode()
      setReferralInfo(result)
      toast.success('Nouveau code généré avec succès!')
    } catch (error) {
      console.error('Error generating code:', error)
      toast.error('Erreur lors de la génération du code')
    }
  }

  if (!referralInfo) {
    return (
      <div className="glass-card p-6 rounded-xl">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center space-x-2">
          <Users className="h-5 w-5 text-green-400" />
          <span>Système de Parrainage</span>
        </h2>
        <div className="flex items-center space-x-2 text-yellow-400">
          <Gift className="h-4 w-4" />
          <span className="text-sm font-semibold">+10 coins par ami</span>
        </div>
      </div>

      {/* Code de parrainage */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3 text-gray-400">
          Votre code de parrainage
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={referralInfo.referralCode}
            readOnly
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 font-mono text-lg text-center"
          />
          <button
            onClick={handleCopyLink}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-semibold transition-colors"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={handleGenerateNewCode}
          className="text-xs text-gray-400 hover:text-white mt-2 transition-colors"
        >
          Générer un nouveau code
        </button>
      </div>

      {/* Lien de parrainage */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3 text-gray-400">
          Lien de parrainage complet
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={referralInfo.referralLink}
            readOnly
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm"
          />
          <button
            onClick={handleShare}
            className="bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg font-semibold transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-purple-400" />
          <span>Vos Performances</span>
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Total parrainés"
            value={referralInfo.stats?.totalReferrals || 0}
            color="text-blue-400"
          />
          <StatCard
            label="Coins gagnés"
            value={referralInfo.stats?.totalCoins || 0}
            color="text-yellow-400"
            isCoins={true}
          />
        </div>
      </div>

      {/* Informations */}
      <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center space-x-3">
          <Gift className="h-5 w-5 text-green-400" />
          <div className="text-sm">
            <p className="text-green-400 font-medium">Comment gagner plus ?</p>
            <p className="text-green-300">
              Partagez votre lien avec vos amis. Chaque inscription via votre lien vous rapporte <strong>10 coins</strong> immédiatement!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, isCoins = false }) {
  return (
    <div className="bg-gray-800/30 rounded-lg p-4 text-center">
      <div className={`text-2xl font-bold ${color} mb-1`}>
        {value} {isCoins && '🪙'}
      </div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  )
    }
