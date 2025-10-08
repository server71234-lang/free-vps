import express from 'express';
import User from '../models/User.js';
import Referral from '../models/Referral.js';
import { ensureAuth } from '../middleware/auth.js';

const router = express.Router();

// Récupérer les informations de parrainage
router.get('/info', ensureAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('referralCode');
    
    const referralStats = await Referral.aggregate([
      { $match: { referrer: req.user._id } },
      {
        $group: {
          _id: null,
          totalReferrals: { $sum: 1 },
          totalCoins: { $sum: '$coinsEarned' },
          pendingReferrals: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      }
    ]);

    const stats = referralStats[0] || {
      totalReferrals: 0,
      totalCoins: 0,
      pendingReferrals: 0
    };

    const referralLink = `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`;

    res.json({
      referralCode: user.referralCode,
      referralLink,
      stats
    });
  } catch (error) {
    console.error('Erreur récupération info referral:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des informations' });
  }
});

// Générer un nouveau code de parrainage
router.post('/generate-code', ensureAuth, async (req, res) => {
  try {
    const { v4: uuidv4 } = await import('uuid');
    
    const newCode = uuidv4().slice(0, 8).toUpperCase();
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { referralCode: newCode },
      { new: true }
    ).select('referralCode');

    res.json({
      success: true,
      referralCode: user.referralCode,
      referralLink: `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`,
      message: 'Nouveau code de parrainage généré'
    });
  } catch (error) {
    console.error('Erreur génération code:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du code' });
  }
});

// Vérifier un code de parrainage
router.get('/check/:code', async (req, res) => {
  try {
    const user = await User.findOne({ 
      referralCode: req.params.code.toUpperCase() 
    }).select('username');

    if (!user) {
      return res.status(404).json({ 
        valid: false, 
        error: 'Code de parrainage invalide' 
      });
    }

    res.json({ 
      valid: true, 
      referrer: user.username 
    });
  } catch (error) {
    console.error('Erreur vérification code:', error);
    res.status(500).json({ 
      valid: false, 
      error: 'Erreur lors de la vérification du code' 
    });
  }
});

// Statistiques détaillées des referrals
router.get('/stats/detailed', ensureAuth, async (req, res) => {
  try {
    const referrals = await Referral.find({ referrer: req.user._id })
      .populate('referredUser', 'username email createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Statistiques par période
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weeklyReferrals = referrals.filter(ref => 
      new Date(ref.createdAt) >= lastWeek
    ).length;

    const monthlyReferrals = referrals.filter(ref => 
      new Date(ref.createdAt) >= lastMonth
    ).length;

    res.json({
      totalReferrals: referrals.length,
      weeklyReferrals,
      monthlyReferrals,
      totalCoins: referrals.reduce((sum, ref) => sum + ref.coinsEarned, 0),
      recentReferrals: referrals.slice(0, 10) // 10 derniers referrals
    });
  } catch (error) {
    console.error('Erreur récupération stats détaillées:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

export default router;
