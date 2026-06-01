// Environment Configuration for Afro Vibe

export const ENV = {
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
  },
  supabaseConfig: {
    url: 'https://reapauoxqaqdtxtrxczx.supabase.co',
    anonKey: 'sb_publishable_FqzxsSvp3lD1HtWi7X2zbA_AXzno_9H',
  },
  googleConfig: {
    webClientId: '60620850112-48amj0p32oojgi73hmduhs5m41jr641a.apps.googleusercontent.com',
  },
  githubConfig: {
    clientId: 'YOUR_GITHUB_CLIENT_ID',
  },
  onlineApiUrl: 'https://afro-vibe-backend.vercel.app/api',
  useMockFirebase: false, // Set to false to use real Firebase
  storageMode: 'cloudinary', // Default to Cloudinary
};

export const SUPABASE_URL = ENV.supabaseConfig.url;
export const SUPABASE_ANON_KEY = ENV.supabaseConfig.anonKey;

export default ENV;
