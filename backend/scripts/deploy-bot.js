import Docker from 'dockerode';
import Server from '../models/Server.js';

const docker = new Docker();

export async function deployBotScript(serverId, envVars) {
  try {
    console.log(`🚀 Déploiement du serveur ${serverId}...`);
    
    // Mettre à jour le statut du serveur
    const server = await Server.findById(serverId);
    server.status = 'creating';
    server.addLog('Démarrage du déploiement...', 'info');
    await server.save();

    // Préparer les variables d'environnement pour Docker
    const dockerEnv = Object.entries(envVars).map(([key, value]) => 
      `${key}=${value}`
    );

    // Créer le container Docker
    const container = await docker.createContainer({
      Image: 'node:18-alpine',
      name: `inconnu-bot-${serverId}`,
      Env: [
        ...dockerEnv,
        'NODE_ENV=production',
        'PORT=3000'
      ],
      Cmd: [
        '/bin/sh', '-c', `
          # Mise à jour et installation des dépendances
          apk add --no-cache wget unzip curl python3 make g++
          
          # Création du répertoire de l'application
          mkdir -p /app
          cd /app
          
          # Téléchargement du bot INCONNU
          echo "📥 Téléchargement du bot INCONNU..."
          wget -q https://github.com/prm123456789/N/archive/refs/heads/main.zip
          unzip -q main.zip
          cd N-main
          
          # Création du fichier config.cjs
          echo "⚙️ Configuration des variables d'environnement..."
          cat > config.cjs << 'EOF'
          const fs = require("fs");
          require("dotenv").config();
          
          const config = {
            SESSION_ID: process.env.SESSION_ID || "",
            PREFIX: process.env.PREFIX || ".",
            MODE: process.env.MODE || "public",
            OWNER_NAME: process.env.OWNER_NAME || "INCONNU USER",
            OWNER_NUMBER: process.env.OWNER_NUMBER || "",
            AUTO_READ: process.env.AUTO_READ === "true",
            AUTO_REACT: process.env.AUTO_REACT === "true",
            AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN !== "false",
            ANTILINK: process.env.ANTILINK === "true",
            BOT_NAME: process.env.BOT_NAME || "INCONNU XD V2",
            AUTO_BLOCK: process.env.AUTO_BLOCK !== "false",
            REJECT_CALL: process.env.REJECT_CALL === "true"
          };
          
          module.exports = config;
          EOF
          
          # Installation des dépendances
          echo "📦 Installation des dépendances..."
          npm install
          
          # Démarrage du bot
          echo "🚀 Démarrage du bot INCONNU..."
          npm start
        `
      ],
      HostConfig: {
        AutoRemove: true,
        NetworkMode: 'bridge',
        PortBindings: {
          '3000/tcp': [{ HostPort: '0' }] // Port dynamique
        },
        Memory: 256 * 1024 * 1024, // 256MB
        MemorySwap: 512 * 1024 * 1024, // 512MB
        CpuShares: 512
      },
      ExposedPorts: {
        '3000/tcp': {}
      }
    });

    // Démarrer le container
    await container.start();
    
    // Inspecter le container pour obtenir le port
    const containerInfo = await container.inspect();
    const port = containerInfo.NetworkSettings.Ports['3000/tcp'][0].HostPort;

    console.log(`✅ Serveur ${serverId} déployé sur le port ${port}`);
    
    // Mettre à jour le serveur dans la base de données
    server.containerId = container.id;
    server.port = parseInt(port);
    server.status = 'running';
    server.addLog(`Bot déployé avec succès sur le port ${port}`, 'success');
    await server.save();

    return {
      containerId: container.id,
      port: parseInt(port),
      status: 'running'
    };

  } catch (error) {
    console.error(`❌ Erreur déploiement serveur ${serverId}:`, error);
    
    // Mettre à jour le statut d'erreur
    const server = await Server.findById(serverId);
    if (server) {
      server.status = 'error';
      server.addLog(`Erreur déploiement: ${error.message}`, 'error');
      await server.save();
    }
    
    throw error;
  }
}

export async function stopBotContainer(containerId) {
  try {
    const container = docker.getContainer(containerId);
    await container.stop();
    await container.remove();
    console.log(`✅ Container ${containerId} arrêté et supprimé`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur arrêt container ${containerId}:`, error);
    return false;
  }
}

export async function getContainerStatus(containerId) {
  try {
    const container = docker.getContainer(containerId);
    const info = await container.inspect();
    return info.State.Status;
  } catch (error) {
    return 'not_found';
  }
        }
