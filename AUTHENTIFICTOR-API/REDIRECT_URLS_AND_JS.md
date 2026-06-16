# URLs de Redirection et Code JavaScript - Authentificator

## 📋 Résumé Rapide

### URLs Principales
| Type | Développement | Production |
|------|---------------|------------|
| **Login** | `http://localhost:5173` | `https://authentificator.vercel.app` |
| **Admin** | `http://localhost:5173/admin` | `https://authentificator.vercel.app/admin` |
| **Callback** | `http://localhost:5173/callback` | `https://authentificator.vercel.app/callback` |

### OAuth Redirect URIs (à configurer dans GitHub & Google)
- **Dev:** `http://localhost:5173/callback`
- **Production:** `https://authentificator.vercel.app/callback`

---

## 🔧 Configuration OAuth - Étapes Complètes

### 1. GitHub OAuth Configuration

**Aller à:** https://github.com/settings/developers

**New OAuth App:**
- Application name: `Authentificator`
- Homepage URL: `https://authentificator.vercel.app`
- Authorization callback URL: `https://authentificator.vercel.app/callback`

**Puis pour le développement local:**
- Dupliquer l'app et modifier callback vers: `http://localhost:5173/callback`

**Copier:**
- `Client ID` → `GITHUB_CLIENT_ID`
- `Client Secret` → `GITHUB_CLIENT_SECRET`

### 2. Google OAuth Configuration

**Aller à:** https://console.cloud.google.com

**New Project:**
- Name: `Authentificator`

**Enable APIs:**
- Google+ API

**Create OAuth 2.0 Credentials:**
- Type: Web application
- Authorized redirect URIs:
  - `http://localhost:5173/callback`
  - `https://authentificator.vercel.app/callback`

**Copier:**
- `Client ID` → `GOOGLE_CLIENT_ID`
- `Client Secret` → `GOOGLE_CLIENT_SECRET`

---

## 🔑 Variables d'Environnement Requises

### .env.local (Développement)
```env
# GitHub OAuth
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT Secret (générer avec: openssl rand -base64 32)
JWT_SECRET=your_jwt_secret_here_min_32_chars

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/authentificator

# Server Config
NODE_ENV=development
API_URL=http://localhost:5000
```

### Variables d'Environnement Vercel
```env
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
JWT_SECRET=xxx
DATABASE_URL=postgresql://...
NODE_ENV=production
```

---

## 🎯 Flux d'Authentification Complet

### Étape 1: Page de Login
```javascript
// src/pages/Login.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Mail } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  const handleGithubLogin = () => {
    const state = Buffer.from(JSON.stringify({
      app: "Logistix Admin",
      redirect_uri: window.location.origin + "/admin"
    })).toString('base64');

    const params = new URLSearchParams({
      client_id: process.env.REACT_APP_GITHUB_CLIENT_ID,
      redirect_uri: `${window.location.origin}/callback`,
      state: state,
      scope: 'user:email',
    });

    window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
  };

  const handleGoogleLogin = () => {
    const state = Buffer.from(JSON.stringify({
      app: "Logistix Admin",
      redirect_uri: window.location.origin + "/admin"
    })).toString('base64');

    const params = new URLSearchParams({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      redirect_uri: `${window.location.origin}/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      state: state,
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
      <div className="text-center max-w-md w-full px-6">
        {/* Logo */}
        <div className="w-16 h-16 mx-auto mb-6 bg-indigo-600 rounded-2xl flex items-center justify-center">
          <span className="text-3xl font-bold text-white">⚔️</span>
        </div>

        <h1 className="text-4xl font-bold text-white mb-2">Authentificator</h1>
        <p className="text-gray-400 mb-8">Système d'authentification OAuth2 sécurisé</p>

        <div className="space-y-3">
          {/* GitHub Button */}
          <button
            onClick={handleGithubLogin}
            className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            <Github size={20} />
            Continuer avec GitHub
          </button>

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-lg transition-colors font-medium"
          >
            <Mail size={20} />
            Continuer avec Google
          </button>
        </div>

        {/* Demo Info */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-300 mb-2"><strong>Mode démo</strong></p>
          <p className="text-xs text-gray-400">
            Utilisez vos identifiants GitHub ou Google pour accéder au tableau de bord d'administration. Les données de test sont réinitialisées régulièrement.
          </p>
        </div>
      </div>
    </div>
  );
}
```

### Étape 2: Page Callback
```javascript
// src/pages/Callback.jsx

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Callback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const status = searchParams.get('status');
    const error = searchParams.get('error');

    if (status === 'success' && token) {
      try {
        // Décoder le JWT pour extraire les infos utilisateur
        const decoded = JSON.parse(atob(token.split('.')[1]));
        
        // Stocker en localStorage et context
        setAuthToken(token, decoded);
        
        // Rediriger vers admin
        navigate('/admin', { replace: true });
      } catch (err) {
        console.error('[v0] Erreur décodage JWT:', err);
        navigate('/?error=invalid_token', { replace: true });
      }
    } else if (status === 'error' || error) {
      console.error('[v0] Auth error:', error);
      navigate(`/?error=${error || 'auth_failed'}`, { replace: true });
    } else {
      navigate('/?error=no_token', { replace: true });
    }
  }, [searchParams, navigate, setAuthToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-white rounded-full mx-auto mb-4"></div>
        <p className="text-white">Authentification en cours...</p>
      </div>
    </div>
  );
}
```

### Étape 3: ProtectedRoute
```javascript
// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-white rounded-full mx-auto mb-4"></div>
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
```

### Étape 4: AuthContext
```javascript
// src/context/AuthContext.jsx

