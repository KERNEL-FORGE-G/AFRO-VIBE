const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/avatars');
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
    res.json({ ...user, isVerified: user.isVerified === 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update user profile (bio, fullName)
router.put('/:id', async (req, res) => {
  const db = req.db;
  const { bio, fullName } = req.body;
  const userId = getUserId(req);

  if (userId !== req.params.id) {
    return res.status(403).json({ error: 'Non autorisé' });
  }

  try {
    await db.run('UPDATE users SET bio = ?, fullName = ? WHERE id = ?', [bio, fullName, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST upload avatar
router.post('/:id/avatar', uploadAvatar.single('avatar'), async (req, res) => {
  const db = req.db;
  const userId = getUserId(req);

  if (userId !== req.params.id) {
    return res.status(403).json({ error: 'Non autorisé' });
  }

  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier fourni' });

    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    await db.run('UPDATE users SET avatar = ? WHERE id = ?', [avatarPath, req.params.id]);

    res.json({ success: true, avatarUrl: avatarPath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
