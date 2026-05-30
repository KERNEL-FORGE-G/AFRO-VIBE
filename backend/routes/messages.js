const express = require('express');
const router = express.Router();

const getUserId = (req) => req.headers['x-user-id'] || 'user_king';

// Get messages between two users
router.get('/:otherUserId', async (req, res) => {
  const db = req.db;
  const myId = getUserId(req);
  const otherUserId = req.params.otherUserId;

  try {
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
  const senderId = getUserId(req);
  const receiverId = req.params.receiverId;
  const { text } = req.body;

  if (!text) return res.status(400).json({ error: 'Message text required' });

  try {
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
