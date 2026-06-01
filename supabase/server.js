const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase safely
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ── Auth Routes ──
app.post('/api/auth/register', async (req, res) => {
  const { email, password, username } = req.body;
  const { data, error } = await supabase.auth.signUp({
    email, password, options: { data: { username } }
  });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ user: data.user });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ user: data.user, session: data.session });
});

// ── API Routes (Proxy to Supabase) ──
app.get('/api/videos', async (req, res) => {
  const { data, error } = await supabase.from('videos').select('*, users(*)').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/videos', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

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

app.post('/api/videos/:id/like', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  const { error } = await supabase.from('likes').insert({
    video_id: req.params.id,
    user_id: user.id
  });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.get('/api/users/:id', async (req, res) => {
  const { data, error } = await supabase.from('users').select('*').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ error: 'User not found' });
  res.json(data);
});

// Admin Dashboard: SPA fallback
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Backend proxy running on port ${PORT}`);
});
