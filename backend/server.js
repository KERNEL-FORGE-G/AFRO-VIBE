const express = require('express');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');
const dotenv = require('dotenv');

dotenv.config();

const setupDatabase = require('./database');
const { isFirestoreEnabled } = require('./firebaseConfig');
const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const syncRoutes = require('./routes/sync');

const app = express();
const PORT = process.env.PORT || 3000;

// Detect local network IP (WiFi/LAN)
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve the admin dashboard (static HTML)
app.use(express.static(path.join(__dirname, 'public')));

// Initialize DB and start server
setupDatabase().then(async (db) => {
  // Attach DB to every request
  app.use((req, res, next) => {
    req.db = db;
    next();
  });

  // Seed if empty
  const videoCount = await db.get('SELECT COUNT(*) as count FROM videos');
  console.log('Video count:', videoCount);
  if (videoCount.count === 0) {
    console.log('Seeding database...');
    try {
      await db.run(`INSERT INTO users (id, username, email, fullName, avatar) VALUES (?, ?, ?, ?, ?)`, ['user_king', 'King_Moves', 'king@afrovibe.com', 'Christian Mboa', 'logo.jpg']);
      await db.run(`INSERT INTO videos (id, user_id, videoUrl, caption, likes, commentsCount, shares, audioName, category, views, thumbnail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['vid_1', 'user_king', 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-dancing-in-front-of-wall-with-neon-lights-42289-large.mp4', 'La danse c’est la langue du coeur ❤️🌍', 0, 0, 0, 'Afro Vibe Original', 'Danse', 128, 'logo.jpg']
      );
      console.log('Seeding complete.');
    } catch (e) {
      console.error('Seeding failed:', e);
    }
  }

  // ── Health check ──
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Afro Vibe Backend is running',
      database: isFirestoreEnabled() ? 'firestore' : 'sqlite',
      mediaStorage: process.env.CLOUDINARY_CLOUD_NAME ? 'cloudinary' : 'local',
    });
  });

  // ── Auth routes ──
  app.use('/api/auth', authRoutes);

  // ── Sync routes ──
  app.use('/api/sync', syncRoutes);

  // ── Video routes ──
  app.use('/api/videos', videoRoutes);

  // ── User routes ──
  app.use('/api/users', userRoutes);

  // ── Message routes ──
  app.use('/api/messages', messageRoutes);

  // ── Admin: list all users ──
  app.get('/api/users', async (req, res) => {
    try {
      const users = await db.all('SELECT id, username, email, fullName, avatar, followers, following, likes, bio, isVerified FROM users ORDER BY rowid DESC');
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ── Admin: delete a user ──
  app.delete('/api/users/:id', async (req, res) => {
    try {
      await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ── Admin: delete a video ──
  app.delete('/api/videos/:id', async (req, res) => {
    try {
      await db.run('DELETE FROM videos WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ── Serve dashboard for any non-API GET (SPA fallback) ──
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
      next();
    }
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    // Augmenter le timeout pour les gros fichiers (10 minutes)
    server.timeout = 600000;
    
    const localIp = getLocalIp();
    const localUrl = `http://localhost:${PORT}`;
    const networkUrl = `http://${localIp}:${PORT}/api`;
    const dashboardUrl = `http://localhost:${PORT}`;

    console.log('');
    console.log('  🎵  AFRO VIBE BACKEND');
    console.log('  ─────────────────────────────────────────');
    console.log(`  🟢  Serveur actif`);
    console.log(`  🖥️   Dashboard Admin    : ${dashboardUrl}`);
    console.log(`  📱  Mobile Android (physique) :`);
    console.log(`      → ${networkUrl}`);
    console.log(`  🤖  Émulateur Android   : http://10.0.2.2:${PORT}/api`);
    console.log('  ─────────────────────────────────────────');
    console.log(`  💡  Copiez l'URL réseau dans l'app :`);
    console.log(`      Paramètres → Configuration Serveur`);
    console.log('');

    // Auto-open dashboard in browser
    const openCmd = process.platform === 'win32' ? `start ${localUrl}`
      : process.platform === 'darwin' ? `open ${localUrl}`
      : `xdg-open ${localUrl}`;

    exec(openCmd, (err) => {
      if (err) console.log(`  ℹ️  Ouvrez manuellement : ${localUrl}`);
    });
  });

}).catch(err => {
  console.error('❌ Failed to setup database:', err);
});
