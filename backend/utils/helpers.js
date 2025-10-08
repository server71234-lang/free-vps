import { fileURLToPath } from 'url';
import { dirname } from 'path';

export function getDirname(importMetaUrl) {
  const __filename = fileURLToPath(importMetaUrl);
  return dirname(__filename);
}

export function generateRandomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function formatTimeRemaining(expiresAt) {
  const now = new Date();
  const timeLeft = expiresAt - now;
  
  if (timeLeft <= 0) {
    return 'Expiré';
  }
  
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return `${days}j ${hours}h`;
  } else {
    return `${hours}h`;
  }
}

export function validateEnvVars(envVars) {
  const required = ['SESSION_ID'];
  const errors = [];
  
  for (const field of required) {
    if (!envVars[field]) {
      errors.push(`${field} est requis`);
    }
  }
  
  // Validation du SESSION_ID
  if (envVars.SESSION_ID && !envVars.SESSION_ID.includes('INCONNU~XD~')) {
    errors.push('SESSION_ID doit contenir le format INCONNU~XD~');
  }
  
  return errors;
}
