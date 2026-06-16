# OAuth Flow Diagram - Authentificator

## 1️⃣ FLUX COMPLET GitHub OAuth

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  UTILISATEUR CLIC "Se connecter avec GitHub"               │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Login.jsx envoie vers GitHub OAuth:                        │
│  https://github.com/login/oauth/authorize?                 │
│    client_id=GITHUB_CLIENT_ID                              │
│    redirect_uri=https://authentificator.vercel.app/callback│
│    scope=user:email                                         │
│    state=base64(app + redirect_uri)                         │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  GITHUB demande à l'utilisateur de s'identifier            │
│  Utilisateur accepte les permissions                       │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  GitHub redirige vers Callback.jsx avec:                    │
│  /callback?code=AUTH_CODE&state=BASE64_STATE               │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Callback.jsx extrait le code                              │
│  Lance api/callback/github.js avec code + state            │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  api/callback/github.js:                                   │
│  1. Vérifie state                                          │
│  2. Échange code contre access_token auprès de GitHub      │
│  3. Récupère profil utilisateur                            │
│  4. Récupère email                                         │
│  5. Crée JWT avec info utilisateur                         │
│  6. Sauvegarde JWT en BD (User.currentToken)               │
│  7. Redirige /callback?token=JWT&status=success            │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Callback.jsx reçoit le token                              │
│  localStorage.setItem('auth_token', token)                 │
│  AuthContext.login(token)                                  │
│  Redirige vers /admin                                      │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ProtectedRoute vérifie le token                           │
│  Token valide ✓                                            │
│  Affiche AdminDashboard                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ FLUX COMPLET Google OAuth

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  UTILISATEUR CLIC "Se connecter avec Google"               │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Login.jsx envoie vers Google OAuth:                        │
│  https://accounts.google.com/o/oauth2/v2/auth?             │
│    client_id=GOOGLE_CLIENT_ID                              │
│    redirect_uri=https://authentificator.vercel.app/callback│
│    scope=openid email profile                              │
│    response_type=code                                      │
│    state=base64(app + redirect_uri)                        │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  GOOGLE demande à l'utilisateur de s'identifier            │
│  Utilisateur accepte les permissions                       │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Google redirige vers Callback.jsx avec:                    │
│  /callback?code=AUTH_CODE&state=BASE64_STATE               │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Callback.jsx extrait le code                              │
│  Lance api/callback/google.js avec code + state            │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  api/callback/google.js:                                   │
│  1. Vérifie state                                          │
│  2. Échange code contre access_token auprès de Google      │
│  3. Récupère profil utilisateur                            │
│  4. Récupère email                                         │
│  5. Crée JWT avec info utilisateur                         │
│  6. Sauvegarde JWT en BD (User.currentToken)               │
│  7. Redirige /callback?token=JWT&status=success            │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Callback.jsx reçoit le token                              │
│  localStorage.setItem('auth_token', token)                 │
│  AuthContext.login(token)                                  │
│  Redirige vers /admin                                      │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ProtectedRoute vérifie le token                           │
│  Token valide ✓                                            │
│  Affiche AdminDashboard                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3️⃣ JWT STORAGE EN BASE DE DONNÉES

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  api/callback/github.js ou google.js                       │
│  Crée JWT token                                            │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Appelle api/auth/save-token.js                            │
│  Envoie: { token, email }                                  │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  save-token.js:                                            │
│  1. Décode le JWT                                          │
│  2. Extrait l'expiration (exp)                             │
│  3. UPSERT User en BD:                                     │
│     - currentToken = JWT                                   │
│     - tokenExpiresAt = exp date                            │
│     - lastTokenRefresh = now()                             │
│     - provider = github/google                             │
│     - githubId/googleId = user.id                          │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  BASE DE DONNÉES (User table):                             │
│                                                             │
│  id           | email         | currentToken  | tokenExpiresAt  │
│  ──────────────────────────────────────────────────────────│
│  user_123     | user@mail.com | eyJ0eXAi... | 2025-06-20      │
│  user_456     | admin@mail.com| eyJ0eXAi... | 2025-06-22      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4️⃣ VÉRIFICATION DU TOKEN À CHAQUE REQUÊTE

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Utilisateur navigue vers /admin                           │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ProtectedRoute.jsx:                                       │
│  1. Appelle useAuth().isAuthenticated()                    │
│  2. Vérifie si token existe en localStorage                │
│  3. Décalcule l'âge du token                               │
│  4. Vérifie si < 7 jours                                   │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┴────────────────┬──────────────────┐
         │                              │                  │
    Token valide                  Token expiré        Pas de token
         │                              │                  │
         ▼                              ▼                  ▼
    Affiche AdminDashboard      Logout + Redirige   Redirige vers
                                  vers Login           Login
```

---

## 5️⃣ LOGOUT ET EFFACEMENT DU TOKEN

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Utilisateur clique "Logout" dans AdminHeader              │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  AdminHeader.jsx:                                          │
│  const { logout } = useAuth()                              │
│  onClick={logout}                                          │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  AuthContext.logout():                                     │
│  1. localStorage.removeItem('auth_token')                  │
│  2. localStorage.removeItem('auth_token_time')             │
│  3. Efface User.currentToken en BD (optionnel)             │
│  4. setToken(null)                                         │
│  5. setUser(null)                                          │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ProtectedRoute détecte pas de token                       │
│  Redirige vers /                                           │
│  Affiche Login page                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6️⃣ REFRESH AUTOMATIQUE DU TOKEN (Optionnel)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  useEffect dans AdminDashboard                             │
│  Vérifie si token proche de l'expiration                   │
│  (ex: 30 min avant expiration)                             │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Appelle api/auth/refresh-token.js                         │
│  Envoie: { oldToken }                                      │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  refresh-token.js:                                         │
│  1. Vérifie oldToken                                       │
│  2. Récupère User en BD par oldToken                       │
│  3. Crée nouveau JWT                                       │
│  4. Update User.currentToken + tokenExpiresAt              │
│  5. Retourne newToken                                      │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Client met à jour:                                        │
│  localStorage.setItem('auth_token', newToken)              │
│  AuthContext.setToken(newToken)                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 RÉSUMÉ DES ENDPOINTS

| Endpoint | Méthode | Description | Requête | Réponse |
|----------|---------|-------------|---------|---------|
| `/callback/github` | GET | Callback GitHub OAuth | code, state | Redirection + JWT |
| `/callback/google` | GET | Callback Google OAuth | code, state | Redirection + JWT |
| `/auth/save-token` | POST | Sauvegarder JWT en BD | { token, email } | { success, user } |
| `/auth/refresh-token` | POST | Rafraîchir le token | { oldToken } | { newToken } |
| `/auth/verify-token` | POST | Vérifier le token | { token } | { valid, user } |

---

## ✅ À RETENIR

1. **Dev**: Les URLs doivent pointer sur `http://localhost:5173`
2. **Prod**: Les URLs doivent pointer sur `https://authentificator.vercel.app`
3. **JWT**: Créé côté serveur, stocké localStorage + BD
4. **Expiration**: 7 jours par défaut
5. **Storage**: localStorage pour session client, BD pour persistance serveur
6. **Logout**: Efface localStorage + BD
