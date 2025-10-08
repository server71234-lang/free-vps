import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Server from '../models/Server.js';
import { stopBotContainer } from './deploy-bot.js';

dotenv.config();

async function cleanupExpiredServers() {
  try {
    console.log('🧹 Début du nettoyage des serveurs expirés...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    const expiredServers = await Server.find({
      expiresAt: { $lte: new Date() },
      status: { $in: ['creating', 'running'] }
    });
    
    console.log(`📊 ${expiredServers.length} serveurs expirés à nettoyer`);
    
    for (const server of expiredServers) {
      try {
        console.log(`🔧 Nettoyage du serveur ${server._id}...`);
        
        // Arrêter le container Docker
        if (server.containerId) {
          await stopBotContainer(server.containerId);
        }
        
        // Marquer comme expiré
        server.status = 'expired';
        server.addLog('Serveur expiré et nettoyé automatiquement', 'warning');
        await server.save();
        
        console.log(`✅ Serveur ${server._id} nettoyé`);
      } catch (serverError) {
        console.error(`❌ Erreur nettoyage serveur ${server._id}:`, serverError);
      }
    }
    
    console.log('✅ Nettoyage terminé avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    process.exit(1);
  }
}

// Exécuter le nettoyage si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupExpiredServers();
}

export { cleanupExpiredServers };
