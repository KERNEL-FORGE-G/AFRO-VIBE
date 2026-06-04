const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { cloudinary, isCloudinaryConfigured } = require('../cloudinaryConfig');
const { firestore, admin, isFirestorePrimary } = require('../firebaseConfig');
const { getUserId } = require('../authUtils');
const { shouldUseCloudinary } = require('../runtimeConfig');

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, 'video_' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

function toClientVideo(video, user) {
  const isCloudinary = video.videoUrl && video.videoUrl.includes('cloudinary.com');
  return {
    id: video.id,
    videoUrl: video.videoUrl,
    provenance: isCloudinary ? 'Cloudinary' : 'Local',
    caption: video.caption,
    likes: video.likes || 0,
    commentsCount: video.commentsCount || 0,
    shares: video.shares || 0,
    audioName: video.audioName || 'Son Original',
    category: video.category || 'Danse',
    views: video.views || 0,
    thumbnail: video.thumbnail || 'logo.jpg',
    user: {
      uid: user?.id || video.user_id || 'unknown',
      username: user?.username || 'Utilisateur inconnu',
      fullName: user?.fullName || user?.username || 'Utilisateur inconnu',
      avatar: user?.avatar || 'logo.jpg',
      isVerified: user?.isVerified === true || user?.isVerified === 1,
      isFollowing: false,
    },
  };
}

