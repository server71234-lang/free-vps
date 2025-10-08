import User from '../models/User.js';

export class CoinManager {
  static async addCoins(userId, amount, reason = '') {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }
      
      user.coins += amount;
      await user.save();
      
      console.log(`💰 ${amount} coins ajoutés à ${user.username} - Raison: ${reason}`);
      return true;
    } catch (error) {
      console.error('Erreur ajout coins:', error);
      return false;
    }
  }
  
  static async deductCoins(userId, amount, reason = '') {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }
      
      if (user.coins < amount) {
        throw new Error('Coins insuffisants');
      }
      
      user.coins -= amount;
      await user.save();
      
      console.log(`💰 ${amount} coins déduits de ${user.username} - Raison: ${reason}`);
      return true;
    } catch (error) {
      console.error('Erreur déduction coins:', error);
      return false;
    }
  }
  
  static async getBalance(userId) {
    try {
      const user = await User.findById(userId).select('coins');
      return user ? user.coins : 0;
    } catch (error) {
      console.error('Erreur récupération solde:', error);
      return 0;
    }
  }
  
  static async canAfford(userId, amount) {
    const balance = await this.getBalance(userId);
    return balance >= amount;
  }
}
