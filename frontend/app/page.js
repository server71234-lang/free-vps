'use client'
import { useAuth } from '../contexts/AuthContext'
import GitHubButton from '../components/Auth/GitHubButton'
import { Bot, Clock, Users, Zap, Server, Shield, Rocket } from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="loader"></div>
      </div>
    )
  }

  if (user) {
    window.location.href = '/dashboard'
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Background animé */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-900 to-purple-900/20"></div>
      
      {/* Navigation */}
      <nav className="relative border-b border-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                INCONNU VPS
              </span>
            </div>
            <GitHubButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative container mx-auto px-6 py-20 text-center fade-in">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              INCONNU VPS
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Déployez votre bot WhatsApp gratuitement pendant 3 jours avec notre système VPS avancé
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <GitHubButton size="lg" />
            <a 
              href="#features" 
              className="px-8 py-3 border border-gray-600 rounded-lg hover:border-gray-400 transition-colors text-gray-300 hover:text-white"
            >
              En savoir plus
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto mb-20">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">3</div>
              <div className="text-gray-400 text-sm">Jours Gratuits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">10</div>
              <div className="text-gray-400 text-sm">Coins Offerts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">1-Click</div>
              <div className="text-gray-400 text-sm">Déploiement</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">24/7</div>
              <div className="text-gray-400 text-sm">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Fonctionnalités Principales
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Clock className="h-12 w-12 text-blue-400" />}
              title="3 Jours Gratuits"
              description="Testez votre bot WhatsApp pendant 3 jours sans engagement. Performance optimisée et stabilité garantie."
            />
            
            <FeatureCard
              icon={<Zap className="h-12 w-12 text-green-400" />}
              title="Déploiement Instantané"
              description="Lancez votre bot en un clic. Configuration automatique et mise en service immédiate."
            />
            
            <FeatureCard
              icon={<Users className="h-12 w-12 text-purple-400" />}
              title="Système de Parrainage"
              description="Gagnez 10 coins pour chaque ami parrainé. Augmentez votre crédit gratuitement."
            />
            
            <FeatureCard
              icon={<Server className="h-12 w-12 text-cyan-400" />}
              title="VPS Haute Performance"
              description="Serveurs optimisés pour bots WhatsApp. Ressources dédiées et connexion stable."
            />
            
            <FeatureCard
              icon={<Shield className="h-12 w-12 text-yellow-400" />}
              title="Sécurité Avancée"
              description="Protection des données et isolation des services. Votre bot en toute sécurité."
            />
            
            <FeatureCard
              icon={<Rocket className="h-12 w-12 text-red-400" />}
              title="Interface Moderne"
              description="Dashboard intuitif et design futuriste. Gestion simplifiée de votre bot."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Comment ça marche ?
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <StepCard
              step="1"
              title="Connexion GitHub"
              description="Connectez-vous simplement avec votre compte GitHub en un clic"
            />
            <StepCard
              step="2"
              title="Configuration"
              description="Remplissez les variables d'environnement de votre bot"
            />
            <StepCard
              step="3"
              title="Déploiement"
              description="Lancez le déploiement et obtenez 10 coins gratuits"
            />
            <StepCard
              step="4"
              title="Utilisation"
              description="Votre bot est opérationnel pour 3 jours gratuits"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto glass-card p-8 rounded-2xl">
            <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
            <p className="text-gray-300 mb-8">
              Rejoignez des centaines de développeurs qui utilisent INCONNU VPS pour leurs bots WhatsApp
            </p>
            <GitHubButton size="lg" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-gray-800/50 py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bot className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold text-white">INCONNU VPS</span>
          </div>
          <p className="text-gray-400">
            Plateforme de déploiement de bots WhatsApp - Développé avec ❤️ inconnu boy
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="glass-card p-6 rounded-xl hover:transform hover:scale-105 transition-all duration-300 group">
      <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}

function StepCard({ step, title, description }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">
        {step}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  )
        }
