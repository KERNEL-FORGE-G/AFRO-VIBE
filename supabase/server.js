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
app.use(express.static(path.join(__dirname, 'public')));

// ── New OAuth Proxy Routes ──
app.get('/api/auth/social/:provider', async (req, res) => {
  const { provider } = req.params;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: 'afrovibe://auth/callback' // Ensure this matches your App scheme
    }
  });

  if (error) return res.status(400).json({ error: error.message });
  res.redirect(data.url);
});

// ── Existing API Routes ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Afro Vibe Backend running' });
});

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Backend proxy running on port ${PORT}`);
});
