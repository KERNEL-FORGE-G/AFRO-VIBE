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

// ... (GET and other routes)

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
