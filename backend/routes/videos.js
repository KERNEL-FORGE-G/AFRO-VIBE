const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../cloudinaryConfig');

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

    const formattedVideos = videos.map(v => {
      // Si c'est une vidéo locale (stockée dans /uploads/), on met à jour l'IP dynamiquement
      let finalVideoUrl = v.videoUrl;
      const isCloudinary = v.videoUrl && (v.videoUrl.includes('cloudinary.com') || v.videoUrl.includes('res.cloudinary.com'));
      
      if (v.videoUrl && v.videoUrl.includes('/uploads/') && !isCloudinary) {
        finalVideoUrl = v.videoUrl.replace(/http:\/\/[^\/]+/, `http://${req.headers.host}`);
      }

      return {
        id: v.id,
        videoUrl: finalVideoUrl,
        provenance: isCloudinary ? 'Cloudinary' : 'Local',
        caption: v.caption,
        likes: v.likes || 0,
        commentsCount: v.commentsCount || 0,
        shares: v.shares || 0,
        audioName: v.audioName || 'Son Original',
        category: v.category || 'Danse',
        views: v.views || 0,
        thumbnail: v.thumbnail || 'logo.jpg',
        isLiked: false, 
        user: {
          uid: v.user_id || 'unknown',
          username: v.username || 'Utilisateur inconnu',
          fullName: v.fullName || 'Utilisateur inconnu',
          avatar: v.avatar || 'logo.jpg',
          isVerified: v.isVerified === 1
        }
      };
    });

    res.json(formattedVideos);
  } catch (err) {
    console.error('SQL Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Like/Unlike a video
router.post('/:id/like', async (req, res) => {
  const videoId = req.params.id;
  const userId = getUserId(req);
  const db = req.db;
  
  try {
    const user = await db.get('SELECT id FROM users WHERE id = ?', [userId]);
    if (!user) {
      await db.run('INSERT OR IGNORE INTO users (id, username, email) VALUES (?, ?, ?)', [userId, 'User_'+userId.substring(5,10), userId+'@local.com']);
    }

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

// Share a video
router.post('/:id/share', async (req, res) => {
  const videoId = req.params.id;
  const db = req.db;
  try {
    await db.run('UPDATE videos SET shares = shares + 1 WHERE id = ?', [videoId]);
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
      time: '1h',
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
    const user = await db.get('SELECT id FROM users WHERE id = ?', [userId]);
    if (!user) {
      await db.run('INSERT OR IGNORE INTO users (id, username, email) VALUES (?, ?, ?)', [userId, 'User_'+userId.substring(5,10), userId+'@local.com']);
    }

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
  const useCloudinary = req.body.useCloudinary === 'true' || process.env.FORCE_CLOUDINARY === 'true';
  
  try {
    if (!req.file && !bodyVideoUrl) {
      return res.status(400).json({ error: 'Aucun fichier vidéo ou URL fourni.' });
    }
    
    let videoUrl = bodyVideoUrl;

    if (req.file) {
      if (useCloudinary) {
        console.log('--- DEBUT UPLOAD CLOUDINARY (Large File) ---');
        try {
          // Utilisation d'une promesse pour attendre le résultat de upload_large
          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_large(req.file.path, {
              resource_type: 'video',
              folder: 'afrovibe/videos',
              chunk_size: 6000000,
            }, (error, result) => {
              if (error) {
                console.error('Cloudinary Callback Error:', error);
                reject(error);
              } else {
                resolve(result);
              }
            });
          });
          
          console.log('✅ Cloudinary Success:', result.secure_url);
          videoUrl = result.secure_url;
        } catch (uploadError) {
          console.error('❌ CLOUDINARY ERROR:', uploadError);
          throw uploadError;
        } finally {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        }
      } else {
        // Mode local : On utilise l'IP actuelle du serveur pour que ça marche
        videoUrl = `http://${req.headers.host}/uploads/${req.file.filename}`;
      }
    }
    
    const videoId = 'vid_' + Date.now();
    console.log('--- CREATION POST VIDEO ---');
    console.log('ID:', videoId);
    console.log('URL Finale:', videoUrl);
    console.log('Source:', useCloudinary ? '☁️ Cloudinary' : '📁 Local');
    console.log('---------------------------');
    
    await db.run(`INSERT INTO videos (id, user_id, videoUrl, caption, likes, commentsCount, shares, audioName, category, views, thumbnail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [videoId, userId, videoUrl, caption, 0, 0, 0, audioName, category, 0, 'logo.jpg']
    );
    
    res.status(201).json({ success: true, videoId, videoUrl });
  } catch (err) {
    console.error('Video upload error:', err);
    res.status(500).json({ error: 'Erreur lors de la publication de la vidéo' });
  }
});

module.exports = router;