import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger depuis localStorage
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

### Étape 5: Serveur - Callback GitHub
```javascript
// api/callback/github.js

import axios from 'axios';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

export default async function handler(req, res) {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or state' });
  }

  try {
    // Extraire état
    const { app, redirect_uri } = JSON.parse(Buffer.from(state, 'base64').toString());

    // Échanger code pour token
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

    if (!access_token) {
      throw new Error('No access token received');
    }

    // Récupérer profil
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const profile = userResponse.data;

    // Récupérer email
    let email = profile.email;
    if (!email) {
      const emailsResponse = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      const primaryEmail = emailsResponse.data.find(e => e.primary && e.verified);
      email = primaryEmail?.email || emailsResponse.data[0]?.email;
    }

    // Upsert user
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

    // Générer JWT
    const jwtToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );

    // Stocker en BD
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
        provider: 'github',
        status: 'success',
      },
    });

    // Rediriger
    const finalUrl = new URL(redirect_uri);
    finalUrl.searchParams.append('token', jwtToken);
    finalUrl.searchParams.append('status', 'success');

    res.redirect(finalUrl.toString());

  } catch (error) {
    console.error('GitHub Callback Error:', error);
    
    try {
      const { redirect_uri } = JSON.parse(Buffer.from(state, 'base64').toString());
      const finalUrl = new URL(redirect_uri);
      finalUrl.searchParams.append('status', 'error');
      finalUrl.searchParams.append('error', error.message);
      res.redirect(finalUrl.toString());
    } catch (e) {
      res.status(500).json({ error: 'Authentication failed' });
    }
  }
}
```

---

## 📱 Design Admin Dashboard

Le dashboard suit le design **Logistix** avec:

- **Sidebar Navigation** - Menu latéral avec icônes et collapse
- **Stats Cards** - Cartes colorées avec gradients (8 couleurs)
- **Vehicle Table** - Tableau des véhicules avec status badges
- **Responsive Layout** - Mobile-first, fonctionne partout
- **Top Bar** - Barre supérieure avec recherche et profil
- **Bottom Navigation** - Onglets de navigation principales

### Structure des fichiers Admin
```
src/
├── components/
│   ├── AdminLayout.jsx        # Layout principal Logistix
│   ├── StatsCard.jsx          # Cartes statistiques colorées
│   ├── VehicleTable.jsx       # Tableau des véhicules
│   └── ...
├── pages/
│   ├── AdminDashboard.jsx     # Dashboard principal
│   └── ...
```

---

## ✅ Checklist de Déploiement

### Avant le déploiement
- [ ] Configurer GitHub OAuth avec URLs production
- [ ] Configurer Google OAuth avec URLs production
- [ ] Générer JWT_SECRET sécurisé: `openssl rand -base64 32`
- [ ] Mettre à jour variables d'environnement Vercel
- [ ] Tester le callback en local avec les credentials
- [ ] Vérifier la base de données Prisma

### Pendant le déploiement
- [ ] Vérifier que la build réussit: `npm run build`
- [ ] Vérifier les logs serveur pour erreurs
- [ ] Tester le login sur https://authentificator.vercel.app
- [ ] Vérifier que le callback redirige correctement

### Après le déploiement
- [ ] Confirmer les deux OAuth flows (GitHub + Google)
- [ ] Vérifier que les tokens sont stockés en BD
- [ ] Tester le logout
- [ ] Vérifier les logs LoginLog en BD

---

## 🐛 Dépannage

### Le callback redirige vers la mauvaise URL
**Solution:** Vérifier que `redirect_uri` dans l'état matches le domaine production

### JWT non valide
**Solution:** Vérifier que `JWT_SECRET` est identique en dev et prod

### OAuth 404 sur callback
**Solution:** S'assurer que le callback URI est configuré dans GitHub/Google settings

### Tokens pas stockés en BD
**Solution:** Vérifier que Prisma client est généré: `npx prisma generate`

---

## 📚 Références
- JWT.io - https://jwt.io
- GitHub OAuth - https://docs.github.com/en/developers/apps/building-oauth-apps
- Google OAuth - https://developers.google.com/identity/protocols/oauth2
