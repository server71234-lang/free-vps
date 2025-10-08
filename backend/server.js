import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import Docker from 'dockerode';

// Import models
import User from './models/User.js';
import Server from './models/Server.js';
import Referral from './models/Referral.js';

// Import routes
import authRoutes from './routes/auth.js';
import serverRoutes from './routes/servers.js';
import userRoutes from './routes/user.js';
import referralRoutes from './routes/referral.js';

// Import config
import './config/passport.js';

dotenv.config();

const app = express();
const docker = new Docker();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// Routes
app.use('/auth', authRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/user', userRoutes);
app.use('/api/referral', referralRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'INCONNU VPS Backend'
  });
});

// Cron job pour nettoyer les serveurs expirés
cron.schedule('0 */6 * * *', async () => {
  try {
    console.log('🧹 Nettoyage des serveurs expirés...');
    const expiredServers = await Server.find({ 
      expiresAt: { $lte: new Date() },
      status: { $ne: 'expired' }
    });

    for (const server of expiredServers) {
      // Arrêter le container Docker si existant
      if (server.containerId) {
        try {
          const container = docker.getContainer(server.containerId);
          await container.stop();
          await container.remove();
        } catch (dockerError) {
          console.log(`Container ${server.containerId} déjà arrêté ou supprimé`);
        }
      }

      // Marquer comme expiré
      server.status = 'expired';
      await server.save();
      console.log(`✅ Serveur ${server._id} marqué comme expiré`);
    }

    console.log(`✅ Nettoyage terminé: ${expiredServers.length} serveurs expirés`);
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend INCONNU VPS démarré sur le port ${PORT}`);
  console.log(`🌐 Environnement: ${process.env.NODE_ENV || 'development'}`);
});
