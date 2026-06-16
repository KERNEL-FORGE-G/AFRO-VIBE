import url from 'url';

export default async function handler(req, res) {
  const { app, redirect_uri, email } = req.query;

  if (!app || !redirect_uri) {
    return res.status(400).json({ error: 'Missing app or redirect_uri' });
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const callbackUrl = process.env.NODE_ENV === 'production' 
    ? 'https://authentificator.vercel.app/api/callback/google'
    : 'http://localhost:5173/api/callback/google';
  
  // Encode state to pass app and redirect_uri
  const state = Buffer.from(JSON.stringify({ app, redirect_uri })).toString('base64');

  let authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
    `client_id=${googleClientId}&` +
    `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
    `response_type=code&` +
    `scope=openid%20email%20profile&` +
    `state=${state}`;

  // If email is provided, use it as login_hint for Google
  if (email) {
    authUrl += `&login_hint=${encodeURIComponent(email)}`;
  }

  res.redirect(authUrl);
}
