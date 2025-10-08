import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const userSchema = new mongoose.Schema({
  githubId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  coins: {
    type: Number,
    default: 10,
    min: 0
  },
  referralCode: {
    type: String,
    unique: true,
    default: () => uuidv4().slice(0, 8).toUpperCase()
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  servers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Server'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// Mettre à jour lastLogin à chaque connexion
userSchema.pre('save', function(next) {
  if (this.isModified('lastLogin')) {
    this.lastLogin = new Date();
  }
  next();
});

// Méthode pour vérifier si l'utilisateur peut créer un serveur
userSchema.methods.canCreateServer = function() {
  return this.coins >= 10;
};

// Méthode pour déduire les coins
userSchema.methods.deductCoins = function(amount) {
  if (this.coins >= amount) {
    this.coins -= amount;
    return true;
  }
  return false;
};

// Méthode pour ajouter des coins
userSchema.methods.addCoins = function(amount) {
  this.coins += amount;
};

export default mongoose.model('User', userSchema);
