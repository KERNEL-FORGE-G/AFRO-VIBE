const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// Middleware to mock JWT auth
const getUserId = (req) => req.headers['x-user-id'] || 'user_h4nwy4x';

// Get all videos
router.get('/', async (req, res) => {
  const db = req.db;
  try {
    const videos = await db.all(`
      SELECT v.*, u.id as user_id, u.username, u.fullName, u.avatar, u.isVerified
      FROM videos v
      LEFT JOIN users u ON v.user_id = u.id
      ORDER BY v.created_at DESC
    `);

    // Format to match frontend structure
    const formattedVideos = videos.map(v => ({
      id: v.id,
      videoUrl: v.videoUrl,
      caption: v.caption,
      likes: v.likes >= 1000 ? (v.likes/1000).toFixed(1) + 'K' : v.likes.toString(),
      commentsCount: v.commentsCount.toString(),
      shares: v.shares >= 1000 ? (v.shares/1000).toFixed(1) + 'K' : v.shares.toString(),
      audioName: v.audioName,
      category: v.category,
      views: v.views >= 1000 ? (v.views/1000).toFixed(1) + 'K' : v.views.toString(),
      thumbnail: v.thumbnail,
      user: {
        uid: v.user_id || 'unknown',
        username: v.username || 'Utilisateur inconnu',
        fullName: v.fullName || 'Utilisateur inconnu',
        avatar: v.avatar || 'logo.jpg',
        isVerified: v.isVerified === 1
      }
    }));

    console.log('DEBUG BACKEND: Videos formatées:', formattedVideos.length);
    res.json(formattedVideos);
  } catch (err) {
    console.error('DEBUG BACKEND: Erreur SQL:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Like/Unlike a video
router.post('/:id/like', async (req, res) => {
  const videoId = req.params.id;
  const userId = getUserId(req);
  const db = req.db;
  
  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get comments for a video
router.get('/:id/comments', async (req, res) => {
  const videoId = req.params.id;
  const db = req.db;
  try {
    const comments = await db.all(`
      SELECT c.*, u.username, u.fullName, u.avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.video_id = ?
      ORDER BY c.created_at DESC
    `, [videoId]);
    
    const formatted = comments.map(c => ({
      id: c.id,
      text: c.text,
      time: '1h', // simplified
      user: {
        username: c.username,
        fullName: c.fullName,
        avatar: c.avatar
      }
    }));

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
  const userId = getUserId(req);
  const db = req.db;
  
  try {
    const commentId = 'com_' + Date.now();
    await db.run(`INSERT INTO comments (id, video_id, user_id, text) VALUES (?, ?, ?, ?)`, [commentId, videoId, userId, text]);
    await db.run('UPDATE videos SET commentsCount = commentsCount + 1 WHERE id = ?', [videoId]);
    
    res.status(201).json({ success: true, id: commentId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload and create a new video post
router.post('/', upload.single('video'), async (req, res) => {
  const userId = getUserId(req);
  const db = req.db;
  const caption = req.body.caption || 'Nouvelle vidéo Afro Vibe !';
  const category = req.body.category || 'Danse';
  const audioName = req.body.audioName || 'Son Original';
  const bodyVideoUrl = req.body.videoUrl;
  
  try {
    if (!req.file && !bodyVideoUrl) {
      console.log('Upload failed: Missing file or videoUrl', { body: req.body });
      return res.status(400).json({ error: 'Aucun fichier vidéo ou URL fourni. (req.file and bodyVideoUrl are empty)' });
    }
    
    const videoUrl = req.file ? `http://${req.headers.host}/uploads/${req.file.filename}` : bodyVideoUrl; 
    const videoId = 'vid_' + Date.now();
    
    console.log('Creating video post:', { videoId, videoUrl, caption });
    
    await db.run(`INSERT INTO videos (id, user_id, videoUrl, caption, likes, commentsCount, shares, audioName, category, views, thumbnail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [videoId, userId, videoUrl, caption, 0, 0, 0, audioName, category, 0, 'logo.jpg']
    );
    
    res.status(201).json({ success: true, videoId, videoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la publication de la vidéo' });
  }
});

module.exports = router;
