const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = 'supersecret_afrovibe_key_2026'; // Dev only

// Register
router.post('/register', async (req, res) => {
  const { email, password, username } = req.body;
  const db = req.db;

  try {
    const existingUser = await db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const userId = 'user_' + Math.random().toString(36).substring(2, 9);
    
    await db.run(
      `INSERT INTO users (id, username, email, password_hash, fullName, avatar, isVerified) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, username, email, hash, username, 'logo.jpg', 0]
    );

    const userObj = { uid: userId, email, username, fullName: username, avatar: 'logo.jpg', isVerified: false };
    const token = jwt.sign({ uid: userId }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user: userObj, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const db = req.db;

  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userObj = {
      uid: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar,
      isVerified: user.isVerified === 1,
      followers: user.followers,
      following: user.following,
      likes: user.likes,
      bio: user.bio
    };

    const token = jwt.sign({ uid: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user: userObj, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
