import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { provider } = req.query;

  console.log(`OAuth attempt for provider: ${provider}`);

  if (typeof provider !== 'string') {
    return res.status(400).json({ error: 'Provider must be a string' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: {
        redirectTo: 'afrovibe://auth/callback' 
      }
    });

    if (error) {
      console.error('Supabase OAuth Error:', error);
      return res.status(400).json({ error: error.message });
    }

    if (!data.url) {
      console.error('No URL returned from Supabase');
      return res.status(500).json({ error: 'Failed to generate auth URL' });
    }

    console.log(`Redirecting to: ${data.url}`);
    res.redirect(data.url);
  } catch (err: any) {
    console.error('Unexpected OAuth Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
