const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to use Supabase in routes
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// ── API Routes ──

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Afro Vibe Supabase Backend is running' });
});

// Get Users
app.get('/api/users', async (req, res) => {
  const { data, error } = await req.supabase.from('users').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Admin Dashboard: SPA fallback for any non-API GET request
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Supabase proxy server running on port ${PORT}`);
});
