import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { ENV } from '../config/env';

let API_URL = ENV.onlineApiUrl || 'http://10.2.9.113:3000/api';
let STORAGE_MODE = 'offline';
let currentUser = null;
const authListeners = new Set();

const getResponseJson = async (response) => {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch (error) { return {}; }
};

const triggerAuthListeners = (user) => {
  currentUser = user;
  authListeners.forEach(listener => listener(user));
};

const saveSession = async (user, token) => {
  if (token) {
    await AsyncStorage.setItem('USER_TOKEN', token);
  } else {
    await AsyncStorage.removeItem('USER_TOKEN');
  }
  
  if (user) {
    await AsyncStorage.setItem('CURRENT_USER', JSON.stringify(user));
  } else {
    await AsyncStorage.removeItem('CURRENT_USER');
  }
  triggerAuthListeners(user);
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
    
    await saveSession(data.user, data.token || data.session?.access_token);
    return { user: data.user };
  },

  signInWithGoogle: async () => {
    const authUrl = `${ENV.onlineApiUrl.replace('/api', '')}/auth/v1/authorize?provider=google`;
    await InAppBrowser.openAuth(authUrl, 'afrovibe://');
  },

  signInWithGitHub: async () => {
    const authUrl = `${ENV.onlineApiUrl.replace('/api', '')}/auth/v1/authorize?provider=github`;
    await InAppBrowser.openAuth(authUrl, 'afrovibe://');
  },

  createUserWithEmailAndPassword: async (email, password, username = 'new_user') => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username })
    });
    const data = await getResponseJson(res);
    if (!res.ok) throw new Error(data.error || "Erreur lors de l'inscription");
    
    await saveSession(data.user, data.token);
    return { user: data.user };
  },

  signOut: async () => {
    await saveSession(null, null);
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
    const token = await AsyncStorage.getItem('USER_TOKEN');
    const res = await fetch(`${API_URL}/videos/${videoId}/like`, { 
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
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
