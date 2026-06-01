import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          users (*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formatted = data.map(v => ({
        id: v.id,
        videoUrl: v.video_url,
        provenance: 'Cloud',
        caption: v.caption,
        likes: v.likes_count,
        commentsCount: v.comments_count,
        shares: v.shares_count,
        audioName: v.audio_name,
        category: v.category,
        views: v.views_count,
        thumbnail: v.thumbnail_url,
        user: {
          uid: v.users.id,
          username: v.users.username,
          fullName: v.users.full_name,
          avatar: v.users.avatar_url,
          isVerified: v.users.is_verified
        }
      }));

      res.status(200).json(formatted);
    } catch (err: any) {
      console.error('Fetch videos error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
