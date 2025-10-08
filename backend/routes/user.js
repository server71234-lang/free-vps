import express from 'express';
import User from '../models/User.js';
import Referral from '../models/Referral.js';
import { ensureAuth } from '../middleware/auth.js';

const router = express.Router();

// Récupérer les données utilisateur complètes
router.get('/profile', ensureAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-__v')
      .populate('servers', 'name status expiresAt createdAt')
      .lean();

    // Compter les referrals
    const referralsCount = await Referral.countDocuments({ 
      referrer: req.user._id 
    });

    // Calculer les coins gagnés via referrals
    const referralCoins = await Referral.aggregate([
      { $match: { referrer: req.user._id } },
      { $group: { _id: null, total: { $sum: '$coinsEarned' } } }
    ]);

    const totalReferralCoins = referralCoins[0]?.total || 0;

    res.json({
      ...user,
      stats: {
        totalServers: user.servers.length,
        activeServers: user.servers.filter(s => s.status === 'running').length,
        referralsCount,
        totalReferralCoins
      }
    });
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
});

// Mettre à jour le profil
router.put('/profile', ensureAuth, async (req, res) => {
  try {
    const { username, email } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { username, email },
      { new: true, runValidators: true }
    ).select('-__v');

    res.json({
      success: true,
      user: updatedUser,
      message: 'Profil mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Ce nom d\'utilisateur ou email est déjà utilisé' 
      });
    }
    
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
});

// Récupérer l'historique des referrals
router.get('/referrals/history', ensureAuth, async (req, res) => {
  try {
    const referrals = await Referral.find({ referrer: req.user._id })
      .populate('referredUser', 'username createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.json(referrals);
  } catch (error) {
    console.error('Erreur récupération historique referrals:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
  }
});

// Vérifier le solde de coins
router.get('/coins/balance', ensureAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('coins');
    res.json({ coins: user.coins });
  } catch (error) {
    console.error('Erreur récupération solde:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du solde' });
  }
});

export default router;
