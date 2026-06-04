const express = require('express');
const bcrypt = require('bcrypt');
const { firestore } = require('../firebaseConfig');
const { createToken } = require('../authUtils');

const router = express.Router();

async function findFirestoreUserByEmail(email) {
  if (!firestore) return null;
  const snapshot = await firestore.collection('users').where('email', '==', email).limit(1).get();
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

async function findFirestoreUserByUsername(username) {
  if (!firestore) return null;
  const snapshot = await firestore.collection('users').where('username', '==', username).limit(1).get();
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

function toClientUser(user) {
  return {
    uid: user.id,
    email: user.email,
    username: user.username,
    fullName: user.fullName || user.username,
    avatar: user.avatar || 'logo.jpg',
    isVerified: user.isVerified === true || user.isVerified === 1,
    followers: user.followers || 0,
    following: user.following || 0,
    likes: user.likes || 0,
    bio: user.bio || '',
  };
}

// Register
router.post('/register', async (req, res) => {
  const { email, password, username } = req.body;
  const db = req.db;

  try {
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, password and username are required' });
    }

    // 1. Check if user exists (Firestore online or SQLite local)
    let existingUser = null;
    
    if (firestore) {
      existingUser = await findFirestoreUserByEmail(email) || await findFirestoreUserByUsername(username);
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

    // 3. Save to Firestore (online mode)
    if (firestore) {
      const user = {
        id: userId,
        username,
        email,
        password_hash: hash,
        fullName: username,
        avatar: 'logo.jpg',
        followers: 0,
        following: 0,
        likes: 0,
        bio: '',
        isVerified: false,
        created_at: new Date().toISOString(),
      };
      await firestore.collection('users').doc(userId).set(user);
      finalUser = toClientUser(user);
    } 
    
    // 4. Save to Local SQLite when Firestore is not configured
    if (!firestore && db) {
      const localId = userId;
      await db.run(
        `INSERT INTO users (id, username, email, password_hash, fullName, avatar, isVerified) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [localId, username, email, hash, username, 'logo.jpg', 0]
      );
      
      finalUser = toClientUser({ id: localId, email, username, fullName: username, avatar: 'logo.jpg', isVerified: false });
    }

    const token = createToken(finalUser.uid);
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
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    let user = null;

    // 1. Try Firestore first (online)
    if (firestore) {
      user = await findFirestoreUserByEmail(email);
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

    const userObj = toClientUser(user);

    const token = createToken(user.id);
    res.json({ user: userObj, token });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
