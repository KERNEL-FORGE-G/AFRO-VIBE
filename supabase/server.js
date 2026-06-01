const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase client (Server-side ONLY)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(cors());
app.use(express.json());

// Helper to authenticate user from Bearer Token
async function getAuthUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  return error ? null : user;
}

// ── API Routes (Proxy to Supabase) ──

// Videos
app.get('/api/videos', async (req, res) => {
  const { data, error } = await supabase.from('videos').select('*, users(*)').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/videos', async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { video_url, caption, category } = req.body;
  const { data, error } = await supabase.from('videos').insert({
    user_id: user.id,
    video_url,
    caption,
    category
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Likes
app.post('/api/videos/:id/like', async (req, res) => {
  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { error } = await supabase.from('likes').insert({
    video_id: req.params.id,
    user_id: user.id
  });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Users
app.get('/api/users/:id', async (req, res) => {
  const { data, error } = await supabase.from('users').select('*').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ error: 'User not found' });
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Backend proxy running on port ${PORT}`);
});
