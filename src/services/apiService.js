import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { ENV } from '../config/env';
import firebaseService from './firebaseService';

let API_URL = 'http://10.0.2.2:3000/api'; // Default for Android Emulator
let STORAGE_MODE = 'online'; // Force 'online' mode
let currentUser = null;
const authListeners = new Set();
let currentToken = null;

export const configService = {
  getApiUrl: () => API_URL,
  getStorageMode: () => STORAGE_MODE,
  setStorageMode: async (mode) => {
    STORAGE_MODE = mode;
    await AsyncStorage.setItem('STORAGE_MODE', mode);
  },
  setApiUrl: async (url) => {
    // Basic validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error('L\'URL doit commencer par http:// ou https://');
    }
    
    // Remove trailing slash if present
    const cleanedUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    API_URL = cleanedUrl;
    await AsyncStorage.setItem('API_URL', cleanedUrl);
  },
  loadConfig: async () => {
    try {
      const savedUrl = await AsyncStorage.getItem('API_URL');
      if (savedUrl) {
        API_URL = savedUrl;
      }

      // Enforce online mode
      STORAGE_MODE = 'online';
      
      // Restore user session
      const savedToken = await AsyncStorage.getItem('USER_TOKEN');
      const savedUserRaw = await AsyncStorage.getItem('CURRENT_USER');
      if (savedToken && savedUserRaw) {
        currentToken = savedToken;
        currentUser = JSON.parse(savedUserRaw);
        triggerAuthListeners(currentUser);
      }
    } catch (e) {
      console.log('Error loading API config', e);
    }
  },
  testConnection: async (url) => {
    try {
      const testUrl = url || API_URL;
      const baseUrl = testUrl.replace(/\/api$/, '');
      const response = await fetch(`${baseUrl}/api/health`);
      const data = await response.json();
      return data.status === 'ok';
    } catch (err) {
      console.error(err);
      return false;
    }
  }
};

const triggerAuthListeners = (user) => {
  currentUser = user;
  authListeners.forEach(listener => listener(user));
};

// Helper to add timeout to fetch
const fetchWithTimeout = (url, options, timeout = 5000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
  ]);
};

