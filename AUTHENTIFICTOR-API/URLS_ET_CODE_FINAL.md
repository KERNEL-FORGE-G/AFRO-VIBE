# URLs et Code JavaScript Final - Authentificator

## 🌐 URLs EXACTES

### **DÉVELOPPEMENT (localhost)**
```
Login:     http://localhost:5173
Callback:  http://localhost:5173/callback
Admin:     http://localhost:5173/admin
API:       http://localhost:5000/api
```

### **PRODUCTION (Vercel)**
```
Login:     https://authentificator.vercel.app
Callback:  https://authentificator.vercel.app/callback
Admin:     https://authentificator.vercel.app/admin
API:       https://authentificator.vercel.app/api
```

---

## 🔐 CONFIGURATION OAUTH

### **GitHub OAuth**

**1. Créer l'app GitHub:**
- Aller à: https://github.com/settings/developers
- Cliquer: "New OAuth App"
- Remplir:
  - Application name: `Authentificator`
  - Homepage URL: `https://authentificator.vercel.app`
  - Authorization callback URL: **`https://authentificator.vercel.app/api/callback/github`** ✅

**2. Copier les credentials:**
- Client ID → `GITHUB_CLIENT_ID`
- Client Secret → `GITHUB_CLIENT_SECRET`

### **Google OAuth**

**1. Créer le projet:**
- Aller à: https://console.cloud.google.com
- Créer nouveau projet: `Authentificator`

**2. Configurer OAuth:**
- Aller à: Credentials → Create Credentials → OAuth 2.0 Client ID
- Type: Web application
- Authorized redirect URIs:
  ```
  http://localhost:5173/callback
  https://authentificator.vercel.app/api/callback/google
  ```

**3. Copier les credentials:**
- Client ID → `GOOGLE_CLIENT_ID`
- Client Secret → `GOOGLE_CLIENT_SECRET`

---

## 🔑 JWT SECRET

Générer une clé sécurisée:
```bash
openssl rand -base64 32
```
Copier le résultat → `JWT_SECRET`

---

## 📝 VARIABLES D'ENVIRONNEMENT

### **.env.local (Développement)**
```bash
# OAuth GitHub
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# OAuth Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT
JWT_SECRET=your_jwt_secret_from_openssl

# URLs
VITE_API_URL=http://localhost:5000
VITE_APP_URL=http://localhost:5173
```

### **Environment Variables (Vercel Settings)**
```
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
JWT_SECRET
VITE_API_URL=https://authentificator.vercel.app/api
VITE_APP_URL=https://authentificator.vercel.app
```

---

## 🎯 CODE JAVASCRIPT POUR OAUTH

### **src/pages/Login.jsx**
```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Mail } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

  // URL de base - change automatiquement selon l'environnement
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

  const handleGithubLogin = () => {
    const redirectUri = `${APP_URL}/callback`;
    const state = Buffer.from(
      JSON.stringify({
        app: 'Authentificator',
        redirect_uri: redirectUri,
      })
    ).toString('base64');

    window.location.href =
      `https://github.com/login/oauth/authorize?` +
      `client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent('https://github.com/login/oauth/authorize')}` +
      `&scope=user:email` +
      `&state=${state}`;
  };

  const handleGoogleLogin = () => {
    const redirectUri = `${APP_URL}/callback`;
    const state = Buffer.from(
      JSON.stringify({
        app: 'Authentificator',
        redirect_uri: redirectUri,
      })
    ).toString('base64');

    window.location.href =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=openid email profile` +
      `&state=${state}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">
          Authentificator
        </h1>
        <p className="text-center text-slate-600 mb-8">
          Connexion sécurisée avec OAuth
        </p>

        <div className="space-y-4">
          <button
            onClick={handleGithubLogin}
            className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            <Github size={20} />
            Se connecter avec GitHub
          </button>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            <Mail size={20} />
            Se connecter avec Google
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center mt-6">
          En vous connectant, vous acceptez nos conditions d'utilisation
        </p>
      </div>
    </div>
  );
};

