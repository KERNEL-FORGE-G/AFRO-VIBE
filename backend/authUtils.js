const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_afrovibe_key_2026';

function getUserId(req, fallback = null) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (payload.uid) return payload.uid;
    } catch (error) {
      console.warn('Invalid auth token:', error.message);
    }
  }

  return req.headers['x-user-id'] || fallback;
}

function createToken(uid) {
  return jwt.sign({ uid }, JWT_SECRET, { expiresIn: '7d' });
}

module.exports = {
  JWT_SECRET,
  createToken,
  getUserId,
};
