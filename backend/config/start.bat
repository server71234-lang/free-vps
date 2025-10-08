@echo off
echo 🚀 Démarrage de INCONNU VPS Backend...

:: Vérifier Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installé
    pause
    exit /b 1
)

:: Installer les dépendances si nécessaire
if not exist "node_modules" (
    echo 📦 Installation des dépendances...
    npm install
)

echo 🔥 Démarrage de l'application...
npm start
pause
