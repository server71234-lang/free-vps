export const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Non authentifié' });
};

export const optionalAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  // Continuer même sans authentification pour certaines routes
  next();
};

export const ensureAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  res.status(403).json({ error: 'Accès non autorisé' });
};
