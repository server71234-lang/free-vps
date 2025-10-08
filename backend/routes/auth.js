import express from 'express';
import passport from 'passport';
import User from '../models/User.js';

const router = express.Router();

// Route de connexion GitHub
router.get('/github', (req, res, next) => {
  // Stocker le code de referral dans la session si présent
  if (req.query.ref) {
    req.session.referralCode = req.query.ref;
  }
  
  passport.authenticate('github', { 
    scope: ['user:email'] 
  })(req, res, next);
});

// Callback GitHub
router.get('/github/callback',
  passport.authenticate('github', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` 
  }),
  (req, res) => {
    // Mettre à jour lastLogin
    User.findByIdAndUpdate(req.user._id, { lastLogin: new Date() })
      .catch(console.error);
    
    // Redirection vers le dashboard
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

// Déconnexion
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
    }
    res.json({ success: true, message: 'Déconnecté avec succès' });
  });
});

// Informations utilisateur
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      _id: req.user._id,
      githubId: req.user.githubId,
      username: req.user.username,
      email: req.user.email,
      coins: req.user.coins,
      referralCode: req.user.referralCode,
      createdAt: req.user.createdAt,
      lastLogin: req.user.lastLogin
    });
  } else {
    res.status(401).json({ error: 'Non authentifié' });
  }
});

// Vérifier l'authentification
router.get('/check', (req, res) => {
  res.json({ 
    authenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? {
      _id: req.user._id,
      username: req.user.username,
      coins: req.user.coins
    } : null
  });
});

export default router;
