// Configuration Afro Vibe — clés PUBLIQUES embarquées dans l'app (mode online)

export const ENV = {
  storageMode: 'online',

  firebase: {
    apiKey: 'AIzaSyBdNvCHgWmawH2itlLWD59dqzd6Of3mj2c',
    authDomain: 'afro-vibe-ab786.firebaseapp.com',
    projectId: 'afro-vibe-ab786',
    storageBucket: 'afro-vibe-ab786.firebasestorage.app',
    messagingSenderId: '164585162829',
    appId: '1:164585162829:android:b2893a252026e3848f3404',
  },

  cloudinary: {
    cloudName: 'dl78pj7uf',
    uploadPreset: 'afrovibe_unsigned', // Créer dans Cloudinary → Upload → preset UNSIGNED
    videoFolder: 'afrovibe/videos',
    imageFolder: 'afrovibe/avatars',
  },

  supabase: {
    url: '',
    anonKey: '',
  },

  google: {
    webClientId: '35830371631-9ntn2m59pnbditcr6mebotl27i86ovik.apps.googleusercontent.com',
  },

  localApiUrl: 'http://10.0.2.2:3000/api',
};

export const isFirebaseConfigured = () =>
  !!(ENV.firebase.apiKey && ENV.firebase.projectId && ENV.firebase.appId);

export const isCloudinaryConfigured = () =>
  !!(ENV.cloudinary.cloudName && ENV.cloudinary.uploadPreset);

export const SUPABASE_URL = ENV.supabase.url;
export const SUPABASE_ANON_KEY = ENV.supabase.anonKey;

export default ENV;
