import axios from 'axios';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const { code, state } = req.query;

  console.log('[Google OAuth] Callback received with code:', code ? '***' : 'MISSING');

  if (!code || !state) {
    console.error('[Google OAuth] Missing code or state');
    return res.status(400).json({ error: 'Missing code or state' });
  }

  try {
    // Parse state parameter
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch (e) {
      console.error('[Google OAuth] Failed to parse state:', e.message);
      return res.status(400).json({ error: 'Invalid state parameter' });
    }

    const { app, redirect_uri } = stateData;

    if (!redirect_uri) {
      console.error('[Google OAuth] Missing redirect_uri in state');
      return res.status(400).json({ error: 'Missing redirect_uri' });
    }

    console.log('[Google OAuth] Exchanging code for token...');

    // Exchange code for tokens
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri:
          process.env.NODE_ENV === 'production'
            ? 'https://authentificator.vercel.app/api/callback/google'
            : 'http://localhost:5173/api/callback/google',
        grant_type: 'authorization_code',
      }
    );

    const { access_token, error: tokenError } = tokenResponse.data;

    if (tokenError || !access_token) {
      console.error('[Google OAuth] Token exchange failed:', tokenError || 'No token');
      return res.status(400).json({ error: 'Failed to exchange code for token' });
    }

    console.log('[Google OAuth] Token received, fetching user info...');

    // Get user info
    const userInfoResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const profile = userInfoResponse.data;
    console.log('[Google OAuth] Profile fetched:', profile.email);

    if (!profile.email) {
      console.error('[Google OAuth] No email in profile');
      return res.status(400).json({ error: 'Unable to retrieve email from Google' });
    }

    console.log('[Google OAuth] Email obtained:', profile.email);

    // Create JWT token (no database required)
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
    const token = jwt.sign(
      {
        id: `google_${profile.sub}`,
        email: profile.email,
        name: profile.name,
        avatar: profile.picture,
        provider: 'google',
        googleId: profile.sub,
        app: app || 'Authentificator',
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    console.log('[Google OAuth] JWT token generated, redirecting...');

    // Redirect back to client app with token
    const finalRedirectUrl = new URL(redirect_uri);
    finalRedirectUrl.searchParams.append('status', 'success');
    finalRedirectUrl.searchParams.append('token', token);
    finalRedirectUrl.searchParams.append('provider', 'google');

    res.redirect(finalRedirectUrl.toString());

  } catch (error) {
    console.error('[Google OAuth] Error:', error.message);
    if (error.response) {
      console.error('[Google OAuth] Response:', error.response.status, error.response.data);
    }

    // Redirect to callback page with error
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      const { redirect_uri } = stateData;
      const errorUrl = new URL(redirect_uri);
      errorUrl.searchParams.append('status', 'failure');
      errorUrl.searchParams.append('error', error.message);
      return res.redirect(errorUrl.toString());
    } catch (e) {
      console.error('[Google OAuth] Failed to redirect on error:', e.message);
      return res.status(500).json({
        error: 'Authentication failed',
        details: error.message,
      });
    }
  }
}
