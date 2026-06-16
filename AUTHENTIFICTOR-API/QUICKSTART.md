# Quick Start Guide - Authentificator

## 30 secondes pour commencer

### 1️⃣ Configurez les variables d'environnement

```bash
# Créez .env.local
cp .env.example .env.local
```

Ajoutez vos credentials OAuth:
```env
GITHUB_CLIENT_ID=your_id
GITHUB_CLIENT_SECRET=your_secret
JWT_SECRET=your_super_secret_key_32_chars_min
```

### 2️⃣ Installez et lancez

```bash
npm install
npm run dev
```

Visitez: **http://localhost:5173**

### 3️⃣ Testez

1. Cliquez sur "Continuer avec GitHub"
2. Authentifiez-vous
3. Vous êtes dans l'admin! 🎉

---

## 🏗️ Architecture en 60 secondes

```
User clicks "Login with GitHub"
         ↓
    /api/auth/github (génère state)
         ↓
github.com/login/oauth/authorize
         ↓
User autorise
         ↓
/callback?code=xxx&state=yyy
         ↓
/api/callback/github (échange code → token)
         ↓
Redirect: /callback?token=JWT
         ↓
AuthContext décode JWT
         ↓
localStorage.authToken = JWT
         ↓
useAuth() hook retourne user & token
         ↓
ProtectedRoute vérifie token
         ↓
AdminDashboard accessible ✅
```

---

## 📋 Composants créés

### Pages
- `Login.jsx` - Page de connexion OAuth
- `Callback.jsx` - Gère le retour du provider
- `AdminDashboard.jsx` - Dashboard principal

### Composants
- `AdminHeader.jsx` - En-tête + profil utilisateur
- `AdminSidebar.jsx` - Navigation
- `DashboardOverview.jsx` - Stats et aperçu
- `UsersManager.jsx` - Gestion utilisateurs
- `LoginLogs.jsx` - Historique connexions
- `Settings.jsx` - Paramètres

### Auth
- `AuthContext.jsx` - Gestion de l'authentification
- `ProtectedRoute.jsx` - Protection des routes

---

## 🔒 Vérifier l'authentification

### Dans le navigateur (DevTools)
```javascript
// Console tab:
localStorage.getItem('authToken')  // Doit retourner un JWT
localStorage.getItem('authUser')   // Doit retourner {name, email, ...}

// Application tab (Storage):
localStorage → authToken
localStorage → authUser
```

### Routes
```
GET /                    → Page login (public)
GET /callback?token=JWT  → Callback OAuth (public)
GET /admin              → Dashboard (protégé)
```

---

## ❌ Dépannage rapide

| Problème | Solution |
|----------|----------|
| Page vide | Vérifiez la console (F12) |
| "Missing code or state" | Variables env mal configurées |
| Erreur 401 sur /admin | Token expiré, reconnectez-vous |
| Infinite loop sur login | JWT_SECRET vide/invalide |

---

## 🚀 Déployer en 1 minute

### Vercel
```bash
git add .
git commit -m "Add authentication"
git push
```

Dans Vercel UI:
1. Settings → Environment Variables
2. Ajoutez: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `JWT_SECRET`
3. Redeploy

### Sur votre serveur
```bash
npm run build
npm start
```

**IMPORTANT:** Mettez à jour `redirect_uri` dans GitHub OAuth settings!
```
Production: https://yourdomain.com/callback
Local: http://localhost:5173/callback
```

---

## 📚 Fichiers clés

```
src/
├── App.jsx                          ← Routes + AuthProvider
├── context/
│   └── AuthContext.jsx              ← Gestion auth
├── components/
│   ├── ProtectedRoute.jsx           ← Vérification token
│   ├── AdminHeader.jsx              ← Profil + logout
│   └── ... (autres composants)
└── pages/
    ├── Login.jsx                    ← OAuth login
    ├── Callback.jsx                 ← OAuth callback
    └── AdminDashboard.jsx           ← Dashboard principal

api/
├── auth/
│   ├── github.js                    ← Génère state OAuth
│   └── google.js
└── callback/
    ├── github.js (MODIFIÉ)          ← Échange code → JWT
    └── google.js
```

---

## 🎯 Cas d'usage

### Démarrer une session
```javascript
// Login.jsx
const handleGitHubLogin = () => {
  const redirectUri = encodeURIComponent(`${window.location.origin}/callback`);
  window.location.href = `/api/auth/github?app=MyApp&redirect_uri=${redirectUri}`;
};
```

### Utiliser l'authentification
```javascript
// Tout composant
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, token, logout } = useAuth();
  
  return (
    <div>
      Connecté en tant que: {user?.name}
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
}
```

### Protéger une route
```javascript
// App.jsx
<Route path="/admin" element={
  <ProtectedRoute>
    <AdminDashboard />
  </ProtectedRoute>
} />
```

---

## ✨ Fonctionnalités incluses

✅ OAuth2 GitHub  
✅ OAuth2 Google  
✅ JWT Authentication  
✅ Protected Routes  
✅ User Profile  
✅ Logout  
✅ Admin Dashboard  
✅ Users Manager  
✅ Login Logs  
✅ Settings  
✅ Modern UI  
✅ Responsive Design  

---

## 🔗 Ressources

- [GitHub OAuth Docs](https://docs.github.com/en/apps/oauth-apps)
- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)
- [JWT Intro](https://jwt.io/introduction)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)

---

## ⚡ Performance Tips

1. Utilisez `useCallback` pour les event handlers
2. Mémorisez les composants avec `React.memo`
3. Split code avec `React.lazy` si needed
4. Vérifiez les Web Vitals: DevTools → Lighthouse

---

## 🐛 Debug Mode

Activez les logs:
```javascript
// Dans AuthContext.jsx
console.log('[AuthContext] User:', user);
console.log('[AuthContext] Token:', token);
console.log('[AuthContext] Is authenticated:', isAuthenticated);

// Dans Callback.jsx
console.log('[Callback] Token received:', callbackToken);
console.log('[Callback] Redirecting to admin...');
```

---

**💡 Pro tip:** Utilisez `localStorage.clear()` pour "déconnecter" rapidement pendant le développement.

**Happy coding! 🚀**
