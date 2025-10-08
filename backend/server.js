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

// NOTE: Docker désactivé sur Render Free - Simulation uniquement
// const docker = new Docker();

// Trust proxy pour Render
app.set('trust proxy', 1);

// Middleware CORS pour Render
app.use(cors({
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origin (comme mobile apps ou curl)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://inconnu-vps.onrender.com',
      'https://inconnu-vps-frontend.onrender.com',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // En développement, autoriser toutes les origines
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Middleware preflight
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Configuration session pour Render
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  store: new session.MemoryStore() // Utiliser MemoryStore pour Render Free
}));

app.use(passport.initialize());
app.use(passport.session());

// Connexion MongoDB avec meilleure gestion d'erreurs
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connecté à MongoDB Atlas');
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error);
    process.exit(1);
  }
};

connectDB();

// Gestion de la déconnexion MongoDB
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB déconnecté, tentative de reconnexion...');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erreur MongoDB:', err);
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/user', userRoutes);
app.use('/api/referral', referralRoutes);

// Health check amélioré
app.get('/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      service: 'INCONNU VPS Backend',
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      error: error.message 
    });
  }
});

// Route info API
app.get('/api', (req, res) => {
  res.json({
    name: 'INCONNU VPS API',
    version: '1.0.0',
    description: 'Backend pour le déploiement de bots WhatsApp',
    endpoints: {
      auth: '/auth',
      servers: '/api/servers',
      user: '/api/user',
      referral: '/api/referral'
    }
  });
});

// Cron job pour nettoyer les serveurs expirés (adapté pour Render)
cron.schedule('0 */6 * * *', async () => {
  try {
    console.log('🧹 Début du nettoyage des serveurs expirés...');
    
    const expiredServers = await Server.find({ 
      expiresAt: { $lte: new Date() },
      status: { $in: ['creating', 'running'] }
    });

    let cleanedCount = 0;

    for (const server of expiredServers) {
      try {
        // NOTE: Sur Render Free, Docker n'est pas disponible
        // On simule juste la mise à jour du statut
        
        // if (server.containerId) {
        //   try {
        //     const container = docker.getContainer(server.containerId);
        //     await container.stop();
        //     await container.remove();
        //     console.log(`🐳 Container ${server.containerId} arrêté`);
        //   } catch (dockerError) {
        //     console.log(`ℹ️ Container ${server.containerId} déjà arrêté ou inexistant`);
        //   }
        // }

        // Marquer comme expiré
        server.status = 'expired';
        server.addLog('Serveur expiré automatiquement - Nettoyage CRON', 'warning');
        await server.save();
        
        cleanedCount++;
        console.log(`✅ Serveur ${server._id} marqué comme expiré`);
      } catch (serverError) {
        console.error(`❌ Erreur nettoyage serveur ${server._id}:`, serverError);
      }
    }

    console.log(`✅ Nettoyage terminé: ${cleanedCount} serveurs expirés traités`);
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage CRON:', error);
  }
});

// Middleware de logging des requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Error handling middleware amélioré
app.use((err, req, res, next) => {
  console.error('🚨 Error:', err);

  // Erreur MongoDB
  if (err.name === 'MongoError' || err.name === 'MongoNetworkError') {
    return res.status(503).json({ 
      error: 'Service temporairement indisponible',
      code: 'DATABASE_ERROR'
    });
  }

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Données invalides',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  // Erreur CORS
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'Origine non autorisée',
      code: 'CORS_ERROR'
    });
  }

  // Erreur générique
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler amélioré
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method
  });
});

// Gestion graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Arrêt du serveur en cours...');
  await mongoose.connection.close();
  console.log('✅ MongoDB déconnecté');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Arrêt du serveur (SIGTERM)...');
  await mongoose.connection.close();
  console.log('✅ MongoDB déconnecté');
  process.exit(0);
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 INCONNU VPS Backend démarré !
📍 Port: ${PORT}
🌐 Environnement: ${process.env.NODE_ENV || 'development'}
📊 MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Connecté' : '❌ Déconnecté'}
🕒 Démarrage: ${new Date().toISOString()}
  `);
});

export default app;
