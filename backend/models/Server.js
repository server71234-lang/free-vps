import mongoose from 'mongoose';

const serverSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    default: 'INCONNU Bot Server'
  },
  status: {
    type: String,
    enum: ['creating', 'running', 'stopped', 'expired', 'error'],
    default: 'creating'
  },
  containerId: {
    type: String,
    sparse: true
  },
  port: {
    type: Number
  },
  envVars: {
    SESSION_ID: {
      type: String,
      required: true
    },
    PREFIX: {
      type: String,
      default: '.'
    },
    MODE: {
      type: String,
      default: 'public',
      enum: ['public', 'private']
    },
    OWNER_NAME: String,
    OWNER_NUMBER: String,
    AUTO_READ: {
      type: Boolean,
      default: false
    },
    AUTO_REACT: {
      type: Boolean,
      default: false
    },
    AUTO_STATUS_SEEN: {
      type: Boolean,
      default: true
    },
    ANTILINK: {
      type: Boolean,
      default: false
    },
    BOT_NAME: {
      type: String,
      default: 'INCONNU XD V2'
    }
  },
  logs: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    message: String,
    type: {
      type: String,
      enum: ['info', 'error', 'success', 'warning'],
      default: 'info'
    }
  }],
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour la suppression automatique des documents expirés
serverSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index pour les requêtes fréquentes
serverSchema.index({ userId: 1, status: 1 });
serverSchema.index({ status: 1, expiresAt: 1 });

// Méthode pour ajouter un log
serverSchema.methods.addLog = function(message, type = 'info') {
  this.logs.push({
    message,
    type
  });
  
  // Garder seulement les 100 derniers logs
  if (this.logs.length > 100) {
    this.logs = this.logs.slice(-100);
  }
};

// Méthode pour vérifier si le serveur est expiré
serverSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Middleware pour mettre à jour le statut si expiré
serverSchema.pre('save', function(next) {
  if (this.isExpired() && this.status !== 'expired') {
    this.status = 'expired';
    this.addLog('Serveur expiré automatiquement', 'warning');
  }
  next();
});

export default mongoose.model('Server', serverSchema);
