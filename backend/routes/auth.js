const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../supabaseClient');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_afrovibe_key_2026';

// Register
router.post('/register', async (req, res) => {
  const { email, password, username } = req.body;
  const db = req.db;

  try {
    // 1. Check if user exists (Supabase or Local)
    let existingUser = null;
    
    if (supabase) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${email},username.eq.${username}`)
        .single();
      existingUser = data;
    } else if (db) {
      existingUser = await db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
    }

    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const userId = 'user_' + Math.random().toString(36).substring(2, 9);
    
    let finalUser = null;

    // 3. Save to Supabase (Online Mode)
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          username,
          email,
          password_hash: hash,
          full_name: username,
          avatar_url: 'logo.jpg',
          is_verified: false
        }])
        .select()
        .single();
      
      if (error) throw error;
      finalUser = {
        uid: data.id,
        email: data.email,
        username: data.username,
        fullName: data.full_name,
        avatar: data.avatar_url,
        isVerified: data.is_verified
      };
    } 
    
    // 4. Save to Local SQLite (Offline Mode or Sync)
    if (db) {
      const localId = finalUser ? finalUser.uid : userId;
      await db.run(
        `INSERT INTO users (id, username, email, password_hash, fullName, avatar, isVerified) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [localId, username, email, hash, username, 'logo.jpg', 0]
      );
      
      if (!finalUser) {
        finalUser = { uid: localId, email, username, fullName: username, avatar: 'logo.jpg', isVerified: false };
      }
    }

    const token = jwt.sign({ uid: finalUser.uid }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user: finalUser, token });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const db = req.db;

  try {
    let user = null;

    // 1. Try Supabase first (Online)
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (data) user = {
        id: data.id,
        email: data.email,
        username: data.username,
        password_hash: data.password_hash,
        fullName: data.full_name,
        avatar: data.avatar_url,
        isVerified: data.is_verified,
        followers: data.followers_count,
        following: data.following_count,
        likes: data.likes_total,
        bio: data.bio
      };
    } 
    
    // 2. Fallback to Local DB (Offline)
    if (!user && db) {
      user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Verify Password
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
      isVerified: user.isVerified === true || user.isVerified === 1,
      followers: user.followers,
      following: user.following,
      likes: user.likes,
      bio: user.bio
    };

    const token = jwt.sign({ uid: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: userObj, token });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
