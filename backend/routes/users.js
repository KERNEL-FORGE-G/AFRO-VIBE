const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../cloudinaryConfig');
const { firestore, admin } = require('../firebaseConfig');
const { getUserId } = require('../authUtils');

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

function toClientUser(user, isFollowing = false) {
  return {
    id: user.id,
    uid: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName || user.username,
    avatar: user.avatar || 'logo.jpg',
    followers: user.followers || 0,
    following: user.following || 0,
    likes: user.likes || 0,
    bio: user.bio || '',
    isVerified: user.isVerified === true || user.isVerified === 1,
    isFollowing,
  };
}

// GET user profile
router.get('/:id', async (req, res) => {
  const db = req.db;
  try {
    if (firestore) {
      const userDoc = await firestore.collection('users').doc(req.params.id).get();
      if (!userDoc.exists) return res.status(404).json({ error: 'Utilisateur introuvable' });

      const currentUserId = getUserId(req, null);
      let isFollowing = false;
      if (currentUserId) {
        const followId = `${currentUserId}_${req.params.id}`;
        const followDoc = await firestore.collection('follows').doc(followId).get();
        isFollowing = followDoc.exists;
      }

      return res.json(toClientUser({ id: userDoc.id, ...userDoc.data() }, isFollowing));
    }

    const user = await db.get('SELECT id, username, email, fullName, avatar, followers, following, likes, bio, isVerified FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const currentUserId = getUserId(req, null);
    const followRecord = currentUserId
      ? await db.get('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?', [currentUserId, req.params.id])
      : null;

    res.json(toClientUser(user, !!followRecord));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update profile
router.put('/:id', async (req, res) => {
  const db = req.db;
  const currentUserId = getUserId(req, null);
  if (currentUserId !== req.params.id) return res.status(403).json({ error: 'Non autorisé' });

  const { bio, fullName, username } = req.body;
  try {
    if (firestore) {
      const updates = {};
      if (bio !== undefined) updates.bio = bio;
      if (fullName !== undefined) updates.fullName = fullName;
      if (username !== undefined) updates.username = username;
      updates.updated_at = new Date().toISOString();
      await firestore.collection('users').doc(req.params.id).update(updates);
    } else {
      await db.run('UPDATE users SET bio = COALESCE(?, bio), fullName = COALESCE(?, fullName), username = COALESCE(?, username) WHERE id = ?',
        [bio, fullName, username, req.params.id]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST follow user
router.post('/:id/follow', async (req, res) => {
  const db = req.db;
  const followerId = getUserId(req, null);
  const followingId = req.params.id;

  if (!followerId) return res.status(401).json({ error: 'Utilisateur non authentifié' });
  if (followerId === followingId) return res.status(400).json({ error: 'Impossible de se suivre soi-même' });

  try {
    if (firestore) {
      const followId = `${followerId}_${followingId}`;
      const followRef = firestore.collection('follows').doc(followId);
      const followerRef = firestore.collection('users').doc(followerId);
      const followingRef = firestore.collection('users').doc(followingId);

      await firestore.runTransaction(async (transaction) => {
        const followDoc = await transaction.get(followRef);
        if (followDoc.exists) return;

        transaction.set(followRef, {
          id: followId,
          follower_id: followerId,
          following_id: followingId,
          created_at: new Date().toISOString(),
        });
        transaction.update(followerRef, { following: admin.firestore.FieldValue.increment(1) });
        transaction.update(followingRef, { followers: admin.firestore.FieldValue.increment(1) });
      });
    } else {
      const result = await db.run('INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)', [followerId, followingId]);
      if (result.changes > 0) {
        await db.run('UPDATE users SET following = following + 1 WHERE id = ?', [followerId]);
        await db.run('UPDATE users SET followers = followers + 1 WHERE id = ?', [followingId]);
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST unfollow user
router.post('/:id/unfollow', async (req, res) => {
  const db = req.db;
  const followerId = getUserId(req, null);
  const followingId = req.params.id;

  if (!followerId) return res.status(401).json({ error: 'Utilisateur non authentifié' });

  try {
    if (firestore) {
      const followId = `${followerId}_${followingId}`;
      const followRef = firestore.collection('follows').doc(followId);
      const followerRef = firestore.collection('users').doc(followerId);
      const followingRef = firestore.collection('users').doc(followingId);

      await firestore.runTransaction(async (transaction) => {
        const followDoc = await transaction.get(followRef);
        if (!followDoc.exists) return;

        transaction.delete(followRef);
        transaction.update(followerRef, { following: admin.firestore.FieldValue.increment(-1) });
        transaction.update(followingRef, { followers: admin.firestore.FieldValue.increment(-1) });
      });
    } else {
      const result = await db.run('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [followerId, followingId]);
      if (result.changes > 0) {
        await db.run('UPDATE users SET following = MAX(0, following - 1) WHERE id = ?', [followerId]);
        await db.run('UPDATE users SET followers = MAX(0, followers - 1) WHERE id = ?', [followingId]);
      }
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
  const userId = getUserId(req, null);
  const useCloudinary = req.body.useCloudinary === 'true' || process.env.FORCE_CLOUDINARY === 'true' || !!firestore;

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

    if (firestore) {
      await firestore.collection('users').doc(req.params.id).update({
        avatar: avatarUrl,
        updated_at: new Date().toISOString(),
      });
    } else {
      await db.run('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, req.params.id]);
    }

    res.json({ success: true, avatarUrl: avatarUrl });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
