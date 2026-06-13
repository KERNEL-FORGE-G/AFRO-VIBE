import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  runTransaction,
  onSnapshot,
} from 'firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { ENV, isFirebaseConfigured } from '../config/env';
import { getFirebaseAuth, getFirestoreDb } from './firebaseClient';
import { uploadVideoToCloudinary, uploadImageToCloudinary } from './cloudinaryClient';

let currentUser = null;
const authListeners = new Set();

const assertFirebase = () => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase non configuré. Remplissez src/config/env.js');
  }
};

const toClientUser = (user, extra = {}) => ({
  uid: user.id || user.uid,
  id: user.id || user.uid,
  email: user.email || '',
  username: user.username || 'user',
  fullName: user.fullName || user.username || 'Utilisateur',
  avatar: user.avatar || 'logo.jpg',
  isVerified: user.isVerified === true,
  followers: user.followers || 0,
  following: user.following || 0,
  likes: user.likes || 0,
  bio: user.bio || '',
  ...extra,
});

const toClientVideo = (video, user, extra = {}) => {
  const isCloudinary = video.videoUrl?.includes('cloudinary.com');
  return {
    id: video.id,
    videoUrl: video.videoUrl,
    provenance: isCloudinary ? 'Cloudinary' : 'Online',
    caption: video.caption,
    likes: String(video.likes || 0),
    commentsCount: String(video.commentsCount || 0),
    shares: String(video.shares || 0),
    audioName: video.audioName || 'Son Original',
    category: video.category || 'Danse',
    views: String(video.views || 0),
    thumbnail: video.thumbnail || 'logo.jpg',
    user: {
      uid: user?.id || video.user_id,
      username: user?.username || 'Utilisateur',
      fullName: user?.fullName || user?.username || 'Utilisateur',
      avatar: user?.avatar || 'logo.jpg',
      isVerified: user?.isVerified === true,
      isFollowing: extra.isFollowing || false,
    },
    isLiked: extra.isLiked || false,
    isBookmarked: extra.isBookmarked || false,
  };
};

const triggerAuthListeners = (user) => {
  currentUser = user;
  authListeners.forEach(listener => listener(user));
};

