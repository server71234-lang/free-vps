#!/bin/bash

echo "🚀 Démarrage de INCONNU VPS Backend..."

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

# Vérifier que MongoDB est accessible
if [ ! -z "$MONGODB_URI" ]; then
    echo "📊 Utilisation de MongoDB Atlas"
else
    echo "⚠️  MONGODB_URI non défini"
fi

# Installer les dépendances si node_modules n'existe pas
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Démarrer l'application
echo "🔥 Démarrage de l'application..."
npm start
