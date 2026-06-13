import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';
import localService from './localService';
import onlineService from './onlineService';

let STORAGE_MODE = ENV.storageMode || 'online';

const getActiveService = () =>
  STORAGE_MODE === 'online' ? onlineService : localService;

export const configService = {
  getStorageMode: () => STORAGE_MODE,

  getApiUrl: () => {
    if (STORAGE_MODE === 'online') return 'online';
    return localService.config.getApiUrl();
  },

  setApiUrl: async (url) => localService.config.setApiUrl(url),

  setStorageMode: async (mode) => {
    STORAGE_MODE = mode;
    await AsyncStorage.setItem('STORAGE_MODE', mode);
    if (mode === 'online') {
      await onlineService.config.loadConfig();
    } else {
      await localService.config.loadConfig();
    }
  },

  loadConfig: async () => {
    const savedMode = await AsyncStorage.getItem('STORAGE_MODE');
    STORAGE_MODE = savedMode || ENV.storageMode || 'online';

    if (STORAGE_MODE === 'online') {
      await onlineService.config.loadConfig();
    } else {
      await localService.config.loadConfig();
    }
  },

  testConnection: async (url) => {
    if (STORAGE_MODE === 'online') {
      return onlineService.config.testConnection();
    }
    return localService.config.testConnection(url);
  },

  fixMediaUrl: (url) => getActiveService().config.fixMediaUrl(url),
};

export const authService = {
  signInWithEmailAndPassword: (email, password) =>
    getActiveService().auth.signInWithEmailAndPassword(email, password),

  signInWithGoogle: () => getActiveService().auth.signInWithGoogle(),

  signInWithGitHub: () => getActiveService().auth.signInWithGitHub(),

  createUserWithEmailAndPassword: (email, password, username) =>
    getActiveService().auth.createUserWithEmailAndPassword(email, password, username),

  signOut: () => getActiveService().auth.signOut(),

  onAuthStateChanged: (callback) => {
    const unsubs = [
      localService.auth.onAuthStateChanged((user) => {
        if (STORAGE_MODE !== 'online') callback(user);
      }),
      onlineService.auth.onAuthStateChanged((user) => {
        if (STORAGE_MODE === 'online') callback(user);
      }),
    ];
    callback(getActiveService().auth.getCurrentUser());
    return () => unsubs.forEach((u) => u());
  },

  getCurrentUser: () => getActiveService().auth.getCurrentUser(),
};

export const dbService = {
  getVideos: (lastVisible = null, limit = 10) => getActiveService().db.getVideos(lastVisible, limit),
  getUserVideos: (userId) => getActiveService().db.getUserVideos(userId),
  likeVideo: (id) => getActiveService().db.likeVideo(id),
  shareVideo: (id) => getActiveService().db.shareVideo(id),
  getComments: (id) => getActiveService().db.getComments(id),
  addComment: (id, text) => getActiveService().db.addComment(id, text),
  uploadVideo: (...args) => getActiveService().db.uploadVideo(...args),
  getUser: (id) => getActiveService().db.getUser(id),
  updateProfile: (updates) => getActiveService().db.updateProfile(updates),
  followUser: (id) => getActiveService().db.followUser(id),
  unfollowUser: (id) => getActiveService().db.unfollowUser(id),
  uploadAvatar: (uri) => getActiveService().db.uploadAvatar(uri),
  getMessages: (id) => getActiveService().db.getMessages(id),
  sendMessage: (id, text) => getActiveService().db.sendMessage(id, text),
  subscribeToMessages: (id, cb) => getActiveService().db.subscribeToMessages(id, cb),
  getNotifications: () => getActiveService().db.getNotifications(),
  getUnreadNotificationCount: () => getActiveService().db.getUnreadNotificationCount(),
  markNotificationRead: (id) => getActiveService().db.markNotificationRead(id),
  deleteNotification: (id) => getActiveService().db.deleteNotification(id),
  subscribeToNotifications: (userId, cb) => getActiveService().db.subscribeToNotifications(userId, cb),
  getRecentChatUsers: () => getActiveService().db.getRecentChatUsers(),
  getLikedVideos: (uid) => getActiveService().db.getLikedVideos(uid),
  getBookmarkedVideos: (uid) => getActiveService().db.getBookmarkedVideos(uid),
  toggleBookmark: (id) => getActiveService().db.toggleBookmark(id),
  getAllVideosAdmin: () => getActiveService().db.getAllVideosAdmin(),
  deleteVideoAdmin: (id) => getActiveService().db.deleteVideoAdmin(id),
};

export default { auth: authService, db: dbService, config: configService };