const fetchFirestoreUser = async (userId) => {
  if (!userId) return null;
  const snap = await getDoc(doc(getFirestoreDb(), 'users', userId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

const ensureUserProfile = async (firebaseUser, username) => {
  const db = getFirestoreDb();
  const ref = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const profile = {
      id: firebaseUser.uid,
      username: username || firebaseUser.email?.split('@')[0] || 'user',
      email: firebaseUser.email || '',
      fullName: firebaseUser.displayName || username || 'Utilisateur',
      avatar: firebaseUser.photoURL || 'logo.jpg',
      followers: 0,
      following: 0,
      likes: 0,
      bio: '',
      isVerified: false,
      created_at: new Date().toISOString(),
    };
    await setDoc(ref, profile);
    return toClientUser(profile);
  }
  return toClientUser({ id: snap.id, ...snap.data() });
};

const createNotification = async ({ toUserId, fromUserId, type, message, videoId }) => {
  if (!toUserId || toUserId === fromUserId) return;
  const db = getFirestoreDb();
  await addDoc(collection(db, 'notifications'), {
    user_id: toUserId,
    from_user_id: fromUserId,
    type,
    message,
    video_id: videoId || null,
    read: false,
    created_at: new Date().toISOString(),
  });
};

const formatNotifTime = (iso) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}j`;
};

export const onlineConfigService = {
  getApiUrl: () => 'online',
  setApiUrl: async () => {},
  loadConfig: async () => {
    if (!isFirebaseConfigured()) return;
    if (ENV.google.webClientId) {
      GoogleSignin.configure({ webClientId: ENV.google.webClientId });
    }
  },
  testConnection: async () => isFirebaseConfigured(),
  fixMediaUrl: (url) => {
    if (!url) return null;
    if (/^(https?:|file:|content:|data:)/.test(url)) return url;
    return url;
  },
};

export const onlineAuthService = {
  signInWithEmailAndPassword: async (email, password) => {
    assertFirebase();
    const auth = getFirebaseAuth();
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = await ensureUserProfile(cred.user);
    triggerAuthListeners(user);
    return { user };
  },

  createUserWithEmailAndPassword: async (email, password, username = 'new_user') => {
    assertFirebase();
    const auth = getFirebaseAuth();
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: username });
    const user = await ensureUserProfile(cred.user, username);
    triggerAuthListeners(user);
    return { user };
  },

  signInWithGoogle: async () => {
    assertFirebase();
    if (!ENV.google.webClientId) {
      throw new Error('Google non configuré. Remplissez ENV.google.webClientId dans env.js');
    }
    await GoogleSignin.hasPlayServices();
    const result = await GoogleSignin.signIn();
    const idToken = result.data?.idToken;
    if (!idToken) throw new Error('Token Google introuvable');
    const credential = GoogleAuthProvider.credential(idToken);
    const auth = getFirebaseAuth();
    const cred = await signInWithCredential(auth, credential);
    const user = await ensureUserProfile(cred.user);
    triggerAuthListeners(user);
    return { user };
  },

  signInWithGitHub: async () => {
    assertFirebase();
    throw new Error(
      'Connexion GitHub : activez le provider GitHub dans Firebase Console, ' +
      'puis utilisez Google ou email/mot de passe en attendant.',
    );
  },

  signOut: async () => {
    assertFirebase();
    try { await GoogleSignin.signOut(); } catch {}
    await firebaseSignOut(getFirebaseAuth());
    triggerAuthListeners(null);
    return true;
  },

  onAuthStateChanged: (callback) => {
    authListeners.add(callback);
    callback(currentUser);

    if (!isFirebaseConfigured()) {
      return () => authListeners.delete(callback);
    }

    const auth = getFirebaseAuth();
    const unsubFirebase = firebaseOnAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const profile = await fetchFirestoreUser(fbUser.uid);
        triggerAuthListeners(profile ? toClientUser(profile) : toClientUser({
          id: fbUser.uid,
          uid: fbUser.uid,
          email: fbUser.email,
          username: fbUser.email?.split('@')[0],
          fullName: fbUser.displayName,
          avatar: fbUser.photoURL,
        }));
      } else {
        triggerAuthListeners(null);
      }
    });

    return () => {
      authListeners.delete(callback);
      unsubFirebase();
    };
  },

  getCurrentUser: () => currentUser,
};

export const onlineDbService = {
  getVideos: async (lastVisible = null, limitCount = 10) => {
    assertFirebase();
    const db = getFirestoreDb();
    const myId = currentUser?.uid;

    let vQuery = query(
      collection(db, 'videos'),
      orderBy('created_at', 'desc'),
      limit(limitCount)
    );

    if (lastVisible) {
      vQuery = query(vQuery, startAfter(lastVisible));
    }

    const snap = await getDocs(vQuery);
    const lastDoc = snap.docs[snap.docs.length - 1];

    const bookmarkSnap = myId
      ? await getDocs(query(collection(db, 'bookmarks'), where('user_id', '==', myId)))
      : { docs: [] };
    const bookmarkedIds = new Set(bookmarkSnap.docs.map(d => d.data().video_id));

    const videos = await Promise.all(snap.docs.map(async (videoDoc) => {
      const video = { id: videoDoc.id, ...videoDoc.data() };
      const user = await fetchFirestoreUser(video.user_id);
      let isLiked = false;
      let isFollowing = false;
      if (myId) {
        const likeDoc = await getDoc(doc(db, 'likes', `${video.id}_${myId}`));
        isLiked = likeDoc.exists();
        if (user) {
          const followDoc = await getDoc(doc(db, 'follows', `${myId}_${user.id}`));
          isFollowing = followDoc.exists();
        }
      }
      return toClientVideo(video, user, {
        isLiked,
        isFollowing,
        isBookmarked: bookmarkedIds.has(video.id),
      });
    }));

    return { videos, lastVisible: lastDoc };
  },

  getUserVideos: async (userId) => {
    assertFirebase();
    const db = getFirestoreDb();
    const myId = currentUser?.uid;
    const snap = await getDocs(query(
      collection(db, 'videos'),
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    ));

    const bookmarkSnap = myId
      ? await getDocs(query(collection(db, 'bookmarks'), where('user_id', '==', myId)))
      : { docs: [] };
    const bookmarkedIds = new Set(bookmarkSnap.docs.map(d => d.data().video_id));

    const videos = await Promise.all(snap.docs.map(async (videoDoc) => {
      const video = { id: videoDoc.id, ...videoDoc.data() };
      const user = await fetchFirestoreUser(video.user_id);
      let isLiked = false;
      let isFollowing = false;
      if (myId) {
        const likeDoc = await getDoc(doc(db, 'likes', `${video.id}_${myId}`));
        isLiked = likeDoc.exists();
        if (user) {
          const followDoc = await getDoc(doc(db, 'follows', `${myId}_${user.id}`));
          isFollowing = followDoc.exists();
        }
      }
      return toClientVideo(video, user, {
        isLiked,
        isFollowing,
        isBookmarked: bookmarkedIds.has(video.id),
      });
    }));
    return videos;
  },

  likeVideo: async (videoId) => {
    assertFirebase();
    const myId = currentUser?.uid;
    if (!myId) throw new Error('Utilisateur non connecté');
    const db = getFirestoreDb();
    const likeId = `${videoId}_${myId}`;
    const likeRef = doc(db, 'likes', likeId);
    const videoRef = doc(db, 'videos', videoId);

    const result = await runTransaction(db, async (tx) => {
      const likeDoc = await tx.get(likeRef);
      if (likeDoc.exists()) {
        tx.delete(likeRef);
        tx.update(videoRef, { likes: increment(-1) });
        return { isLiked: false };
      }
      tx.set(likeRef, { id: likeId, video_id: videoId, user_id: myId, created_at: new Date().toISOString() });
      tx.update(videoRef, { likes: increment(1) });
      return { isLiked: true };
    });

    if (result.isLiked) {
      const videoSnap = await getDoc(videoRef);
      const video = videoSnap.data();
      if (video?.user_id) {
        await createNotification({
          toUserId: video.user_id,
          fromUserId: myId,
          type: 'like',
          message: 'a aimé votre vidéo.',
          videoId,
        });
      }
    }
    return result;
  },

  shareVideo: async (videoId) => {
    assertFirebase();
    const db = getFirestoreDb();
    await updateDoc(doc(db, 'videos', videoId), { shares: increment(1) });
    return { success: true };
  },

  getComments: async (videoId) => {
    assertFirebase();
    const db = getFirestoreDb();
    const snap = await getDocs(query(collection(db, 'comments'), where('video_id', '==', videoId)));
    const comments = await Promise.all(snap.docs.map(async (c) => {
      const comment = { id: c.id, ...c.data() };
      const user = await fetchFirestoreUser(comment.user_id);
      return {
        id: comment.id,
        text: comment.text,
        created_at: comment.created_at,
        time: '1m',
        user: {
          uid: user?.id,
          username: user?.username || 'user',
          fullName: user?.fullName || 'Utilisateur',
          avatar: user?.avatar || 'logo.jpg',
        },
      };
    }));
    return comments.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  },

  addComment: async (videoId, text) => {
    assertFirebase();
    const myId = currentUser?.uid;
    if (!myId) throw new Error('Utilisateur non connecté');
    const db = getFirestoreDb();
    const commentRef = await addDoc(collection(db, 'comments'), {
      video_id: videoId,
      user_id: myId,
      text: text.trim(),
      created_at: new Date().toISOString(),
    });
    const videoRef = doc(db, 'videos', videoId);
    await updateDoc(videoRef, { commentsCount: increment(1) });
    const videoSnap = await getDoc(videoRef);
    const video = videoSnap.data();
    if (video?.user_id) {
      await createNotification({
        toUserId: video.user_id,
        fromUserId: myId,
        type: 'comment',
        message: 'a commenté votre vidéo.',
        videoId,
      });
    }
    const user = await fetchFirestoreUser(myId);
    return {
      id: commentRef.id,
      text: text.trim(),
      time: '1m',
      user: {
        uid: user?.id,
        username: user?.username || 'user',
        fullName: user?.fullName || 'Utilisateur',
        avatar: user?.avatar || 'logo.jpg',
      },
    };
  },

  uploadVideo: async (videoUri, caption, category) => {
    assertFirebase();
    const myId = currentUser?.uid;
    if (!myId) throw new Error('Utilisateur non connecté');
    const { url, thumbnail } = await uploadVideoToCloudinary(videoUri);
    const db = getFirestoreDb();
    const videoRef = doc(collection(db, 'videos'));
    const video = {
      id: videoRef.id,
      user_id: myId,
      videoUrl: url,
      caption: caption || 'Nouvelle vidéo Afro Vibe !',
      likes: 0,
      commentsCount: 0,
      shares: 0,
      audioName: 'Son Original',
      category: category || 'Danse',
      views: 0,
      thumbnail: thumbnail || 'logo.jpg',
      created_at: new Date().toISOString(),
    };
    await setDoc(videoRef, video);
    const user = await fetchFirestoreUser(myId);
    return { success: true, videoId: videoRef.id, videoUrl: url, video: toClientVideo(video, user) };
  },

  getUser: async (userId) => {
    assertFirebase();
    let user = await fetchFirestoreUser(userId);
    if (!user) {
      // Si c'est l'utilisateur actuel, on peut tenter de récupérer les infos de base
      if (userId === currentUser?.uid) {
        return currentUser;
      }
      throw new Error('Utilisateur introuvable');
    }
    const myId = currentUser?.uid;
    let isFollowing = false;
    if (myId && myId !== userId) {
      const followDoc = await getDoc(doc(getFirestoreDb(), 'follows', `${myId}_${userId}`));
      isFollowing = followDoc.exists();
    }
    return toClientUser(user, { isFollowing });
  },

  updateProfile: async (updates) => {
    assertFirebase();
    const myId = currentUser?.uid;
    if (!myId) throw new Error('Utilisateur non connecté');
    const ref = doc(getFirestoreDb(), 'users', myId);
    await updateDoc(ref, { ...updates, updated_at: new Date().toISOString() });
    const updated = await fetchFirestoreUser(myId);
    const clientUser = toClientUser(updated);
    triggerAuthListeners(clientUser);
    return { success: true };
  },

  followUser: async (userId) => {
    assertFirebase();
    const myId = currentUser?.uid;
    if (!myId) throw new Error('Utilisateur non connecté');
    const db = getFirestoreDb();
    const followId = `${myId}_${userId}`;
    await runTransaction(db, async (tx) => {
      const followRef = doc(db, 'follows', followId);
      const followDoc = await tx.get(followRef);
      if (followDoc.exists()) return;
      tx.set(followRef, { id: followId, follower_id: myId, following_id: userId, created_at: new Date().toISOString() });
      tx.update(doc(db, 'users', myId), { following: increment(1) });
      tx.update(doc(db, 'users', userId), { followers: increment(1) });
    });
    await createNotification({
      toUserId: userId,
      fromUserId: myId,
      type: 'follow',
      message: 'a commencé à vous suivre.',
    });
    return { success: true };
  },

  unfollowUser: async (userId) => {
    assertFirebase();
    const myId = currentUser?.uid;
    if (!myId) throw new Error('Utilisateur non connecté');
    const db = getFirestoreDb();
    const followId = `${myId}_${userId}`;
    await runTransaction(db, async (tx) => {
      const followRef = doc(db, 'follows', followId);
      const followDoc = await tx.get(followRef);
      if (!followDoc.exists()) return;
      tx.delete(followRef);
      tx.update(doc(db, 'users', myId), { following: increment(-1) });
      tx.update(doc(db, 'users', userId), { followers: increment(-1) });
    });
    return { success: true };
  },

  uploadAvatar: async (imageUri) => {
    assertFirebase();
    const myId = currentUser?.uid;
    if (!myId) throw new Error('Utilisateur non connecté');
    const avatarUrl = await uploadImageToCloudinary(imageUri);
    await updateDoc(doc(getFirestoreDb(), 'users', myId), {
      avatar: avatarUrl,
      updated_at: new Date().toISOString(),
    });
    const updated = await fetchFirestoreUser(myId);
    triggerAuthListeners(toClientUser(updated));
    return { success: true, avatarUrl };
  },

  getMessages: async (otherUserId) => {
    assertFirebase();
    const myId = currentUser?.uid;
    if (!myId) throw new Error('Utilisateur non connecté');
    const db = getFirestoreDb();
    const snap = await getDocs(query(collection(db, 'messages'), where('participants', 'array-contains', myId)));
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(m => m.participants?.includes(otherUserId))
      .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
  },

  sendMessage: async (receiverId, text) => {
    assertFirebase();
    const myId = currentUser?.uid;
    if (!myId) throw new Error('Utilisateur non connecté');
    const db = getFirestoreDb();
    await addDoc(collection(db, 'messages'), {
      sender_id: myId,
      receiver_id: receiverId,
      participants: [myId, receiverId],
      text: text.trim(),
      created_at: new Date().toISOString(),
    });
    await createNotification({
      toUserId: receiverId,
      fromUserId: myId,
      type: 'message',
      message: 'vous a envoyé un message.',
    });
    return { success: true };
  },

  subscribeToMessages: (otherUserId, callback) => {
    assertFirebase();
    const myId = currentUser?.uid;
    if (!myId) return () => {};

    const db = getFirestoreDb();
    const messagesQuery = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', myId),
    );

    return onSnapshot(
      messagesQuery,
      (snap) => {
        const messages = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((m) => m.participants?.includes(otherUserId))
          .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
        callback(messages);
      },
      (err) => console.error('[Messages] subscription error:', err),
    );
  },

  getNotifications: async () => {
    assertFirebase();
    const myId = currentUser?.uid;
    if (!myId) return [];
    const db = getFirestoreDb();
    const snap = await getDocs(query(
      collection(db, 'notifications'),
      where('user_id', '==', myId),
    ));
    const items = await Promise.all(snap.docs.map(async (n) => {
      const notif = { id: n.id, ...n.data() };
      const fromUser = await fetchFirestoreUser(notif.from_user_id);
      return {
        id: notif.id,
        type: notif.type,
        message: notif.message,
        time: formatNotifTime(notif.created_at),
        unread: !notif.read,
        videoThumb: notif.video_id ? 'banner_mock.jpg' : null,
        videoId: notif.video_id,
        user: fromUser ? toClientUser(fromUser) : { uid: notif.from_user_id, username: 'user', fullName: 'Utilisateur' },
        _createdAt: notif.created_at,
      };
    }));
    return items.sort((a, b) => String(b._createdAt).localeCompare(String(a._createdAt)));
  },

  getUnreadNotificationCount: async () => {
    const notifs = await onlineDbService.getNotifications();
    return notifs.filter(n => n.unread).length;
  },

  markNotificationRead: async (notifId) => {
    assertFirebase();
    await updateDoc(doc(getFirestoreDb(), 'notifications', notifId), { read: true });
  },

  deleteNotification: async (notifId) => {
    assertFirebase();
    await deleteDoc(doc(getFirestoreDb(), 'notifications', notifId));
  },

  subscribeToNotifications: (userId, callback) => {
    assertFirebase();
    const db = getFirestoreDb();
    const q = query(
      collection(db, 'notifications'),
      where('user_id', '==', userId),
      where('read', '==', false),
      orderBy('created_at', 'desc')
    );

    return onSnapshot(q, async (snap) => {
      const items = await Promise.all(snap.docs.map(async (n) => {
        const notif = { id: n.id, ...n.data() };
        const fromUser = await fetchFirestoreUser(notif.from_user_id);
        return {
          id: notif.id,
          type: notif.type,
          message: notif.message,
          time: formatNotifTime(notif.created_at),
          user: fromUser ? toClientUser(fromUser) : { username: 'user' },
        };
      }));
      callback(items);
    });
  },

  getRecentChatUsers: async () => {
    assertFirebase();
    const myId = currentUser?.uid;
    if (!myId) return [];
    const db = getFirestoreDb();
    const snap = await getDocs(query(collection(db, 'messages'), where('participants', 'array-contains', myId)));
    const userIds = new Set();
    snap.docs.forEach(d => {
      const data = d.data();
      data.participants?.forEach(p => { if (p !== myId) userIds.add(p); });
    });
    const users = await Promise.all([...userIds].map(id => fetchFirestoreUser(id)));
    return users.filter(Boolean).map(u => toClientUser(u));
  },

  getLikedVideos: async (userId) => {
    assertFirebase();
    const uid = userId || currentUser?.uid;
    if (!uid) return [];
    const db = getFirestoreDb();
    const likesSnap = await getDocs(query(collection(db, 'likes'), where('user_id', '==', uid)));
    const videoIds = likesSnap.docs.map(d => d.data().video_id);
    const videos = await Promise.all(videoIds.map(async (vid) => {
      const snap = await getDoc(doc(db, 'videos', vid));
      if (!snap.exists()) return null;
      const video = { id: snap.id, ...snap.data() };
      const user = await fetchFirestoreUser(video.user_id);
      return toClientVideo(video, user, { isLiked: true });
    }));
    return videos.filter(Boolean);
  },

  getBookmarkedVideos: async (userId) => {
    assertFirebase();
    const uid = userId || currentUser?.uid;
    if (!uid) return [];
    const db = getFirestoreDb();
    const snap = await getDocs(query(collection(db, 'bookmarks'), where('user_id', '==', uid)));
    const videos = await Promise.all(snap.docs.map(async (b) => {
      const videoId = b.data().video_id;
      const vSnap = await getDoc(doc(db, 'videos', videoId));
      if (!vSnap.exists()) return null;
      const video = { id: vSnap.id, ...vSnap.data() };
      const user = await fetchFirestoreUser(video.user_id);
      return toClientVideo(video, user, { isBookmarked: true });
    }));
    return videos.filter(Boolean);
  },

  toggleBookmark: async (videoId) => {
    assertFirebase();
    const myId = currentUser?.uid;
    if (!myId) throw new Error('Utilisateur non connecté');
    const db = getFirestoreDb();
    const bookmarkId = `${myId}_${videoId}`;
    const ref = doc(db, 'bookmarks', bookmarkId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await deleteDoc(ref);
      return { bookmarked: false };
    }
    await setDoc(ref, { id: bookmarkId, user_id: myId, video_id: videoId, created_at: new Date().toISOString() });
    return { bookmarked: true };
  },

  getAllVideosAdmin: async () => {
    assertFirebase();
    const db = getFirestoreDb();
    const snap = await getDocs(query(collection(db, 'videos'), orderBy('created_at', 'desc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  deleteVideoAdmin: async (videoId) => {
    assertFirebase();
    await deleteDoc(doc(getFirestoreDb(), 'videos', videoId));
    return { success: true };
  },
};

export default {
  config: onlineConfigService,
  auth: onlineAuthService,
  db: onlineDbService,
};
