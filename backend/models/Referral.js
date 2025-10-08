import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referredUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coinsEarned: {
    type: Number,
    default: 10
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour les requêtes fréquentes
referralSchema.index({ referrer: 1, createdAt: -1 });
referralSchema.index({ referredUser: 1 });

// Validation pour éviter les doublons
referralSchema.index({ referrer: 1, referredUser: 1 }, { unique: true });

export default mongoose.model('Referral', referralSchema);
