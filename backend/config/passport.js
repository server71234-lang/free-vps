import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';
import Referral from '../models/Referral.js';

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL,
  scope: ['user:email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ githubId: profile.id });
    
    if (!user) {
      // Vérifier si c'est une inscription par referral
      let invitedBy = null;
      const referralSession = profile._json.referralCode || profile.referralCode;
      
      if (referralSession) {
        const referrer = await User.findOne({ referralCode: referralSession });
        if (referrer) {
          invitedBy = referrer._id;
          
          // Ajouter 10 coins au parrain
          referrer.coins += 10;
          await referrer.save();
          
          // Enregistrer le referral
          await Referral.create({
            referrer: referrer._id,
            referredUser: null, // Sera mis à jour après création de l'utilisateur
            coinsEarned: 10
          });
        }
      }

      // Créer le nouvel utilisateur
      user = new User({
        githubId: profile.id,
        username: profile.username,
        email: profile.emails?.[0]?.value || `${profile.username}@github.com`,
        coins: 10,
        invitedBy: invitedBy
      });

      await user.save();

      // Mettre à jour le referral avec le nouvel utilisateur
      if (invitedBy) {
        await Referral.findOneAndUpdate(
          { referrer: invitedBy, referredUser: null },
          { referredUser: user._id }
        );
      }
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
