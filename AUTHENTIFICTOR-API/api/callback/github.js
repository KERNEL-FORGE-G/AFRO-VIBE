import axios from 'axios';
import admin from 'firebase-admin';
import serviceAccount from '../../serviceAccountKey.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export default async function handler(req, res) {
  const { code, state } = req.query;

  console.log('[GitHub OAuth] Callback received with code:', code ? '***' : 'MISSING');

  if (!code || !state) {
    console.error('[GitHub OAuth] Missing code or state');
    return res.status(400).json({ error: 'Missing code or state' });
  }

  try {
    // Parse state parameter
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch (e) {
      console.error('[GitHub OAuth] Failed to parse state:', e.message);
      return res.status(400).json({ error: 'Invalid state parameter' });
    }

    const { app, redirect_uri } = stateData;

    if (!redirect_uri) {
      console.error('[GitHub OAuth] Missing redirect_uri in state');
      return res.status(400).json({ error: 'Missing redirect_uri' });
    }

    console.log('[GitHub OAuth] Exchanging code for token...');

    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri:
          process.env.NODE_ENV === 'production'
            ? 'https://authentificator.vercel.app/api/callback/github'
            : 'http://localhost:5173/api/callback/github',
      },
      { headers: { Accept: 'application/json' } }
    );

    const { access_token, error: tokenError } = tokenResponse.data;

    if (tokenError || !access_token) {
      console.error('[GitHub OAuth] Token exchange failed:', tokenError || 'No token');
      return res.status(400).json({ error: 'Failed to exchange code for token' });
    }

    console.log('[GitHub OAuth] Token received, fetching user profile...');

    // Get user profile
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const profile = userResponse.data;
    console.log('[GitHub OAuth] Profile fetched:', profile.login);

    // GitHub doesn't always provide a public email
    let email = profile.email;
    if (!email) {
      console.log('[GitHub OAuth] No public email, fetching from emails endpoint...');
      const emailsResponse = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const primaryEmail = emailsResponse.data.find(
        (e) => e.primary && e.verified
      );
      email = primaryEmail
        ? primaryEmail.email
        : emailsResponse.data[0]?.email;
    }

    if (!email) {
      console.error('[GitHub OAuth] No email found for user');
      return res.status(400).json({ error: 'Unable to retrieve email from GitHub' });
    }

    console.log('[GitHub OAuth] Email obtained:', email);

    // Generate Firebase Custom Token
    const customToken = await admin.auth().createCustomToken(`github_${profile.id}`);

    console.log('[GitHub OAuth] Custom token generated, redirecting...');

    // Redirect back to client app with token
    const finalRedirectUrl = new URL(redirect_uri);
    finalRedirectUrl.searchParams.append('status', 'success');
    finalRedirectUrl.searchParams.append('customToken', customToken);
    finalRedirectUrl.searchParams.append('provider', 'github');

    res.redirect(finalRedirectUrl.toString());

  } catch (error) {
    console.error('[GitHub OAuth] Error:', error.message);
    if (error.response) {
      console.error('[GitHub OAuth] Response:', error.response.status, error.response.data);
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
      console.error('[GitHub OAuth] Failed to redirect on error:', e.message);
      return res.status(500).json({
        error: 'Authentication failed',
        details: error.message,
      });
    }
  }
}
