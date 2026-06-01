const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../cloudinaryConfig');
const supabase = require('../supabaseClient');

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

// Helper to get User ID from JWT or Header
const getUserId = (req) => req.headers['x-user-id'] || 'user_h4nwy4x';

// Get all videos
router.get('/', async (req, res) => {
  const db = req.db;
  try {
    let videos = [];

    if (supabase) {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          users (*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      videos = data.map(v => ({
        id: v.id,
        videoUrl: v.video_url,
        provenance: 'Cloud',
        caption: v.caption,
        likes: v.likes_count,
        commentsCount: v.comments_count,
        shares: v.shares_count,
        audioName: v.audio_name,
        category: v.category,
        views: v.views_count,
        thumbnail: v.thumbnail_url,
        user: {
          uid: v.users.id,
          username: v.users.username,
          fullName: v.users.full_name,
          avatar: v.users.avatar_url,
          isVerified: v.users.is_verified
        }
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
          user: {
            uid: v.user_id || 'unknown',
            username: v.username || 'Utilisateur inconnu',
            fullName: v.fullName || 'Utilisateur inconnu',
            avatar: v.avatar || 'logo.jpg',
            isVerified: v.isVerified === 1
          }
        };
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
  const userId = getUserId(req);
  const db = req.db;
  
  try {
    if (supabase) {
      // Logic for Supabase Like (simplified)
      const { data: existingLike } = await supabase
        .from('likes')
        .select('*')
        .eq('video_id', videoId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        await supabase.from('likes').delete().eq('id', existingLike.id);
        await supabase.rpc('decrement_likes', { vid: videoId }); // Need a function in Postgres
        res.json({ isLiked: false });
      } else {
        await supabase.from('likes').insert([{ video_id: videoId, user_id: userId }]);
        await supabase.rpc('increment_likes', { vid: videoId });
        res.json({ isLiked: true });
      }
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
  const userId = getUserId(req);
  const db = req.db;
  const caption = req.body.caption || 'Nouvelle vidéo Afro Vibe !';
  const category = req.body.category || 'Danse';
  const audioName = req.body.audioName || 'Son Original';
  const bodyVideoUrl = req.body.videoUrl;
  const useCloudinary = req.body.useCloudinary === 'true' || process.env.FORCE_CLOUDINARY === 'true' || !!supabase;
  
  try {
    if (!req.file && !bodyVideoUrl) {
      return res.status(400).json({ error: 'Aucun fichier vidéo ou URL fourni.' });
    }
    
    let videoUrl = bodyVideoUrl;

    if (req.file) {
      if (useCloudinary) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_large(req.file.path, {
            resource_type: 'video',
            folder: 'afrovibe/videos',
          }, (error, result) => {
            if (error) reject(error); else resolve(result);
          });
        });
        videoUrl = result.secure_url;
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      } else {
        videoUrl = `http://${req.headers.host}/uploads/${req.file.filename}`;
      }
    }
    
    if (supabase) {
      const { data, error } = await supabase
        .from('videos')
        .insert([{
          user_id: userId,
          video_url: videoUrl,
          caption,
          category,
          audio_name: audioName,
          thumbnail_url: 'logo.jpg'
        }])
        .select()
        .single();
      
      if (error) throw error;
      res.status(201).json({ success: true, videoId: data.id, videoUrl });
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
    if (supabase) {
      await supabase.rpc('increment_shares', { vid: videoId });
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
    if (supabase) {
      const { data, error } = await supabase
        .from('comments')
        .select('*, users(*)')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      formatted = data.map(c => ({
        id: c.id,
        text: c.text,
        time: '1h',
        user: {
          username: c.users.username,
          fullName: c.users.full_name,
          avatar: c.users.avatar_url
        }
      }));
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
  const userId = getUserId(req);
  const db = req.db;
  
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('comments')
        .insert([{ video_id: videoId, user_id: userId, text }])
        .select()
        .single();
      
      if (error) throw error;
      await supabase.rpc('increment_comments', { vid: videoId });
      res.status(201).json({ success: true, id: data.id });
    } else if (db) {
      const commentId = 'com_' + Date.now();
      await db.run(`INSERT INTO comments (id, video_id, user_id, text) VALUES (?, ?, ?, ?)`, [commentId, videoId, userId, text]);
      await db.run('UPDATE videos SET commentsCount = commentsCount + 1 WHERE id = ?', [videoId]);
      res.status(201).json({ success: true, id: commentId });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

