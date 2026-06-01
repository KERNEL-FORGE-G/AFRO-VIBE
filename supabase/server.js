const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase safely
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.error('⚠️ Supabase credentials missing from environment variables!');
}

app.use(cors());
app.use(express.json());

// Serve static files - path.join(__dirname, 'public') is standard for Vercel
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Middleware to use Supabase in routes
app.use((req, res, next) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Database connection not initialized. Check environment variables.' });
  }
  req.supabase = supabase;
  next();
});

// ── API Routes ──

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Afro Vibe Supabase Backend is running 🎵' });
});

// Get Users
app.get('/api/users', async (req, res) => {
  try {
    const { data, error } = await req.supabase.from('users').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Dashboard: SPA fallback
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(publicPath, 'index.html'), (err) => {
      if (err) {
        res.status(404).send('Admin Dashboard not found');
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`Supabase proxy server running on port ${PORT}`);
});
