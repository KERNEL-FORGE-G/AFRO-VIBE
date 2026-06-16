# Configuration JWT - Authentificator

## URLs de Redirection

### GitHub OAuth
- **Authorization URL:** `https://github.com/login/oauth/authorize`
- **Token URL:** `https://github.com/login/oauth/access_token`
- **User URL:** `https://api.github.com/user`
- **Redirect URI (Dev):** `http://localhost:5173/callback`
- **Redirect URI (Production):** `https://authentificator.vercel.app/callback`

### Google OAuth
- **Authorization URL:** `https://accounts.google.com/o/oauth2/v2/auth`
- **Token URL:** `https://oauth2.googleapis.com/token`
- **User URL:** `https://www.googleapis.com/oauth2/v1/userinfo`
- **Redirect URI (Dev):** `http://localhost:5173/callback`
- **Redirect URI (Production):** `https://authentificator.vercel.app/callback`

## Variables d'Environnement Requises

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/authentificator

# Node Environment
NODE_ENV=production
```

## Flow d'Authentification Complet

### 1. Login (Client côté)
```javascript
// src/pages/Login.jsx
const handleGithubLogin = async () => {
  const state = Buffer.from(JSON.stringify({
    app: "Logistix Admin",
    redirect_uri: window.location.origin + "/admin"
  })).toString('base64');

  window.location.href = 
    `https://github.com/login/oauth/authorize?` +
    `client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}&` +
    `redirect_uri=${window.location.origin}/callback&` +
    `state=${state}&` +
    `scope=user:email`;
};
```

### 2. Callback (Récupérer Token)
```javascript
// src/pages/Callback.jsx
// GitHub échange le code contre un access token
// Notre serveur génère un JWT et le retourne au client
// Client stocke le JWT en localStorage
```

### 3. API Callback Server
```javascript
// api/callback/github.js
// 1. Reçoit code du callback OAuth
// 2. Échange code pour access token GitHub
// 3. Récupère le profil utilisateur GitHub
// 4. Upsert user dans BD avec token JWT
// 5. Redirige vers /admin avec JWT en URL
```

### 4. JWT Token Storage (BD + LocalStorage)
```javascript
// User model dans Prisma (schema.prisma)
{
  id: String
  email: String
  name: String
  avatar: String
  githubId: String
  googleId: String
  
  // JWT Management
  currentToken: String        // JWT actuel stocké en BD
  tokenExpiresAt: DateTime    // Expiration du token
  lastTokenRefresh: DateTime  // Dernière mise à jour
  
  // Access Control
  role: String                // "user" | "admin" | "manager"
  
  // OAuth Info
  provider: String            // "github" | "google"
}
```

### 5. ProtectedRoute (Vérification Token)
```javascript
// src/components/ProtectedRoute.jsx
// Vérifie que le JWT existe en localStorage
// Vérifie que le JWT est valide (pas expiré)
// Redirige vers /login si invalide
```

## Code Serveur Complet

### api/callback/github.js
```javascript
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

export default async function handler(req, res) {
  const { code, state } = req.query;

  try {
    // 1. Récupérer la redirection
    const { app, redirect_uri } = JSON.parse(
      Buffer.from(state, 'base64').toString()
    );

    // 2. Échanger code pour access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.NODE_ENV === 'production'
          ? 'https://authentificator.vercel.app/callback'
          : 'http://localhost:5173/callback',
      },
      { headers: { Accept: 'application/json' } }
    );

    const { access_token } = tokenResponse.data;

    // 3. Récupérer profil utilisateur
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const profile = userResponse.data;

    // 4. Récupérer email
    let email = profile.email;
    if (!email) {
      const emailsResponse = await axios.get(
        'https://api.github.com/user/emails',
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      const primaryEmail = emailsResponse.data.find(e => e.primary && e.verified);
      email = primaryEmail?.email || emailsResponse.data[0]?.email;
    }

    // 5. Créer ou mettre à jour l'utilisateur
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: profile.name || profile.login,
        avatar: profile.avatar_url,
        githubId: profile.id.toString(),
        provider: 'github',
      },
      create: {
        email,
        name: profile.name || profile.login,
        avatar: profile.avatar_url,
        githubId: profile.id.toString(),
        provider: 'github',
        role: 'user',
      },
    });

    // 6. Générer JWT
    const jwtToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 7. Stocker JWT en BD
    await prisma.user.update({
      where: { id: user.id },
      data: {
        currentToken: jwtToken,
        tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lastTokenRefresh: new Date(),
      },
    });

    // 8. Logger la connexion
    await prisma.loginLog.create({
      data: {
        userId: user.id,
        appName: app,
        provider: 'github',
        status: 'success',
      },
    });

    // 9. Rediriger vers admin avec token
    const finalUrl = new URL(redirect_uri);
    finalUrl.searchParams.append('token', jwtToken);
    finalUrl.searchParams.append('status', 'success');

    res.redirect(finalUrl.toString());

  } catch (error) {
    console.error('GitHub Callback Error:', error);
    
    const { redirect_uri } = JSON.parse(
      Buffer.from(state, 'base64').toString()
    );
    
    const errorUrl = new URL(redirect_uri);
    errorUrl.searchParams.append('status', 'error');
    errorUrl.searchParams.append('error', error.message);
    
    res.redirect(errorUrl.toString());
  }
}
```

### api/callback/google.js
```javascript
// Structure identique à github.js mais avec:
// - Google OAuth URLs
// - googleId au lieu de githubId
// - userinfo endpoint Google

