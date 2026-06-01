import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { ENV } from '../config/env';

let API_URL = ENV.onlineApiUrl || 'http://10.2.9.113:3000/api'; 
let STORAGE_MODE = 'offline'; 
let currentUser = null;
const authListeners = new Set();
let currentToken = null;

const getResponseJson = async (response) => {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch (error) { return {}; }
};

const fetchWithToken = async (url, options = {}) => {
  const token = await AsyncStorage.getItem('USER_TOKEN');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };
  return fetch(url, { ...options, headers });
};

const triggerAuthListeners = (user) => {
  currentUser = user;
  authListeners.forEach(listener => listener(user));
};

const fetchWithTimeout = (url, options, timeout = 15000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
  ]);
};

export const configService = {
  getApiUrl: () => API_URL,
  getStorageMode: () => STORAGE_MODE,
  setStorageMode: async (mode) => {
    STORAGE_MODE = mode;
    API_URL = mode === 'online' ? ENV.onlineApiUrl : (await AsyncStorage.getItem('API_URL') || 'http://10.2.9.113:3000/api');
    await AsyncStorage.setItem('STORAGE_MODE', mode);
  },
  loadConfig: async () => {
    try {
      const savedMode = await AsyncStorage.getItem('STORAGE_MODE') || 'offline';
      STORAGE_MODE = savedMode;
      API_URL = savedMode === 'online' ? ENV.onlineApiUrl : (await AsyncStorage.getItem('API_URL') || 'http://10.2.9.113:3000/api');
      
      const savedUserRaw = await AsyncStorage.getItem('CURRENT_USER');
      if (savedUserRaw) {
        currentUser = JSON.parse(savedUserRaw);
        triggerAuthListeners(currentUser);
      }
    } catch (e) {}
  },
  testConnection: async (url) => {
    try {
      const response = await fetchWithTimeout(`${url}/health`, {}, 8000);
      const data = await getResponseJson(response);
      return data.status === 'ok';
    } catch (err) {
      return false;
    }
  }
};

export const authService = {
  signInWithEmailAndPassword: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await getResponseJson(res);
    if (!res.ok) throw new Error(data.error || 'Erreur de connexion');
    currentToken = data.token;
    await AsyncStorage.setItem('USER_TOKEN', currentToken);
    await AsyncStorage.setItem('CURRENT_USER', JSON.stringify(data.user));
    triggerAuthListeners(data.user);
    return { user: data.user };
  },

  signInWithGoogle: async () => {
    // Note: This needs to be implemented to trigger the OAuth flow
    throw new Error('signInWithGoogle non implémenté');
  },

  signInWithGitHub: async () => {
    // Note: This needs to be implemented to trigger the OAuth flow
    throw new Error('signInWithGitHub non implémenté');
  },

  createUserWithEmailAndPassword: async (email, password, username = 'new_user') => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username })
    });
    const data = await getResponseJson(res);
    if (!res.ok) throw new Error(data.error || "Erreur lors de l'inscription");
    currentToken = data.token;
    await AsyncStorage.setItem('USER_TOKEN', currentToken);
    await AsyncStorage.setItem('CURRENT_USER', JSON.stringify(data.user));
    triggerAuthListeners(data.user);
    return { user: data.user };
  },

  // Note: Social auth should be handled via browser/webview calling Supabase directly
  // then sending the token to the backend for verification if needed.
  // For simplicity, we keep the direct Supabase call for now if still needed,
  // but it's better to move it to backend.
  signOut: async () => {
    currentToken = null;
    currentUser = null;
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
};

export const dbService = {
  getVideos: async () => {
    const res = await fetch(`${API_URL}/videos`);
    return await getResponseJson(res);
  },
  likeVideo: async (videoId) => {
    const res = await fetchWithToken(`${API_URL}/videos/${videoId}/like`, { method: 'POST' });
    return await getResponseJson(res);
  },
  uploadVideo: async (videoUri, caption, category) => {
    const formData = new FormData();
    formData.append('video', {
      uri: Platform.OS === 'android' ? videoUri : videoUri.replace('file://', ''),
      type: 'video/mp4',
      name: `video_${Date.now()}.mp4`,
    });
    formData.append('caption', caption);
    formData.append('category', category);

    const token = await AsyncStorage.getItem('USER_TOKEN');
    const res = await fetch(`${API_URL}/videos`, {
      method: 'POST',
      body: formData,
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await getResponseJson(res);
  }
};

export default { auth: authService, db: dbService, config: configService };
