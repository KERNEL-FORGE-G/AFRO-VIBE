import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import firebaseService from './firebaseService';

let API_URL = 'http://10.2.9.113:3000/api'; // Default for Android 
let STORAGE_MODE = 'offline'; // Par défaut en local pour éviter les erreurs Firebase
let currentUser = null;
const authListeners = new Set();
let currentToken = null;

const normalizeApiUrl = (url) => {
  if (!url || typeof url !== 'string') {
    throw new Error('URL du serveur invalide.');
  }

  const trimmedUrl = url.trim();
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    throw new Error('L\'URL doit commencer par http:// ou https://');
  }

  const cleanedUrl = trimmedUrl.replace(/\/+$/, '');
  return cleanedUrl.endsWith('/api') ? cleanedUrl : `${cleanedUrl}/api`;
};

const getResponseJson = async (response) => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error('Réponse serveur invalide. Vérifiez que l\'URL pointe vers le backend Afro Vibe (/api).');
  }
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
    
    const baseUrl = API_URL.replace(/\/api$/, '');
    const currentHost = baseUrl.replace(/^https?:\/\//, '');

    // If it's a full URL, check if it points to localhost and replace it if necessary
    if (url.startsWith('http') || url.startsWith('https')) {
      return url
        .replace(/localhost:3000/g, currentHost)
        .replace(/127\.0\.0\.1:3000/g, currentHost)
        .replace(/10\.0\.2\.2:3000/g, currentHost);
    }
    
    if (url.startsWith('data:')) {
      return url;
    }
    
    // Handle specific local image assets or defaults
    if (url === 'logo.jpg' || url === 'logo.png' || url === 'avatar_mock.jpg' || url === 'banner_mock.jpg') {
      // If it doesn't contain a slash, try to find it in uploads first, then root
      if (!url.includes('/')) return `${baseUrl}/uploads/${url}`;
    }

    if (url.startsWith('/')) {
      // If it starts with /uploads, it's already good, just prepend baseUrl
      return `${baseUrl}${url}`;
    }
    
    // Default to uploads folder for relative paths
    return `${baseUrl}/uploads/${url}`;
  },

  setApiUrl: async (url) => {
    const cleanedUrl = normalizeApiUrl(url);
    API_URL = cleanedUrl;
    await AsyncStorage.setItem('API_URL', cleanedUrl);
  },
  loadConfig: async () => {
    try {
      const savedUrl = await AsyncStorage.getItem('API_URL');
      if (savedUrl) {
        try {
          API_URL = normalizeApiUrl(savedUrl);
        } catch (urlError) {
          console.log('Invalid saved API URL, using default:', urlError);
          await AsyncStorage.removeItem('API_URL');
        }
      }

      const savedMode = await AsyncStorage.getItem('STORAGE_MODE');
      if (savedMode) {
        STORAGE_MODE = savedMode;
      }

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
      const testUrl = normalizeApiUrl(url || API_URL);
      const baseUrl = testUrl.replace(/\/api$/, '');
      const response = await fetchWithTimeout(`${baseUrl}/api/health`, {}, 8000);
      const data = await getResponseJson(response);
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
const fetchWithTimeout = (url, options, timeout = 15000) => {
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
    
    const data = await getResponseJson(res);
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
      
      const data = await getResponseJson(res);
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
          const data = await getResponseJson(res);
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
  getVideos: async (userId = null) => {
    // Si mode online, on essaie Firebase en priorité
    if (STORAGE_MODE === 'online') {
      try {
        const fbVideos = await firebaseService.getVideos(userId);
        if (fbVideos) return fbVideos;
      } catch (e) {
        console.log('Firebase fetch failed, falling back to local backend:', e);
      }
    }

    // Mode LOCAL (Node.js)
    try {
      const url = userId ? `${API_URL}/videos?userId=${userId}` : `${API_URL}/videos`;
      const res = await fetch(url);

      if (res.ok) {
        return await getResponseJson(res);
      }
      return [];
    } catch (e) {
      console.log('Error in local getVideos:', e);
      return [];
    }
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
    return await getResponseJson(res);
  },

  getComments: async (videoId) => {
    const res = await fetchWithTimeout(`${API_URL}/videos/${videoId}/comments`);
    if (!res.ok) throw new Error('Erreur');
    return await getResponseJson(res);
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
    return await getResponseJson(res);
  },

  shareVideo: async (videoId) => {
    const res = await fetchWithTimeout(`${API_URL}/videos/${videoId}/share`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': currentUser ? currentUser.uid : 'user_king'
      }
    });
    if (!res.ok) throw new Error('Erreur');
    return await getResponseJson(res);
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
    return await getResponseJson(res);
  },

  uploadVideo: async (videoUri, caption = 'Nouvelle vidéo Afro Vibe !', category = 'Danse') => {
    if (STORAGE_MODE === 'online') {
      return await firebaseService.uploadVideo(videoUri, caption);
    }

    // Mode LOCAL ou CLOUDINARY (via Node.js)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000);

    try {
      console.log(`Upload ${STORAGE_MODE === 'cloudinary' ? 'CLOUDINARY' : 'LOCAL'} de:`, videoUri);
      const formData = new FormData();
      
      const cleanUri = Platform.OS === 'android' ? videoUri : videoUri.replace('file://', '');
      
      formData.append('video', {
        uri: cleanUri,
        type: 'video/mp4',
        name: `video_${Date.now()}.mp4`,
      });
      formData.append('caption', caption);
      formData.append('category', category);
      if (STORAGE_MODE === 'cloudinary') {
        formData.append('useCloudinary', 'true');
      }

      const res = await fetch(`${API_URL}/videos`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'x-user-id': currentUser ? currentUser.uid : 'user_local'
        },
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Upload failed:', errorText);
        throw new Error('Erreur d\'upload');
      }
      return await getResponseJson(res);
    } catch (err) {
      console.error('Fetch upload error:', err);
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  },

  uploadAvatar: async (imageUri) => {
    if (STORAGE_MODE === 'online') {
      const result = await firebaseService.uploadAvatar(imageUri);
      if (currentUser) {
        const updatedUser = { ...currentUser, avatar: result.avatarUrl };
        currentUser = updatedUser;
        await AsyncStorage.setItem('CURRENT_USER', JSON.stringify(updatedUser));
        triggerAuthListeners(updatedUser);
      }
      return result;
    }

    // Mode LOCAL ou CLOUDINARY (via Node.js)
    const formData = new FormData();
    formData.append('avatar', {
      uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
      type: 'image/jpeg',
      name: `avatar_${Date.now()}.jpg`,
    });
    if (STORAGE_MODE === 'cloudinary') {
      formData.append('useCloudinary', 'true');
    }

    const res = await fetch(`${API_URL}/users/${currentUser?.uid}/avatar`, {
      method: 'POST',
      body: formData,
      headers: {
        'x-user-id': currentUser?.uid
      },
    });

    if (!res.ok) throw new Error('Erreur d\'upload avatar');
    const result = await getResponseJson(res);
    
    // Fix URL before saving
    const fixedAvatarUrl = configService.fixMediaUrl(result.avatarUrl);
    result.avatarUrl = fixedAvatarUrl;
    
    // Persistance locale
    if (currentUser) {
      const updatedUser = { ...currentUser, avatar: fixedAvatarUrl };
      currentUser = updatedUser;
      await AsyncStorage.setItem('CURRENT_USER', JSON.stringify(updatedUser));
      triggerAuthListeners(updatedUser);
    }
    return result;
  },

  updateProfile: async (data) => {
    if (!currentUser) throw new Error('Utilisateur non connecté');
    
    if (STORAGE_MODE === 'online') {
      const result = await firebaseService.updateProfile(currentUser.uid, data);
      const updatedUser = { ...currentUser, ...data };
      currentUser = updatedUser;
      await AsyncStorage.setItem('CURRENT_USER', JSON.stringify(updatedUser));
      triggerAuthListeners(updatedUser);
      return result;
    }

    // Mode LOCAL (Node.js)
    const res = await fetch(`${API_URL}/users/${currentUser.uid}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': currentUser.uid
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error('Erreur de mise à jour locale');
    
    const updatedUser = { ...currentUser, ...data };
    currentUser = updatedUser;
    await AsyncStorage.setItem('CURRENT_USER', JSON.stringify(updatedUser));
    triggerAuthListeners(updatedUser);
    return { success: true };
  },

  getUser: async (userId) => {
    // Si mode online, on essaie Firebase en priorité, sinon on passe direct au backend
    if (STORAGE_MODE === 'online') {
      try {
        const fbUser = await firebaseService.getUser(userId);
        if (fbUser) return fbUser;
      } catch (e) {
        console.log('Firebase getUser failed, falling back to local backend:', e);
      }
    }

    // Mode LOCAL (Node.js)
    try {
      const res = await fetch(`${API_URL}/users/${userId}`);
      if (res.ok) {
        return await getResponseJson(res);
      }
    } catch (e) {
      console.log('Error in local getUser:', e);
    }
    
    // Fallback: Si c'est l'utilisateur actuel et qu'on est en offline, on retourne ses données locales
    if (currentUser && currentUser.uid === userId) {
      return currentUser;
    }

    throw new Error('Utilisateur introuvable');
  },

  getMessages: async (otherUserId) => {
    const res = await fetch(`${API_URL}/messages/${otherUserId}`, {
      headers: {
        'x-user-id': currentUser?.uid || 'user_king'
      }
    });
    if (!res.ok) throw new Error('Erreur messages');
    return await getResponseJson(res);
  },

  sendMessage: async (receiverId, text) => {
    const res = await fetch(`${API_URL}/messages/${receiverId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUser?.uid || 'user_king'
      },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error('Erreur envoi message');
    return await getResponseJson(res);
  },

  followUser: async (userId) => {
    const res = await fetch(`${API_URL}/users/${userId}/follow`, {
      method: 'POST',
      headers: { 'x-user-id': currentUser?.uid }
    });
    if (!res.ok) throw new Error('Erreur lors de l\'abonnement');
    return await getResponseJson(res);
  },

  unfollowUser: async (userId) => {
    const res = await fetch(`${API_URL}/users/${userId}/unfollow`, {
      method: 'POST',
      headers: { 'x-user-id': currentUser?.uid }
    });
    if (!res.ok) throw new Error('Erreur lors du désabonnement');
    return await getResponseJson(res);
  },
};

export default {
  auth: authService,
  db: dbService,
  config: configService
};
