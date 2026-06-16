export default async function handler(req, res) {
  const { app, redirect_uri } = req.query;

  if (!app || !redirect_uri) {
    return res.status(400).json({ error: 'Missing app or redirect_uri' });
  }

  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const callbackUrl = process.env.NODE_ENV === 'production' 
    ? 'https://authentificator.vercel.app/api/callback/github'
    : 'http://localhost:5173/api/callback/github';
  
  const state = Buffer.from(JSON.stringify({ app, redirect_uri })).toString('base64');

  const authUrl = `https://github.com/login/oauth/authorize?` + 
    `client_id=${githubClientId}&` +
    `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
    `scope=user:email&` +
    `state=${state}`;

  res.redirect(authUrl);
}
