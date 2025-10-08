import express from 'express';
import Server from '../models/Server.js';
import User from '../models/User.js';
import { ensureAuth } from '../middleware/auth.js';
import { deployBotScript } from '../scripts/deploy-bot.js';

const router = express.Router();

// Créer un nouveau serveur
router.post('/create', ensureAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Vérifier les coins
    if (!user.canCreateServer()) {
      return res.status(400).json({ 
        error: 'Coins insuffisants. 10 coins requis pour créer un serveur.' 
      });
    }

    // Vérifier si l'utilisateur a déjà un serveur actif
    const activeServer = await Server.findOne({ 
      userId: user._id, 
      status: { $in: ['creating', 'running'] } 
    });
    
    if (activeServer) {
      return res.status(400).json({ 
        error: 'Vous avez déjà un serveur actif. Un seul serveur autorisé à la fois.' 
      });
    }

    // Valider les variables d'environnement
    const { envVars } = req.body;
    if (!envVars || !envVars.SESSION_ID) {
      return res.status(400).json({ 
        error: 'SESSION_ID est requis' 
      });
    }

    // Déduire les coins
    const deductionSuccess = user.deductCoins(10);
    if (!deductionSuccess) {
      return res.status(400).json({ 
        error: 'Erreur lors de la déduction des coins' 
      });
    }

    // Calculer la date d'expiration (3 jours)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);

    // Créer le serveur
    const server = new Server({
      userId: user._id,
      envVars: {
        SESSION_ID: envVars.SESSION_ID,
        PREFIX: envVars.PREFIX || '.',
        MODE: envVars.MODE || 'public',
        OWNER_NAME: envVars.OWNER_NAME || user.username,
        OWNER_NUMBER: envVars.OWNER_NUMBER || '',
        AUTO_READ: envVars.AUTO_READ || false,
        AUTO_REACT: envVars.AUTO_REACT || false,
        AUTO_STATUS_SEEN: envVars.AUTO_STATUS_SEEN !== false,
        ANTILINK: envVars.ANTILINK || false,
        BOT_NAME: envVars.BOT_NAME || 'INCONNU XD V2'
      },
      expiresAt
    });

    await server.save();
    await user.save();

    // Ajouter le serveur à la liste de l'utilisateur
    user.servers.push(server._id);
    await user.save();

    // Déployer le bot (asynchrone)
    deployBotScript(server._id.toString(), server.envVars)
      .then(async (deploymentResult) => {
        server.containerId = deploymentResult.containerId;
        server.port = deploymentResult.port;
        server.status = 'running';
        server.addLog('Bot déployé avec succès', 'success');
        await server.save();
      })
      .catch(async (error) => {
        console.error('Erreur déploiement:', error);
        server.status = 'error';
        server.addLog(`Erreur déploiement: ${error.message}`, 'error');
        await server.save();
        
        // Rembourser les coins en cas d'erreur
        user.addCoins(10);
        await user.save();
      });

    res.json({ 
      success: true, 
      server: {
        _id: server._id,
        status: server.status,
        expiresAt: server.expiresAt,
        createdAt: server.createdAt,
        envVars: server.envVars
      },
      message: 'Serveur en cours de création...' 
    });

  } catch (error) {
    console.error('Erreur création serveur:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création du serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Récupérer les serveurs de l'utilisateur
router.get('/my-servers', ensureAuth, async (req, res) => {
  try {
    const servers = await Server.find({ userId: req.user._id })
      .select('-logs -envVars.SESSION_ID') // Exclure les données sensibles
      .sort({ createdAt: -1 })
      .lean();

    // Calculer le temps restant pour chaque serveur
    const serversWithTimeLeft = servers.map(server => {
      const timeLeft = server.expiresAt - new Date();
      const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
      
      return {
        ...server,
        daysLeft: daysLeft > 0 ? daysLeft : 0,
        isExpired: timeLeft <= 0
      };
    });

    res.json(serversWithTimeLeft);
  } catch (error) {
    console.error('Erreur récupération serveurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des serveurs' });
  }
});

// Récupérer un serveur spécifique
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    const server = await Server.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!server) {
      return res.status(404).json({ error: 'Serveur non trouvé' });
    }

    // Ne pas envoyer le SESSION_ID pour des raisons de sécurité
    const serverData = server.toObject();
    delete serverData.envVars.SESSION_ID;

    res.json(serverData);
  } catch (error) {
    console.error('Erreur récupération serveur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du serveur' });
  }
});

// Supprimer un serveur
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    const server = await Server.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!server) {
      return res.status(404).json({ error: 'Serveur non trouvé' });
    }

    // Arrêter le container Docker si existant
    if (server.containerId) {
      try {
        const Docker = (await import('dockerode')).default;
        const docker = new Docker();
        const container = docker.getContainer(server.containerId);
        
        await container.stop().catch(() => {});
        await container.remove().catch(() => {});
        
        server.addLog('Container arrêté et supprimé', 'info');
      } catch (dockerError) {
        console.log('Container déjà arrêté ou inexistant');
      }
    }

    await Server.findByIdAndDelete(req.params.id);
    
    // Retirer le serveur de la liste de l'utilisateur
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { servers: req.params.id }
    });

    res.json({ 
      success: true, 
      message: 'Serveur supprimé avec succès' 
    });
  } catch (error) {
    console.error('Erreur suppression serveur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du serveur' });
  }
});

// Récupérer les logs d'un serveur
router.get('/:id/logs', ensureAuth, async (req, res) => {
  try {
    const server = await Server.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    }).select('logs');

    if (!server) {
      return res.status(404).json({ error: 'Serveur non trouvé' });
    }

    res.json({ logs: server.logs });
  } catch (error) {
    console.error('Erreur récupération logs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des logs' });
  }
});

export default router;
