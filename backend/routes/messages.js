const express = require('express');
const router = express.Router();
const { firestore, isFirestorePrimary } = require('../firebaseConfig');
const { getUserId } = require('../authUtils');

// Get messages between two users
router.get('/:otherUserId', async (req, res) => {
  const db = req.db;
  const myId = getUserId(req, null);
  const otherUserId = req.params.otherUserId;

  if (!myId) return res.status(401).json({ error: 'Utilisateur non authentifié' });

  try {
    if (isFirestorePrimary()) {
      const snapshot = await firestore.collection('messages')
        .where('participants', 'array-contains', myId)
        .get();

      const messages = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(message => message.participants.includes(otherUserId))
        .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));

      return res.json(messages);
    }

    const messages = await db.all(`
      SELECT m.*, u_sender.username as sender_name, u_receiver.username as receiver_name
      FROM messages m
      JOIN users u_sender ON m.sender_id = u_sender.id
      JOIN users u_receiver ON m.receiver_id = u_receiver.id
      WHERE (sender_id = ? AND receiver_id = ?) 
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `, [myId, otherUserId, otherUserId, myId]);
    
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send a message
router.post('/:receiverId', async (req, res) => {
  const db = req.db;
  const senderId = getUserId(req, null);
  const receiverId = req.params.receiverId;
  const { text } = req.body;

  if (!senderId) return res.status(401).json({ error: 'Utilisateur non authentifié' });
  if (!text) return res.status(400).json({ error: 'Message text required' });

  try {
    if (isFirestorePrimary()) {
      const messageRef = firestore.collection('messages').doc();
      await messageRef.set({
        id: messageRef.id,
        sender_id: senderId,
        receiver_id: receiverId,
        participants: [senderId, receiverId],
        text,
        created_at: new Date().toISOString(),
      });

      return res.status(201).json({ success: true, id: messageRef.id });
    }

    // Ensure sender exists
    const sender = await db.get('SELECT id FROM users WHERE id = ?', [senderId]);
    if (!sender) {
      await db.run('INSERT OR IGNORE INTO users (id, username, email) VALUES (?, ?, ?)', [senderId, 'User_'+senderId.substring(5,10), senderId+'@local.com']);
    }
    
    // Ensure receiver exists (might be a mock user from frontend)
    const receiver = await db.get('SELECT id FROM users WHERE id = ?', [receiverId]);
    if (!receiver) {
      await db.run('INSERT OR IGNORE INTO users (id, username, email) VALUES (?, ?, ?)', [receiverId, 'User_'+receiverId.substring(5,10), receiverId+'@local.com']);
    }

    const id = 'msg_' + Date.now();
    await db.run(`
      INSERT INTO messages (id, sender_id, receiver_id, text)
      VALUES (?, ?, ?, ?)
    `, [id, senderId, receiverId, text]);
    
    res.status(201).json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
