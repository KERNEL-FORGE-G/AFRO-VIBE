import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { ENV } from '../config/env';

// Configure Google Sign-In with the client ID from env
GoogleSignin.configure({
  webClientId: ENV.google.webClientId,
  offlineAccess: true,
});

export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    // TODO: send idToken to backend or store in Firestore
    return userInfo;
  } catch (error) {
    console.error('Google sign-in error', error);
    throw error;
  }
};

export const signUpWithEmailAndPassword = async (email, password, username) => {
  // If username not provided, derive from email prefix
  const derivedUsername = username || email.split('@')[0];
  return await getActiveService().auth.createUserWithEmailAndPassword(email, password, derivedUsername);
};

export const signOut = async () => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Google sign-out error', error);
  }
};
