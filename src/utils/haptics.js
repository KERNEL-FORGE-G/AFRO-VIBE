import { Vibration, Platform } from 'react-native';

/**
 * Utilitaire pour le feedback haptique.
 * Utilise la Vibration API native de React Native comme fallback.
 * Pour une meilleure expérience, installez 'react-native-haptic-feedback'.
 */

export const Haptics = {
  // Un petit tap léger (ex: like, changement de tab)
  light: () => {
    if (Platform.OS === 'ios') {
      // Sur iOS, Vibration.vibrate est un peu fort pour du haptique léger
      // sans librairie tierce, on se contente du défaut
      Vibration.vibrate(10);
    } else {
      Vibration.vibrate(15);
    }
  },

  // Un tap moyen (ex: envoi de message)
  medium: () => {
    Vibration.vibrate(20);
  },

  // Un tap plus marqué (ex: erreur, succès important)
  heavy: () => {
    Vibration.vibrate(50);
  },

  // Pattern pour les erreurs
  error: () => {
    Vibration.vibrate([0, 50, 50, 50]);
  },

  // Pattern pour le succès
  success: () => {
    Vibration.vibrate([0, 20, 10, 20]);
  }
};

export default Haptics;
