import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { ENV } from '../config/env';

const DEFAULT_LOCAL_API_URL = ENV.localApiUrl || 'http://10.0.2.2:3000/api';
const BOOKMARKS_KEY = 'AFROVIBE_BOOKMARKS';

let API_URL = DEFAULT_LOCAL_API_URL.replace(/\/+$/, '');
let currentUser = null;
const authListeners = new Set();

const getResponseJson = async (response) => {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return {}; }
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
  if (!response.ok) throw new Error(data.error || `Erreur API (${response.status})`);
  return data;
};

const triggerAuthListeners = (user) => {
  currentUser = user;
  authListeners.forEach(listener => listener(user));
};

const saveSession = async (user, token) => {
  if (token) await AsyncStorage.setItem('USER_TOKEN', token);
  else await AsyncStorage.removeItem('USER_TOKEN');
  if (user) await AsyncStorage.setItem('CURRENT_USER', JSON.stringify(user));
  else await AsyncStorage.removeItem('CURRENT_USER');
  triggerAuthListeners(user);
};

const fixMediaUrl = (url) => {
  if (!url) return null;
  if (/^(https?:|file:|content:|data:)/.test(url)) return url;
  const apiRoot = API_URL.replace(/\/api$/, '');
  if (url.startsWith('/')) return `${apiRoot}${url}`;
  return `${apiRoot}/${url}`;
};

const getBookmarks = async () => {
  const raw = await AsyncStorage.getItem(BOOKMARKS_KEY);
  return raw ? JSON.parse(raw) : [];
};

const saveBookmarks = async (ids) => {
  await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(ids));
};

export const localConfigService = {
  getApiUrl: () => API_URL,
  setApiUrl: async (url) => {
    API_URL = (url || '').replace(/\/+$/, '');
    await AsyncStorage.setItem('API_URL', API_URL);
  },
  loadConfig: async () => {
    const saved = await AsyncStorage.getItem('API_URL');
    if (saved) API_URL = saved.replace(/\/+$/, '');
    const savedUserRaw = await AsyncStorage.getItem('CURRENT_USER');
    if (savedUserRaw) {
      currentUser = JSON.parse(savedUserRaw);
      triggerAuthListeners(currentUser);
    }
  },
  testConnection: async (url) => {
    try {
      const response = await fetch(`${(url || '').replace(/\/+$/, '')}/health`);
      return response.ok;
    } catch {
      return false;
    }
  },
  fixMediaUrl,
};

export const localAuthService = {
  signInWithEmailAndPassword: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await getResponseJson(res);
    if (!res.ok) throw new Error(data.error || 'Erreur de connexion');
    await saveSession(data.user, data.token);
    return { user: data.user };
  },

  signInWithGoogle: async () => {
    throw new Error('Connexion Google disponible uniquement en mode En Ligne.');
  },

  signInWithGitHub: async () => {
    throw new Error('Connexion GitHub disponible uniquement en mode En Ligne.');
  },

  signInWithAuthentifictor: async () => {
    throw new Error('Connexion via Authentifictor disponible uniquement en mode En Ligne.');
  },

  createUserWithEmailAndPassword: async (email, password, username = 'new_user') => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
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

