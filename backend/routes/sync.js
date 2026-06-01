const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Initialize Supabase (from environment variables)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

router.post('/', async (req, res) => {
  const db = req.db;

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase non configuré sur le serveur local.' });
  }

  try {
    const results = { users: 0, videos: 0, errors: [] };

    // 1. Sync Users
    const localUsers = await db.all('SELECT * FROM users');
    for (const user of localUsers) {
      const { error } = await supabase.from('users').upsert({
        id: user.id.includes('user_') ? undefined : user.id, // Let Supabase generate UUID if local ID is temporary
        username: user.username,
        email: user.email,
        full_name: user.fullName,
        avatar_url: user.avatar,
        bio: user.bio,
        is_verified: user.isVerified === 1
      }, { onConflict: 'email' });
      
      if (error) results.errors.push(`User ${user.username}: ${error.message}`);
      else results.users++;
    }

    // 2. Sync Videos
    const localVideos = await db.all('SELECT * FROM videos');
    for (const video of localVideos) {
      // Find the user in Supabase to get their ID (matching by email)
      const localUser = localUsers.find(u => u.id === video.user_id);
      if (!localUser) continue;

      const { data: cloudUser } = await supabase.from('users').select('id').eq('email', localUser.email).single();
      if (!cloudUser) continue;

      const { error } = await supabase.from('videos').upsert({
        user_id: cloudUser.id,
        video_url: video.videoUrl,
        caption: video.caption,
        audio_name: video.audioName,
        category: video.category,
        views_count: video.views,
        thumbnail_url: video.thumbnail
      });

      if (error) results.errors.push(`Video ${video.id}: ${error.message}`);
      else results.videos++;
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ error: 'Erreur lors de la synchronisation: ' + err.message });
  }
});

module.exports = router;
