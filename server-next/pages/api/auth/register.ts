import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_afrovibe_key_2026';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, username } = req.body;

  try {
    // 1. Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${email},username.eq.${username}`)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // 3. Save to Supabase
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        username,
        email,
        password_hash: hash,
        full_name: username,
        avatar_url: 'logo.jpg',
        is_verified: false
      }])
      .select()
      .single();
    
    if (error) throw error;

    const finalUser = {
      uid: newUser.id,
      email: newUser.email,
      username: newUser.username,
      fullName: newUser.full_name,
      avatar: newUser.avatar_url,
      isVerified: newUser.is_verified
    };

    const token = jwt.sign({ uid: finalUser.uid }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user: finalUser, token });

  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
}