export default Login;
```

### **src/pages/Callback.jsx**
```jsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Callback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const status = searchParams.get('status');
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      console.log('[v0] Callback received:', { code, status, token, error });

      if (error) {
        console.error('[v0] Auth error:', error);
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      if (token && status === 'success') {
        // Stocker le token JWT
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_token_time', new Date().getTime().toString());
        
        // Mettre à jour le contexte
        login(token);

        // Rediriger vers admin
        navigate('/admin');
      } else {
        // Rediriger vers login
        setTimeout(() => navigate('/'), 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white">Traitement de votre connexion...</p>
      </div>
    </div>
  );
};

export default Callback;
```

### **src/context/AuthContext.jsx**
```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer le token du localStorage au démarrage
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      setToken(savedToken);
      // Décoder le JWT pour extraire les infos utilisateur
      try {
        const payload = JSON.parse(atob(savedToken.split('.')[1]));
        setUser(payload);
      } catch (err) {
        console.error('[v0] Error decoding token:', err);
        localStorage.removeItem('auth_token');
      }
    }
    setLoading(false);
  }, []);

  const login = (jwtToken) => {
    localStorage.setItem('auth_token', jwtToken);
    setToken(jwtToken);
    try {
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      setUser(payload);
    } catch (err) {
      console.error('[v0] Error decoding token:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token_time');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = () => {
    if (!token) return false;
    
    // Vérifier l'expiration
    const tokenTime = localStorage.getItem('auth_token_time');
    if (!tokenTime) return false;
    
    const tokenAgeMs = new Date().getTime() - parseInt(tokenTime);
    const tokenAgeHours = tokenAgeMs / (1000 * 60 * 60);
    
    // Token valide 7 jours
    return tokenAgeHours < 24 * 7;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated }}>
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

### **src/components/ProtectedRoute.jsx**
```jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return children;
};
```

### **api/callback/github.js (Backend)**
```javascript
import axios from 'axios';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or state' });
  }

  try {
    const { app, redirect_uri } = JSON.parse(
      Buffer.from(state, 'base64').toString()
    );

    // Échanger le code contre un token d'accès
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

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      throw new Error('No access token received from GitHub');
    }

    // Récupérer le profil utilisateur
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const profile = userResponse.data;

    // Récupérer l'email
    let email = profile.email;
    if (!email) {
      const emailsResponse = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const primaryEmail = emailsResponse.data.find(e => e.primary && e.verified);
      email = primaryEmail ? primaryEmail.email : emailsResponse.data[0]?.email;
    }

    if (!email) {
      throw new Error('Unable to get email from GitHub profile');
    }

    // Créer JWT
    const token = jwt.sign(
      {
        id: profile.id,
        email: email,
        name: profile.name || profile.login,
        avatar: profile.avatar_url,
        provider: 'github',
        app,
      },
      process.env.JWT_SECRET || 'test-secret-key',
      { expiresIn: '7d' }
    );

    // Rediriger avec le token
    const finalUrl = new URL(redirect_uri);
    finalUrl.searchParams.append('status', 'success');
    finalUrl.searchParams.append('token', token);
    finalUrl.searchParams.append('app', app);

    res.redirect(finalUrl.toString());
  } catch (error) {
    console.error('[v0] GitHub Callback Error:', error.message);
    try {
      const { redirect_uri, app } = JSON.parse(
        Buffer.from(state, 'base64').toString()
      );
      const finalUrl = new URL(redirect_uri);
      finalUrl.searchParams.append('status', 'failure');
      finalUrl.searchParams.append('error', error.message);
      return res.redirect(finalUrl.toString());
    } catch (e) {
      res.status(500).json({ error: 'Authentication failed' });
    }
  }
}
```

---

## 📊 JWT STORAGE EN BASE DE DONNÉES

### **Prisma Schema (prisma/schema.prisma)**
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  avatar    String?
  role      String   @default("user")
  
  // JWT Storage
  currentToken    String?           // Token JWT actuel
  tokenExpiresAt  DateTime?         // Expiration du token
  lastTokenRefresh DateTime?        // Dernière mise à jour
  
  // OAuth
  githubId   String?
  googleId   String?
  provider   String?
  
  logins    LoginLog[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model LoginLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  provider  String   // "github", "google"
  status    String   // "success", "failed"
  ipAddress String?
  timestamp DateTime @default(now())
}
```

### **API Route pour sauvegarder le token (api/auth/save-token.js)**
```javascript
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, email } = req.body;

    if (!token || !email) {
      return res.status(400).json({ error: 'Missing token or email' });
    }

    // Décoder le token pour obtenir l'expiration
    const decoded = jwt.decode(token);
    const expiresAt = new Date(decoded.exp * 1000);

    // Sauvegarder le token en BD
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        currentToken: token,
        tokenExpiresAt: expiresAt,
        lastTokenRefresh: new Date(),
      },
      create: {
        email,
        name: decoded.name,
        avatar: decoded.avatar,
        provider: decoded.provider,
        githubId: decoded.provider === 'github' ? decoded.id : null,
        googleId: decoded.provider === 'google' ? decoded.id : null,
        currentToken: token,
        tokenExpiresAt: expiresAt,
        lastTokenRefresh: new Date(),
      },
    });

    // Log la connexion
    await prisma.loginLog.create({
      data: {
        userId: user.id,
        provider: decoded.provider,
        status: 'success',
      },
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('[v0] Save token error:', error);
    res.status(500).json({ error: 'Failed to save token' });
  }
}
```

---

## ✅ CHECKLIST DÉPLOIEMENT

- [ ] GitHub OAuth credentials configurés
- [ ] Google OAuth credentials configurés
- [ ] JWT_SECRET généré et sauvé
- [ ] .env.local configuré (dev)
- [ ] Variables d'environnement Vercel configurés
- [ ] Base de données migrée (`npx prisma migrate deploy`)
- [ ] Build local teste (`npm run build`)
- [ ] Login teste avec GitHub
- [ ] Login teste avec Google
- [ ] Admin dashboard accesible après connexion
- [ ] Token stocké en localStorage
- [ ] Token stocké en BD (check users table)
- [ ] Logout fonctionne
- [ ] Protected routes fonctionnent
- [ ] Deploy sur Vercel

---

## 🔧 COMMANDES UTILES

```bash
# Développement
npm run dev

# Build
npm run build

# Base de données
npx prisma migrate dev --name init
npx prisma studio  # GUI pour la BD

# Test
npm run test

# Lint
npm run lint
```

---

## 📞 SUPPORT

Si vous avez des questions sur les URLs ou le code JS, consultez:
1. **JWT_CONFIG.md** - Architecture détaillée
2. **LOGISTIX_DESIGN_GUIDE.md** - Composants et design
3. **FINAL_SUMMARY.md** - Vue d'ensemble