export const authService = {
  signInWithEmailAndPassword: async (email, password) => {
    const res = await fetchWithTimeout(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur de connexion');
    
    currentToken = data.token;
    await AsyncStorage.setItem('USER_TOKEN', currentToken);
    await AsyncStorage.setItem('CURRENT_USER', JSON.stringify(data.user));
    
    // Save to local list of accounts (mark synced)
    await authService.saveAccountLocally({ email, password, username: data.user.username, uid: data.user.uid, isSynced: true });
    
    triggerAuthListeners(data.user);
    return { user: data.user };
  },

  createUserWithEmailAndPassword: async (email, password, username = 'new_user') => {
    try {
      const res = await fetchWithTimeout(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'inscription");
      
      currentToken = data.token;
      await AsyncStorage.setItem('USER_TOKEN', currentToken);
      await AsyncStorage.setItem('CURRENT_USER', JSON.stringify(data.user));
      
      // Save locally as synced
      await authService.saveAccountLocally({ email, password, username, uid: data.user.uid, isSynced: true });
      
      triggerAuthListeners(data.user);
      return { user: data.user };
    } catch (err) {
      // Improved error handling
      console.log('Registration error:', err);
      const isNetworkError = err.message === 'timeout' || !err.status;
      
      if (isNetworkError) {
        console.log('Network registration failed. Falling back to offline creation.');
        const userId = 'user_local_' + Math.random().toString(36).substring(2, 9);
        const userObj = { uid: userId, email, username, fullName: username, avatar: 'logo.jpg', isVerified: false, isOffline: true };
        
        // Save locally as unsynced
        await authService.saveAccountLocally({ email, password, username, uid: userId, isSynced: false });
        
        currentToken = 'token_local_' + userId;
        await AsyncStorage.setItem('USER_TOKEN', currentToken);
        await AsyncStorage.setItem('CURRENT_USER', JSON.stringify(userObj));
        
        triggerAuthListeners(userObj);
        return { user: userObj, offline: true };
      } else {
        throw err;
      }
    }
  },

  signOut: async () => {
    currentToken = null;
    await AsyncStorage.removeItem('USER_TOKEN');
    await AsyncStorage.removeItem('CURRENT_USER');
    triggerAuthListeners(null);
    return true;
  },

  onAuthStateChanged: (callback) => {
    authListeners.add(callback);
    callback(currentUser);
    return () => authListeners.delete(callback);
  },

  getCurrentUser: () => currentUser,

  saveAccountLocally: async (accountData) => {
    try {
      const raw = await AsyncStorage.getItem('AFROVIBE_LOCAL_ACCOUNTS');
      const accounts = raw ? JSON.parse(raw) : [];
      const filtered = accounts.filter(acc => acc.email !== accountData.email);
      
      filtered.push({
        email: accountData.email,
        password: accountData.password,
        username: accountData.username,
        uid: accountData.uid,
        isSynced: accountData.isSynced,
        createdAt: new Date().toISOString()
      });
      
      await AsyncStorage.setItem('AFROVIBE_LOCAL_ACCOUNTS', JSON.stringify(filtered));
    } catch (e) {
      console.log('Error saving account locally:', e);
    }
  },

  syncOfflineAccounts: async () => {
    try {
      const raw = await AsyncStorage.getItem('AFROVIBE_LOCAL_ACCOUNTS');
      if (!raw) return;
      
      const accounts = JSON.parse(raw);
      const unsynced = accounts.filter(acc => !acc.isSynced);
      if (unsynced.length === 0) return;
      
      console.log(`Found ${unsynced.length} unsynced accounts. Attempting sync...`);
      
      const online = await configService.testConnection();
      if (!online) {
        console.log('Sync skipped: Backend is unreachable.');
        return;
      }
      
      for (const account of unsynced) {
        try {
          const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: account.email, 
              password: account.password, 
              username: account.username 
            })
          });
          const data = await res.json();
          if (res.ok) {
            account.isSynced = true;
            account.uid = data.user.uid;
            console.log(`Synced account for ${account.username} successfully.`);
          } else if (res.status === 400 && data.error && (data.error.includes('exists') || data.error.includes('déjà'))) {
            account.isSynced = true;
            console.log(`Account for ${account.username} already exists on server. Marked as synced.`);
          }
        } catch (e) {
          console.log(`Failed to sync account ${account.username}:`, e);
        }
      }
      
      await AsyncStorage.setItem('AFROVIBE_LOCAL_ACCOUNTS', JSON.stringify(accounts));
    } catch (e) {
      console.log('Error in syncOfflineAccounts:', e);
    }
  }
};

export const dbService = {
  getVideos: async () => {
    try {
      const fbVideos = await firebaseService.getVideos();
      if (fbVideos) return fbVideos;
    } catch (e) {
      console.log('Firebase fetch failed:', e);
      return [];
    }
    return [];
  },

  likeVideo: async (videoId) => {
    const res = await fetchWithTimeout(`${API_URL}/videos/${videoId}/like`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': currentUser ? currentUser.uid : 'user_king'
      }
    });
    if (!res.ok) throw new Error('Erreur');
    return await res.json();
  },

  getComments: async (videoId) => {
    const res = await fetchWithTimeout(`${API_URL}/videos/${videoId}/comments`);
    if (!res.ok) throw new Error('Erreur');
    return await res.json();
  },

  addComment: async (videoId, commentText) => {
    const res = await fetchWithTimeout(`${API_URL}/videos/${videoId}/comments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': currentUser ? currentUser.uid : 'user_king'
      },
      body: JSON.stringify({ text: commentText })
    });
    if (!res.ok) throw new Error('Erreur');
    return await res.json();
  },
  
  createVideoPost: async (videoData) => {
    const res = await fetchWithTimeout(`${API_URL}/videos`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': currentUser ? currentUser.uid : 'user_king'
      },
      body: JSON.stringify(videoData)
    });
    if (!res.ok) throw new Error('Erreur de publication');
    return await res.json();
  },

  uploadVideo: async (videoUri, caption = 'Nouvelle vidéo Afro Vibe !') => {
    return await firebaseService.uploadVideo(videoUri, caption);
  },

  uploadAvatar: async (imageUri) => {
    const result = await firebaseService.uploadAvatar(imageUri);
    return { avatarUrl: result.avatarUrl };
  },

  getUser: async (userId) => {
    const res = await fetch(`${API_URL}/users/${userId}`);
    if (!res.ok) throw new Error('Utilisateur introuvable');
    return await res.json();
  },
};

export default {
  auth: authService,
  db: dbService,
  config: configService
};