export const localDbService = {
  getVideos: async (lastVisible = null, limit = 10) => {
    // For local, we could use query params ?lastId=...&limit=...
    // But for now let's just return what the API gives and wrap it
    const videos = await apiFetch(`/videos?limit=${limit}${lastVisible ? `&lastId=${lastVisible}` : ''}`);
    return { videos, lastVisible: null }; // Simulated pagination
  },

  getUserVideos: async (userId) => apiFetch(`/videos?userId=${userId}`),

  likeVideo: async (videoId) => apiFetch(`/videos/${videoId}/like`, {
    method: 'POST',
    headers: await getAuthHeaders(null),
  }),

  shareVideo: async (videoId) => apiFetch(`/videos/${videoId}/share`, {
    method: 'POST',
    headers: await getAuthHeaders(null),
  }),

  getComments: async (videoId) => apiFetch(`/videos/${videoId}/comments`),

  addComment: async (videoId, text) => apiFetch(`/videos/${videoId}/comments`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ text }),
  }),

  uploadVideo: async (videoUri, caption, category) => {
    const formData = new FormData();
    formData.append('video', {
      uri: Platform.OS === 'android' ? videoUri : videoUri.replace('file://', ''),
      type: 'video/mp4',
      name: `video_${Date.now()}.mp4`,
    });
    formData.append('caption', caption);
    formData.append('category', category);
    formData.append('useCloudinary', 'false');

    const res = await fetch(`${API_URL}/videos`, {
      method: 'POST',
      body: formData,
      headers: await getAuthHeaders(null),
    });
    const data = await getResponseJson(res);
    if (!res.ok) throw new Error(data.error || 'Erreur lors de la publication');
    return data;
  },

  getUser: async (userId) => apiFetch(`/users/${userId}`, {
    headers: await getAuthHeaders(null),
  }),

  updateProfile: async (updates) => {
    if (!currentUser?.uid) throw new Error('Utilisateur non connecté');
    return apiFetch(`/users/${currentUser.uid}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(updates),
    });
  },

  followUser: async (userId) => apiFetch(`/users/${userId}/follow`, {
    method: 'POST',
    headers: await getAuthHeaders(null),
  }),

  unfollowUser: async (userId) => apiFetch(`/users/${userId}/unfollow`, {
    method: 'POST',
    headers: await getAuthHeaders(null),
  }),

  uploadAvatar: async (imageUri) => {
    if (!currentUser?.uid) throw new Error('Utilisateur non connecté');
    const formData = new FormData();
    formData.append('avatar', {
      uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
      type: 'image/jpeg',
      name: `avatar_${Date.now()}.jpg`,
    });
    formData.append('useCloudinary', 'false');

    const res = await fetch(`${API_URL}/users/${currentUser.uid}/avatar`, {
      method: 'POST',
      body: formData,
      headers: await getAuthHeaders(null),
    });
    const data = await getResponseJson(res);
    if (!res.ok) throw new Error(data.error || 'Erreur lors de la mise à jour avatar');
    return { ...data, avatarUrl: fixMediaUrl(data.avatarUrl) };
  },

  getMessages: async (otherUserId) => apiFetch(`/messages/${otherUserId}`, {
    headers: await getAuthHeaders(null),
  }),

  sendMessage: async (receiverId, text) => apiFetch(`/messages/${receiverId}`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ text }),
  }),

  subscribeToMessages: (otherUserId, callback) => {
    let active = true;
    const poll = async () => {
      if (!active) return;
      try {
        const messages = await localDbService.getMessages(otherUserId);
        if (active) callback(messages);
      } catch (err) {
        console.error('[Messages] poll error:', err);
      }
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  },

  getNotifications: async () => [],

  getUnreadNotificationCount: async () => 0,

  markNotificationRead: async () => {},

  deleteNotification: async () => {},

  subscribeToNotifications: (userId, callback) => () => {},

  getRecentChatUsers: async () => {
    if (!currentUser?.uid) return [];
    try {
      const users = await apiFetch('/users', { headers: await getAuthHeaders(null) });
      return (users || [])
        .filter(u => u.id !== currentUser.uid)
        .slice(0, 10)
        .map(u => ({
          uid: u.id,
          id: u.id,
          username: u.username,
          fullName: u.fullName || u.username,
          avatar: fixMediaUrl(u.avatar),
        }));
    } catch {
      return [];
    }
  },

  getLikedVideos: async (userId) => {
    const uid = userId || currentUser?.uid;
    if (!uid) return [];
    const all = await apiFetch('/videos');
    return all.filter(v => v.isLiked);
  },

  getBookmarkedVideos: async (userId) => {
    const uid = userId || currentUser?.uid;
    if (!uid) return [];
    const bookmarkIds = await getBookmarks();
    const all = await apiFetch('/videos');
    return all.filter(v => bookmarkIds.includes(v.id));
  },

  toggleBookmark: async (videoId) => {
    const bookmarks = await getBookmarks();
    const exists = bookmarks.includes(videoId);
    const updated = exists ? bookmarks.filter(id => id !== videoId) : [...bookmarks, videoId];
    await saveBookmarks(updated);
    return { bookmarked: !exists };
  },

  getAllVideosAdmin: async () => apiFetch('/videos'),

  deleteVideoAdmin: async (videoId) => apiFetch(`/videos/${videoId}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(null),
  }),
};

export default {
  config: localConfigService,
  auth: localAuthService,
  db: localDbService,
};
