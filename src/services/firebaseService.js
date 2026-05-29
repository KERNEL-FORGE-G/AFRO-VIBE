import { getAuth, signInAnonymously } from '@react-native-firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  setDoc,
  getDoc,
  where
} from '@react-native-firebase/firestore';
import { 
  getStorage, 
  ref, 
  putFile, 
  getDownloadURL 
} from '@react-native-firebase/storage';
import { ENV } from '../config/env';
import { Platform } from 'react-native';

// Helper pour s'assurer qu'on est connecté à Firebase (nécessaire pour Storage)
const ensureAuth = async () => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      console.log('Firebase: Tentative de connexion anonyme...');
      await signInAnonymously(auth);
      console.log('Firebase: Connecté anonymement.');
    }
    return auth.currentUser;
  } catch (err) {
    console.warn('Firebase Auth: Impossible de se connecter anonymement (vérifiez si l\'Auth Anonyme est activée dans la console Firebase).', err.message);
    return null; // On continue quand même l'upload (pourra échouer plus tard si règles strictes)
  }
};

// Helper pour formater la date
const getDateFolder = () => {
  const now = new Date();
  return `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}`;
};

export const firebaseService = {
  uploadVideo: async (videoUri, caption = 'Nouvelle vidéo Afro Vibe !') => {
    if (ENV.useMockFirebase) {
      return { success: true, videoUrl: 'https://sample-videos.com/video.mp4', isMock: true };
    }

    try {
      // 1. Auth (si possible)
      const user = await ensureAuth();
      const userId = user ? user.uid : 'anonymous';
      const userEmail = user?.email || 'unknown';
      
      // 2. Préparer le chemin Android (absolu sans file:// pour putFile)
      const localPath = Platform.OS === 'android' ? videoUri.replace('file://', '') : videoUri;
      
      const timestamp = Date.now();
      const dateFolder = getDateFolder();
      const filename = `users/${userId}/videos/${dateFolder}/${timestamp}_video.mp4`;
      
      const storage = getStorage();
      const videoRef = ref(storage, filename);

      console.log('Upload vers Storage:', filename);
      console.log('Chemin local:', localPath);
      
      // 3. Upload direct (plus stable sur certains Android)
      await putFile(videoRef, localPath);
      
      console.log('Upload réussi, récupération de l\'URL...');
      const downloadURL = await getDownloadURL(videoRef);

      // 4. Enregistrement Firestore
      const db = getFirestore();
      const videoDoc = await addDoc(collection(db, 'videos'), {
        user_id: userId,
        user_email: userEmail,
        videoUrl: downloadURL,
        caption: caption,
        created_at: serverTimestamp(),
      });

      return { success: true, videoId: videoDoc.id, videoUrl: downloadURL };
    } catch (error) {
      console.error('Firebase Storage Error in uploadVideo:', error);
      throw error;
    }
  },

  uploadAvatar: async (imageUri) => {
    if (ENV.useMockFirebase) {
      return { success: true, avatarUrl: 'https://i.pravatar.cc/300', isMock: true };
    }

    try {
      const user = await ensureAuth();
      const userId = user ? user.uid : 'anonymous';
      const timestamp = Date.now();
      
      const localPath = Platform.OS === 'android' ? imageUri.replace('file://', '') : imageUri;
      const filename = `users/${userId}/avatars/${timestamp}_avatar.jpg`;
      
      const storage = getStorage();
      const avatarRef = ref(storage, filename);

      await putFile(avatarRef, localPath);
      const downloadURL = await getDownloadURL(avatarRef);

      // Update user profile in Firestore
      const db = getFirestore();
      await setDoc(doc(db, 'users', userId), {
        avatar: downloadURL,
        updated_at: serverTimestamp()
      }, { merge: true });

      return { success: true, avatarUrl: downloadURL };
    } catch (error) {
      console.error('Firebase Avatar Error:', error);
      throw error;
    }
  },

  getUser: async (userId) => {
    try {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        return { uid: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Firestore Error in getUser:', error);
      throw error;
    }
  },

  updateProfile: async (userId, data) => {
    try {
      const db = getFirestore();
      await setDoc(doc(db, 'users', userId), {
        ...data,
        updated_at: serverTimestamp()
      }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error('Firestore Error in updateProfile:', error);
      throw error;
    }
  },

  getVideos: async (userId = null) => {
    if (ENV.useMockFirebase) return [];

    try {
      const db = getFirestore();
      const videosCollection = collection(db, 'videos');
      
      let videosQuery;
      if (userId) {
        videosQuery = query(
          videosCollection, 
          where('user_id', '==', userId),
          orderBy('created_at', 'desc')
        );
      } else {
        videosQuery = query(videosCollection, orderBy('created_at', 'desc'));
      }
      
      const snapshot = await getDocs(videosQuery);
      return snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        user: {
          uid: d.data().user_id,
          username: d.data().user_email?.split('@')[0] || 'Firebase User',
          avatar: null
        }
      }));
    } catch (error) {
      console.error('Firestore Error in getVideos:', error);
      throw error;
    }
  }
};

export default firebaseService;
