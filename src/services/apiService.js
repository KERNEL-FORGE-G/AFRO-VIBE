import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import firebaseService from './firebaseService';
import supabase from './supabaseClient';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { ENV } from '../config/env';

let API_URL = 'http://10.2.9.113:3000/api'; // Default for Android 
let STORAGE_MODE = 'offline'; // Par défaut en local
let currentUser = null;
const authListeners = new Set();
let currentToken = null;

// Configure Google Signin
GoogleSignin.configure({
  webClientId: ENV.googleConfig.webClientId, 
});

const normalizeApiUrl = (url) => {
  if (!url || typeof url !== 'string') return API_URL;
  const trimmedUrl = url.trim();
  if (!trimmedUrl.startsWith('http')) return API_URL;
  const cleanedUrl = trimmedUrl.replace(/\/+$/, '');
  return cleanedUrl.endsWith('/api') ? cleanedUrl : `${cleanedUrl}/api`;
};

const getResponseJson = async (response) => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (error) {
    return {};
  }
};

const fetchWithTimeout = (url, options, timeout = 15000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
  ]);
};

const triggerAuthListeners = (user) => {
  currentUser = user;
  authListeners.forEach(listener => listener(user));
};

export const configService = {
  getApiUrl: () => API_URL,
  getBaseUrl: () => API_URL.replace(/\/api$/, ''),
  getStorageMode: () => STORAGE_MODE,
  setStorageMode: async (mode) => {
    STORAGE_MODE = mode;
    await AsyncStorage.setItem('STORAGE_MODE', mode);
  },
  fixMediaUrl: (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('https') || url.startsWith('data:')) return url;
    const baseUrl = API_URL.replace(/\/api$/, '');
    return `${baseUrl}/uploads/${url}`;
  },
  setApiUrl: async (url) => {
    const cleanedUrl = normalizeApiUrl(url);
    API_URL = cleanedUrl;
    await AsyncStorage.setItem('API_URL', cleanedUrl);
  },
  loadConfig: async () => {
    try {
      const savedMode = await AsyncStorage.getItem('STORAGE_MODE');
      if (savedMode) STORAGE_MODE = savedMode;

      const savedUrl = await AsyncStorage.getItem('API_URL');
      if (STORAGE_MODE === 'online') {
        API_URL = 'https://afro-vibe-backend.vercel.app/api';
      } else if (savedUrl) {
        API_URL = normalizeApiUrl(savedUrl);
      }

      const savedToken = await AsyncStorage.getItem('USER_TOKEN');
      const savedUserRaw = await AsyncStorage.getItem('CURRENT_USER');
      if (savedToken && savedUserRaw) {
        currentToken = savedToken;
        currentUser = JSON.parse(savedUserRaw);
        triggerAuthListeners(currentUser);
      }
    } catch (e) {}
  },
  testConnection: async (url) => {
    try {
      const testUrl = normalizeApiUrl(url || API_URL);
      const response = await fetchWithTimeout(`${testUrl}/health`, {}, 8000);
      const data = await getResponseJson(response);
      return data.status === 'ok';
    } catch (err) {
      return false;
    }
  }
};

export const authService = {
  signInWithEmailAndPassword: async (email, password) => {
    if (STORAGE_MODE === 'online') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const user = {
        uid: data.user.id,
        email: data.user.email,
        username: data.user.user_metadata.username || data.user.email.split('@')[0],
        avatar: data.user.user_metadata.avatar_url || 'logo.jpg'
      };
      currentToken = data.session.access_token;
      await AsyncStorage.setItem('USER_TOKEN', currentToken);
      await AsyncStorage.setItem('CURRENT_USER', JSON.stringify(user));
      triggerAuthListeners(user);
      return { user };
    }
    const res = await fetchWithTimeout(`${API_URL}/auth/login`, {
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
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      if (STORAGE_MODE === 'online') {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.idToken,
        });
        if (error) throw error;
        const user = {
          uid: data.user.id,
          email: data.user.email,
          username: data.user.user_metadata.full_name,
          avatar: data.user.user_metadata.avatar_url
        };
        triggerAuthListeners(user);
        return { user };
      }
      throw new Error('Google Sign-In non disponible en mode local');
    } catch (error) { throw error; }
  },

  signInWithGitHub: async () => {
    if (STORAGE_MODE === 'online') {
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'github' });
      if (error) throw error;
      return data;
    }
    throw new Error('GitHub Sign-In non disponible en mode local');
  },

  createUserWithEmailAndPassword: async (email, password, username = 'new_user') => {
    if (STORAGE_MODE === 'online') {
      const { data, error } = await supabase.auth.signUp({
        email, password, options: { data: { username, avatar_url: 'logo.jpg' } }
      });
      if (error) throw error;
      const user = { uid: data.user.id, email: data.user.email, username, avatar: 'logo.jpg' };
      triggerAuthListeners(user);
      return { user };
    }
    const res = await fetchWithTimeout(`${API_URL}/auth/register`, {
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

  signOut: async () => {
    if (STORAGE_MODE === 'online') await supabase.auth.signOut();
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
  getVideos: async (userId = null) => {
    if (STORAGE_MODE === 'online') {
      const { data, error } = await supabase.from('videos').select('*, users(*)').order('created_at', { ascending: false });
      if (!error) return data;
    }
    try {
      const url = userId ? `${API_URL}/videos?userId=${userId}` : `${API_URL}/videos`;
      const res = await fetch(url);
      if (res.ok) return await getResponseJson(res);
      return [];
    } catch (e) { return []; }
  },
  likeVideo: async (videoId) => {
    if (STORAGE_MODE === 'online') {
      const { error } = await supabase.from('likes').insert({ video_id: videoId, user_id: currentUser.uid });
      if (error) throw error;
      return { success: true };
    }
    const res = await fetch(`${API_URL}/videos/${videoId}/like`, {
      method: 'POST',
      headers: { 'x-user-id': currentUser?.uid || 'user_local' }
    });
    return await getResponseJson(res);
  },
  getComments: async (videoId) => {
    if (STORAGE_MODE === 'online') {
      const { data, error } = await supabase.from('comments').select('*, users(*)').eq('video_id', videoId);
      if (!error) return data;
    }
    const res = await fetch(`${API_URL}/videos/${videoId}/comments`);
    return await getResponseJson(res);
  },
  addComment: async (videoId, text) => {
    if (STORAGE_MODE === 'online') {
      const { data, error } = await supabase.from('comments').insert({ video_id: videoId, user_id: currentUser.uid, text }).select().single();
      if (error) throw error;
      return data;
    }
    const res = await fetch(`${API_URL}/videos/${videoId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser?.uid },
      body: JSON.stringify({ text })
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
    if (STORAGE_MODE === 'online') formData.append('useCloudinary', 'true');

    const res = await fetch(`${API_URL}/videos`, {
      method: 'POST',
      body: formData,
      headers: { 'x-user-id': currentUser?.uid }
    });
    return await getResponseJson(res);
  }
};

export default {
  auth: authService,
  db: dbService,
  config: configService
};
