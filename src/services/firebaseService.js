import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { ENV } from '../config/env';

// This service handles online storage using Firebase
export const firebaseService = {
  uploadVideo: async (videoUri, caption = 'Nouvelle vidéo Afro Vibe !') => {
    if (ENV.useMockFirebase) {
      console.log('Mocking Firebase Video Upload:', videoUri);
      return { success: true, videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', isMock: true };
    }

    try {
      const user = auth().currentUser;
      const userId = user ? user.uid : 'anonymous';
      const filename = `videos/${userId}/${Date.now()}_${videoUri.split('/').pop()}`;
      const reference = storage().ref(filename);

      console.log('Uploading to Firebase Storage:', filename);
      await reference.putFile(videoUri);
      const downloadURL = await reference.getDownloadURL();

      // Also create a firestore record for the video
      const videoDoc = await firestore().collection('videos').add({
        user_id: userId,
        videoUrl: downloadURL,
        caption: caption,
        likes: 0,
        commentsCount: 0,
        shares: 0,
        audioName: 'Son Original',
        category: 'Danse',
        views: 0,
        thumbnail: 'logo.jpg',
        created_at: firestore.FieldValue.serverTimestamp(),
      });

      return { success: true, videoId: videoDoc.id, videoUrl: downloadURL };
    } catch (error) {
      console.error('Firebase Storage Error:', error);
      throw error;
    }
  },

  uploadAvatar: async (imageUri) => {
    if (ENV.useMockFirebase) {
      console.log('Mocking Firebase Avatar Upload:', imageUri);
      return { success: true, avatarUrl: 'https://i.pravatar.cc/300', isMock: true };
    }

    try {
      const user = auth().currentUser;
      const userId = user ? user.uid : 'anonymous';
      const filename = `avatars/${userId}/${Date.now()}_avatar.jpg`;
      const reference = storage().ref(filename);

      await reference.putFile(imageUri);
      const downloadURL = await reference.getDownloadURL();

      // Update user profile in Firestore if applicable
      await firestore().collection('users').doc(userId).set({
        avatar: downloadURL
      }, { merge: true });

      return { success: true, avatarUrl: downloadURL };
    } catch (error) {
      console.error('Firebase Avatar Error:', error);
      throw error;
    }
  },

  getVideos: async () => {
    if (ENV.useMockFirebase) {
      return [];
    }

    try {
      const snapshot = await firestore().collection('videos').orderBy('created_at', 'desc').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Map data to frontend format
        user: {
          username: 'Firebase User', // You'd fetch user details here
          fullName: 'Firebase User',
          avatar: null,
          isVerified: false
        }
      }));
    } catch (error) {
      console.error('Firestore Error:', error);
      throw error;
    }
  }
};

export default firebaseService;
