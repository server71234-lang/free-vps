import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'INCONNU VPS - Déploiement de Bots WhatsApp',
  description: 'Déployez votre bot WhatsApp gratuitement pendant 3 jours avec notre système VPS avancé',
  keywords: 'whatsapp bot, vps, déploiement, inconnu, bot',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                border: '1px solid #374151',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#1f2937',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#1f2937',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
    }
