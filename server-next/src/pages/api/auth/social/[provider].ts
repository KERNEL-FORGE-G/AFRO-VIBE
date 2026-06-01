import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { provider } = req.query;

  if (typeof provider !== 'string') {
    return res.status(400).json({ error: 'Provider must be a string' });
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as any,
    options: {
      // Le Deep Link qui ramènera l'utilisateur vers l'app mobile
      redirectTo: 'afrovibe://auth/callback' 
    }
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  // Redirige l'utilisateur vers la page de connexion du fournisseur (Google/GitHub)
  res.redirect(data.url);
}
