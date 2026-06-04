import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { ENV } from '../config/env';

const DEFAULT_LOCAL_API_URL = 'http://10.2.9.113:3000/api';
const normalizeApiUrl = (url) => (url || '').replace(/\/+$/, '');

let API_URL = normalizeApiUrl(ENV.onlineApiUrl || DEFAULT_LOCAL_API_URL);
let STORAGE_MODE = ENV.storageMode || 'online';
let currentUser = null;
const authListeners = new Set();

const getResponseJson = async (response) => {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch (error) { return {}; }
};

const getAuthHeaders = async (contentType = 'application/json') => {
  const token = await AsyncStorage.getItem('USER_TOKEN');
  const headers = {};
  if (contentType) headers['Content-Type'] = contentType;
  if (token) headers.Authorization = `Bearer ${token}`;
  if (currentUser?.uid) headers['X-User-Id'] = currentUser.uid;
  return headers;
};

const apiFetch = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, options);
  const data = await getResponseJson(response);
  if (!response.ok) {
    throw new Error(data.error || `Erreur API (${response.status})`);
  }
  return data;
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
  setApiUrl: async (url) => {
    API_URL = normalizeApiUrl(url);
    await AsyncStorage.setItem('API_URL', API_URL);
  },
  setStorageMode: async (mode) => {
    STORAGE_MODE = mode;
    API_URL = mode === 'online' ? normalizeApiUrl(ENV.onlineApiUrl) : normalizeApiUrl(await AsyncStorage.getItem('API_URL') || DEFAULT_LOCAL_API_URL);
    await AsyncStorage.setItem('STORAGE_MODE', mode);
  },
  loadConfig: async () => {
    try {
      const savedMode = await AsyncStorage.getItem('STORAGE_MODE') || ENV.storageMode || 'online';
      STORAGE_MODE = savedMode;
      API_URL = savedMode === 'online' ? normalizeApiUrl(ENV.onlineApiUrl) : normalizeApiUrl(await AsyncStorage.getItem('API_URL') || DEFAULT_LOCAL_API_URL);
      
      const savedUserRaw = await AsyncStorage.getItem('CURRENT_USER');
      if (savedUserRaw) {
        currentUser = JSON.parse(savedUserRaw);
        triggerAuthListeners(currentUser);
      }
    } catch (e) {}
  },
  testConnection: async (url) => {
    try {
      const response = await fetch(`${normalizeApiUrl(url)}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  },
  fixMediaUrl: (url) => {
    if (!url) return null;
    if (/^(https?:|file:|content:|data:)/.test(url)) return url;

    const apiRoot = API_URL.replace(/\/api$/, '');
    if (url.startsWith('/')) return `${apiRoot}${url}`;
    return `${apiRoot}/${url}`;
  },
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
    const authUrl = `${API_URL}/auth/social/google`;
    await InAppBrowser.openAuth(authUrl, 'afrovibe://');
  },

  signInWithGitHub: async () => {
    const authUrl = `${API_URL}/auth/social/github`;
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
    return apiFetch('/videos');
  },
  likeVideo: async (videoId) => {
    return apiFetch(`/videos/${videoId}/like`, {
      method: 'POST',
      headers: await getAuthHeaders(null),
    });
  },
  shareVideo: async (videoId) => {
    return apiFetch(`/videos/${videoId}/share`, {
      method: 'POST',
      headers: await getAuthHeaders(null),
    });
  },
  getComments: async (videoId) => {
    return apiFetch(`/videos/${videoId}/comments`);
  },
  addComment: async (videoId, text) => {
    return apiFetch(`/videos/${videoId}/comments`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ text }),
    });
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
    formData.append('useCloudinary', STORAGE_MODE === 'online' ? 'true' : 'false');

    const res = await fetch(`${API_URL}/videos`, {
      method: 'POST',
      body: formData,
      headers: await getAuthHeaders(null),
    });
    const data = await getResponseJson(res);
    if (!res.ok) throw new Error(data.error || 'Erreur lors de la publication');
    return data;
  },
  getUser: async (userId) => {
    return apiFetch(`/users/${userId}`, {
      headers: await getAuthHeaders(null),
    });
  },
  updateProfile: async (updates) => {
    if (!currentUser?.uid) throw new Error('Utilisateur non connecté');
    return apiFetch(`/users/${currentUser.uid}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(updates),
    });
  },
  followUser: async (userId) => {
    return apiFetch(`/users/${userId}/follow`, {
      method: 'POST',
      headers: await getAuthHeaders(null),
    });
  },
  unfollowUser: async (userId) => {
    return apiFetch(`/users/${userId}/unfollow`, {
      method: 'POST',
      headers: await getAuthHeaders(null),
    });
  },
  uploadAvatar: async (imageUri) => {
    if (!currentUser?.uid) throw new Error('Utilisateur non connecté');

    const formData = new FormData();
    formData.append('avatar', {
      uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
      type: 'image/jpeg',
      name: `avatar_${Date.now()}.jpg`,
    });
    formData.append('useCloudinary', STORAGE_MODE === 'online' ? 'true' : 'false');

    const res = await fetch(`${API_URL}/users/${currentUser.uid}/avatar`, {
      method: 'POST',
      body: formData,
      headers: await getAuthHeaders(null),
    });
    const data = await getResponseJson(res);
    if (!res.ok) throw new Error(data.error || 'Erreur lors de la mise à jour avatar');
    return {
      ...data,
      avatarUrl: configService.fixMediaUrl(data.avatarUrl),
    };
  },
};

export default { auth: authService, db: dbService, config: configService };
