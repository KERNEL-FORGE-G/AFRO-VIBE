const express = require('express');
const cors = require('cors');
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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Afro Vibe Supabase Backend is running' });
});

// Middleware to use Supabase in routes
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// Example route: Get Users
app.get('/api/users', async (req, res) => {
  const { data, error } = await req.supabase.from('users').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Auth integration would go here, though Supabase handles it directly
// This server acts as a proxy or extended logic provider

app.listen(PORT, () => {
  console.log(`Supabase proxy server running on port ${PORT}`);
});
