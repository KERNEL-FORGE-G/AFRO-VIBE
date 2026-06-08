const express = require('express');
const { firestore } = require('../firebaseConfig');
const router = express.Router();

router.post('/', async (req, res) => {
  const db = req.db;

  if (!firestore) {
    return res.status(500).json({ error: 'Firestore non configuré sur le serveur.' });
  }

  try {
    const results = { users: 0, videos: 0, errors: [] };

    // 1. Sync Users
    const localUsers = await db.all('SELECT * FROM users');
    for (const user of localUsers) {
      try {
        await firestore.collection('users').doc(user.id).set({
        id: user.id,
        username: user.username,
        email: user.email,
        password_hash: user.password_hash,
        fullName: user.fullName || user.username,
        avatar: user.avatar || 'logo.jpg',
        bio: user.bio,
        followers: user.followers || 0,
        following: user.following || 0,
        likes: user.likes || 0,
        isVerified: user.isVerified === 1,
        updated_at: new Date().toISOString(),
      }, { merge: true });
        results.users++;
      } catch (error) {
        console.error('Sync user error:', error);
        results.errors.push(`User ${user.username}: ${error.message}`);
      }
    }

    // 2. Sync Videos
    const localVideos = await db.all('SELECT * FROM videos');
    for (const video of localVideos) {
      try {
        await firestore.collection('videos').doc(video.id).set({
        id: video.id,
        user_id: video.user_id,
        videoUrl: video.videoUrl,
        caption: video.caption,
        likes: video.likes || 0,
        commentsCount: video.commentsCount || 0,
        shares: video.shares || 0,
        audioName: video.audioName || 'Son Original',
        category: video.category,
        views: video.views || 0,
        thumbnail: video.thumbnail || 'logo.jpg',
        created_at: video.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { merge: true });
        results.videos++;
      } catch (error) {
        console.error('Sync video error:', error);
        results.errors.push(`Video ${video.id}: ${error.message}`);
      }
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ error: 'Erreur lors de la synchronisation: ' + err.message });
  }
});

module.exports = router;
