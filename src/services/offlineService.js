import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_VIDEOS_KEY = 'AFROVIBE_OFFLINE_VIDEOS';

/**
 * Save a video to offline storage with full metadata.
 */
export async function saveVideoOffline({ id, videoUri, caption, category, audioName, tags = [] }) {
  const storedRaw = await AsyncStorage.getItem(OFFLINE_VIDEOS_KEY);
  const stored = storedRaw ? JSON.parse(storedRaw) : [];

  // Avoid duplicates
  const exists = stored.find(v => v.id === id);
  if (exists) return;

  const newEntry = {
    id: id || 'offline_' + Date.now(),
    videoUri,           // local file:// URI
    caption,
    category,
    audioName,
    tags,               // array of hashtag strings e.g. ['#DanseTaCulture', '#AfroVibe']
    likes: '0',
    commentsCount: '0',
    shares: '0',
    views: '0',
    savedAt: new Date().toISOString(),
    isOffline: true,
    user: {
      username: 'Moi',
      fullName: 'Mon Profil',
      avatar: null,
      isVerified: false,
    },
  };

  stored.unshift(newEntry);
  await AsyncStorage.setItem(OFFLINE_VIDEOS_KEY, JSON.stringify(stored));
  return newEntry;
}

/**
 * Get all offline-saved videos.
 */
export async function getOfflineVideos() {
  const raw = await AsyncStorage.getItem(OFFLINE_VIDEOS_KEY);
  return raw ? JSON.parse(raw) : [];
}

/**
 * Remove a video from offline storage.
 */
export async function removeOfflineVideo(id) {
  const raw = await AsyncStorage.getItem(OFFLINE_VIDEOS_KEY);
  const stored = raw ? JSON.parse(raw) : [];
  const updated = stored.filter(v => v.id !== id);
  await AsyncStorage.setItem(OFFLINE_VIDEOS_KEY, JSON.stringify(updated));
}

/**
 * Merge online videos with offline ones, avoiding duplicates.
 */
export function mergeWithOffline(onlineVideos, offlineVideos) {
  const onlineIds = new Set(onlineVideos.map(v => v.id));
  const offlineOnly = offlineVideos.filter(v => !onlineIds.has(v.id));
  return [...onlineVideos, ...offlineOnly];
}

export default {
  saveVideoOffline,
  getOfflineVideos,
  removeOfflineVideo,
  mergeWithOffline,
};
