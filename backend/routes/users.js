const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../cloudinaryConfig');

const router = express.Router();

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, 'avatar_' + Date.now() + path.extname(file.originalname));
  }
});
const uploadAvatar = multer({ storage: avatarStorage });

const getUserId = (req) => req.headers['x-user-id'] || 'user_king';

// GET user profile
router.get('/:id', async (req, res) => {
  const db = req.db;
  try {
    const user = await db.get('SELECT id, username, email, fullName, avatar, followers, following, likes, bio, isVerified FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    
    // Check if the requesting user is following this user
    const currentUserId = getUserId(req);
    const followRecord = await db.get('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?', [currentUserId, req.params.id]);
    user.isFollowing = !!followRecord;
    
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update profile
router.put('/:id', async (req, res) => {
  const db = req.db;
  const currentUserId = getUserId(req);
  if (currentUserId !== req.params.id) return res.status(403).json({ error: 'Non autorisé' });

  const { bio, fullName, username } = req.body;
  try {
    await db.run('UPDATE users SET bio = COALESCE(?, bio), fullName = COALESCE(?, fullName), username = COALESCE(?, username) WHERE id = ?', 
      [bio, fullName, username, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST follow user
router.post('/:id/follow', async (req, res) => {
  const db = req.db;
  const followerId = getUserId(req);
  const followingId = req.params.id;

  if (followerId === followingId) return res.status(400).json({ error: 'Impossible de se suivre soi-même' });

  try {
    await db.run('INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)', [followerId, followingId]);
    
    // Update stats
    await db.run('UPDATE users SET following = following + 1 WHERE id = ?', [followerId]);
    await db.run('UPDATE users SET followers = followers + 1 WHERE id = ?', [followingId]);
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST unfollow user
router.post('/:id/unfollow', async (req, res) => {
  const db = req.db;
  const followerId = getUserId(req);
  const followingId = req.params.id;

  try {
    const result = await db.run('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [followerId, followingId]);
    if (result.changes > 0) {
      await db.run('UPDATE users SET following = MAX(0, following - 1) WHERE id = ?', [followerId]);
      await db.run('UPDATE users SET followers = MAX(0, followers - 1) WHERE id = ?', [followingId]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST upload avatar
router.post('/:id/avatar', uploadAvatar.single('avatar'), async (req, res) => {
  const db = req.db;
  const userId = getUserId(req);
  const useCloudinary = req.body.useCloudinary === 'true' || process.env.FORCE_CLOUDINARY === 'true';

  if (userId !== req.params.id) {
    return res.status(403).json({ error: 'Non autorisé' });
  }

  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier fourni' });

    let avatarUrl;
    if (useCloudinary) {
      console.log('Uploading avatar to Cloudinary...');
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'afrovibe/avatars',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });
      avatarUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    } else {
      avatarUrl = `/uploads/avatars/${req.file.filename}`;
    }

    await db.run('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, req.params.id]);

    res.json({ success: true, avatarUrl: avatarUrl });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
