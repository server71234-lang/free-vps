export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erreur de validation',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'ID invalide' });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: 'Doublon détecté' });
  }

  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
