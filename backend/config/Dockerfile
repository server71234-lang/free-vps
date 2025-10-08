FROM node:18-alpine

WORKDIR /app

# Installation des dépendances système nécessaires
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    wget \
    unzip \
    curl

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm install --production

# Copier le code source
COPY . .

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Changer les permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exposer le port
EXPOSE 5000

# Commande de démarrage
CMD ["npm", "start"]