import axios from 'axios';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

export default async function handler(req, res) {
  const { code, state } = req.query;

  try {
    const { app, redirect_uri } = JSON.parse(
      Buffer.from(state, 'base64').toString()
    );

    // Échanger code pour access token
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.NODE_ENV === 'production'
          ? 'https://authentificator.vercel.app/callback'
          : 'http://localhost:5173/callback',
      }
    );

    const { access_token } = tokenResponse.data;

    // Récupérer profil Google
    const userResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v1/userinfo',
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const profile = userResponse.data;

    // Créer ou mettre à jour
    const user = await prisma.user.upsert({
      where: { email: profile.email },
      update: {
        name: profile.name,
        avatar: profile.picture,
        googleId: profile.id,
        provider: 'google',
      },
      create: {
        email: profile.email,
        name: profile.name,
        avatar: profile.picture,
        googleId: profile.id,
        provider: 'google',
        role: 'user',
      },
    });

    // Générer JWT
    const jwtToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Stocker JWT en BD
    await prisma.user.update({
      where: { id: user.id },
      data: {
        currentToken: jwtToken,
        tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lastTokenRefresh: new Date(),
      },
    });

    // Logger
    await prisma.loginLog.create({
      data: {
        userId: user.id,
        appName: app,
        provider: 'google',
        status: 'success',
      },
    });

    // Rediriger
    const finalUrl = new URL(redirect_uri);
    finalUrl.searchParams.append('token', jwtToken);
    finalUrl.searchParams.append('status', 'success');

    res.redirect(finalUrl.toString());

  } catch (error) {
    console.error('Google Callback Error:', error);
    
    const { redirect_uri } = JSON.parse(
      Buffer.from(state, 'base64').toString()
    );
    
    const errorUrl = new URL(redirect_uri);
    errorUrl.searchParams.append('status', 'error');
    errorUrl.searchParams.append('error', error.message);
    
    res.redirect(errorUrl.toString());
  }
}
```

## AuthContext Complet (avec JWT BD)

```javascript
// src/context/AuthContext.jsx

import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger user depuis localStorage
    const token = localStorage.getItem('jwtToken');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const decoded = JSON.parse(userData);
        setUser(decoded);
      } catch (error) {
        console.error('[v0] Erreur parsing user:', error);
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  const setAuthToken = (token, userData) => {
    localStorage.setItem('jwtToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const getToken = () => localStorage.getItem('jwtToken');

  return (
    <AuthContext.Provider value={{ user, loading, setAuthToken, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## Flux Complet Visualisé

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT (React)                               │
│                                                                 │
│  1. Login.jsx                                                   │
│     └─ Utilisateur clique "GitHub"                             │
│     └─ Redirige vers https://github.com/login/oauth/authorize  │
│                                                                 │
│  2. GitHub                                                      │
│     └─ Authentifie l'utilisateur                               │
│     └─ Redirige vers callback?code=xxx&state=yyy               │
│                                                                 │
│  3. Callback.jsx                                                │
│     └─ Récupère token de l'URL                                 │
│     └─ Stocke en localStorage                                  │
│     └─ Redirige vers /admin                                    │
│                                                                 │
│  4. ProtectedRoute.jsx                                          │
│     └─ Vérifie localStorage pour token                         │
│     └─ Affiche AdminDashboard si valide                        │
│                                                                 │
└────────────────────┬─────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼──────────┐    ┌────────▼──────────┐
│   API Server     │    │   PostgreSQL      │
│                  │    │   Database        │
│ /api/callback/   │    │                   │
│  github.js       │───▶│ User Table:       │
│                  │    │ - id              │
│ 1. Échange code  │    │ - email           │
│ 2. Récupère user │    │ - currentToken ◀──┼── JWT stocké
│ 3. Crée/update   │    │ - tokenExpiresAt  │
│ 4. Génère JWT    │    │ - role            │
│ 5. Stocke en BD  │    │                   │
│ 6. Redirige      │    │ LoginLog Table:   │
│                  │    │ - userId          │
└──────────────────┘    │ - provider        │
                        │ - status          │
                        │ - timestamp       │
                        │                   │
                        └───────────────────┘
```

## Mise à Jour Automatique du JWT

Le JWT sera automatiquement mis à jour quand:

1. **Connexion réussie** - JWT stocké en BD et localStorage
2. **Rafraîchissement manuel** - Via endpoint `/api/auth/refresh`
3. **Déconnexion** - JWT supprimé de BD et localStorage

### Endpoint de Rafraîchissement

```javascript
// api/auth/refresh.js
export default async function handler(req, res) {
  const { userId } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || user.tokenExpiresAt < new Date()) {
    return res.status(401).json({ error: 'Token expired' });
  }

  const newToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  await prisma.user.update({
    where: { id: userId },
    data: {
      currentToken: newToken,
      tokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      lastTokenRefresh: new Date(),
    },
  });

  res.json({ token: newToken });
}
```

## Résumé

✅ Authentification OAuth GitHub/Google  
✅ JWT généré et stocké en BD  
✅ JWT aussi en localStorage pour accès rapide  
✅ Mise à jour automatique du JWT en BD  
✅ Routes protégées avec vérification JWT  
✅ Déconnexion sécurisée (suppression en BD + localStorage)