async function getFirestoreUser(userId) {
  if (!isFirestorePrimary() || !firestore || !userId) return null;
  const doc = await firestore.collection('users').doc(userId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

async function uploadVideoToCloudinary(filePath) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(filePath, {
      resource_type: 'video',
      folder: 'afrovibe/videos',
    }, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

// Get all videos
router.get('/', async (req, res) => {
  const db = req.db;
  try {
    let videos = [];

    if (isFirestorePrimary()) {
      const snapshot = await firestore.collection('videos').orderBy('created_at', 'desc').get();
      videos = await Promise.all(snapshot.docs.map(async (doc) => {
        const video = { id: doc.id, ...doc.data() };
        const user = await getFirestoreUser(video.user_id);
        return toClientVideo(video, user);
      }));
    } else if (db) {
      const localVideos = await db.all(`
        SELECT v.*, u.id as user_id, u.username, u.fullName, u.avatar, u.isVerified
        FROM videos v
        LEFT JOIN users u ON v.user_id = u.id
        ORDER BY v.created_at DESC
      `);

      videos = localVideos.map(v => {
        let finalVideoUrl = v.videoUrl;
        const isCloudinary = v.videoUrl && (v.videoUrl.includes('cloudinary.com') || v.videoUrl.includes('res.cloudinary.com'));
        if (v.videoUrl && v.videoUrl.includes('/uploads/') && !isCloudinary) {
          finalVideoUrl = v.videoUrl.replace(/http:\/\/[^/]+/, `http://${req.headers.host}`);
        }

        return toClientVideo(
          { ...v, id: v.id, videoUrl: finalVideoUrl },
          { id: v.user_id, username: v.username, fullName: v.fullName, avatar: v.avatar, isVerified: v.isVerified }
        );
      });
    }

    res.json(videos);
  } catch (err) {
    console.error('Fetch videos error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Like/Unlike a video
router.post('/:id/like', async (req, res) => {
  const videoId = req.params.id;
  const userId = getUserId(req, 'anonymous');
  const db = req.db;
  
  try {
    if (isFirestorePrimary()) {
      const likeId = `${videoId}_${userId}`;
      const likeRef = firestore.collection('likes').doc(likeId);
      const videoRef = firestore.collection('videos').doc(videoId);
      const result = await firestore.runTransaction(async (transaction) => {
        const likeDoc = await transaction.get(likeRef);
        if (likeDoc.exists) {
          transaction.delete(likeRef);
          transaction.update(videoRef, { likes: admin.firestore.FieldValue.increment(-1) });
          return { isLiked: false };
        }

        transaction.set(likeRef, {
          id: likeId,
          video_id: videoId,
          user_id: userId,
          created_at: new Date().toISOString(),
        });
        transaction.update(videoRef, { likes: admin.firestore.FieldValue.increment(1) });
        return { isLiked: true };
      });
      res.json(result);
    } else if (db) {
      const existingLike = await db.get('SELECT * FROM likes WHERE video_id = ? AND user_id = ?', [videoId, userId]);
      if (existingLike) {
        await db.run('DELETE FROM likes WHERE video_id = ? AND user_id = ?', [videoId, userId]);
        await db.run('UPDATE videos SET likes = likes - 1 WHERE id = ?', [videoId]);
        res.json({ isLiked: false });
      } else {
        await db.run('INSERT INTO likes (video_id, user_id) VALUES (?, ?)', [videoId, userId]);
        await db.run('UPDATE videos SET likes = likes + 1 WHERE id = ?', [videoId]);
        res.json({ isLiked: true });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload video
router.post('/', upload.single('video'), async (req, res) => {
  const userId = getUserId(req, null);
  const db = req.db;
  const caption = req.body.caption || 'Nouvelle vidéo Afro Vibe !';
  const category = req.body.category || 'Danse';
  const audioName = req.body.audioName || 'Son Original';
  const bodyVideoUrl = req.body.videoUrl;
  const useCloudinary = shouldUseCloudinary(req, isFirestorePrimary());
  
  try {
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }

    if (!req.file && !bodyVideoUrl) {
      return res.status(400).json({ error: 'Aucun fichier vidéo ou URL fourni.' });
    }
    
    let videoUrl = bodyVideoUrl;

    if (req.file) {
      if (useCloudinary) {
        if (!isCloudinaryConfigured()) {
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
          return res.status(500).json({ error: 'Cloudinary non configuré sur le serveur.' });
        }
        const result = await uploadVideoToCloudinary(req.file.path);
        videoUrl = result.secure_url;
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      } else {
        videoUrl = `http://${req.headers.host}/uploads/${req.file.filename}`;
      }
    }
    
    if (isFirestorePrimary()) {
      const videoRef = firestore.collection('videos').doc();
      const video = {
        id: videoRef.id,
        user_id: userId,
        videoUrl,
        caption,
        likes: 0,
        commentsCount: 0,
        shares: 0,
        audioName,
        category,
        views: 0,
        thumbnail: 'logo.jpg',
        created_at: new Date().toISOString(),
      };
      await videoRef.set(video);
      const user = await getFirestoreUser(userId);
      res.status(201).json({ success: true, videoId: videoRef.id, videoUrl, video: toClientVideo(video, user) });
    } else if (db) {
      const videoId = 'vid_' + Date.now();
      await db.run(`INSERT INTO videos (id, user_id, videoUrl, caption, likes, commentsCount, shares, audioName, category, views, thumbnail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [videoId, userId, videoUrl, caption, 0, 0, 0, audioName, category, 0, 'logo.jpg']
      );
      res.status(201).json({ success: true, videoId, videoUrl });
    }
  } catch (err) {
    console.error('Video upload error:', err);
    res.status(500).json({ error: 'Erreur lors de la publication de la vidéo' });
  }
});

// Share a video
router.post('/:id/share', async (req, res) => {
  const videoId = req.params.id;
  const db = req.db;
  try {
    if (isFirestorePrimary()) {
      await firestore.collection('videos').doc(videoId).update({
        shares: admin.firestore.FieldValue.increment(1),
      });
    } else if (db) {
      await db.run('UPDATE videos SET shares = shares + 1 WHERE id = ?', [videoId]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get comments
router.get('/:id/comments', async (req, res) => {
  const videoId = req.params.id;
  const db = req.db;
  try {
    let formatted = [];
    if (isFirestorePrimary()) {
      const snapshot = await firestore.collection('comments')
        .where('video_id', '==', videoId)
        .get();
      formatted = await Promise.all(snapshot.docs.map(async (doc) => {
        const comment = { id: doc.id, ...doc.data() };
        const user = await getFirestoreUser(comment.user_id);
        return {
          id: comment.id,
          text: comment.text,
          created_at: comment.created_at,
          time: '1m',
          user: {
            uid: user?.id,
            username: user?.username || 'user',
            fullName: user?.fullName || user?.username || 'Utilisateur',
            avatar: user?.avatar || 'logo.jpg',
          },
        };
      }));
      formatted.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
    } else if (db) {
      const comments = await db.all(`
        SELECT c.*, u.username, u.fullName, u.avatar
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.video_id = ?
        ORDER BY c.created_at DESC
      `, [videoId]);
      
      formatted = comments.map(c => ({
        id: c.id,
        text: c.text,
        time: '1h',
        user: {
          username: c.username,
          fullName: c.fullName,
          avatar: c.avatar
        }
      }));
    }

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a comment
router.post('/:id/comments', async (req, res) => {
  const videoId = req.params.id;
  const { text } = req.body;
  const userId = getUserId(req, null);
  const db = req.db;
  
  try {
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié.' });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Commentaire vide.' });
    }

    if (isFirestorePrimary()) {
      const commentRef = firestore.collection('comments').doc();
      const comment = {
        id: commentRef.id,
        video_id: videoId,
        user_id: userId,
        text: text.trim(),
        created_at: new Date().toISOString(),
      };
      await commentRef.set(comment);
      await firestore.collection('videos').doc(videoId).update({
        commentsCount: admin.firestore.FieldValue.increment(1),
      });
      const user = await getFirestoreUser(userId);
      res.status(201).json({
        id: comment.id,
        text: comment.text,
        time: '1m',
        user: {
          uid: user?.id,
          username: user?.username || 'user',
          fullName: user?.fullName || user?.username || 'Utilisateur',
          avatar: user?.avatar || 'logo.jpg',
        },
      });
    } else if (db) {
      const commentId = 'com_' + Date.now();
      await db.run(`INSERT INTO comments (id, video_id, user_id, text) VALUES (?, ?, ?, ?)`, [commentId, videoId, userId, text]);
      await db.run('UPDATE videos SET commentsCount = commentsCount + 1 WHERE id = ?', [videoId]);
      res.status(201).json({ id: commentId, text, time: '1m', user: { username: 'Moi', avatar: 'logo.jpg' } });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

