# OAuth Callback URLs - Configuration Complète

## 🔗 URLs de Redirection Exactes

### GitHub OAuth

**Développement (localhost):**
```
http://localhost:5173/api/callback/github
```

**Production (Vercel):**
```
https://authentificator.vercel.app/api/callback/github
```

### Google OAuth

**Développement (localhost):**
```
http://localhost:5173/api/callback/google
```

**Production (Vercel):**
```
https://authentificator.vercel.app/api/callback/google
```

---

## ⚙️ Configuration GitHub OAuth

### Étape 1: Créer une Application GitHub

1. Aller à https://github.com/settings/developers
2. Cliquer sur "New OAuth App"
3. Remplir le formulaire:
   - **Application name**: `Authentificator`
   - **Homepage URL**: `http://localhost:5173` (dev) ou `https://authentificator.vercel.app` (prod)
   - **Authorization callback URL**: `http://localhost:5173/api/callback/github` (dev)

### Étape 2: Obtenir les Credentials

Après création, vous verrez:
- **Client ID**: Copier cette valeur
- **Client Secret**: Cliquer sur "Generate a new client secret" et copier

### Étape 3: Configurer les Variables d'Environnement

Ajouter à `.env`:
```bash
GITHUB_CLIENT_ID="your_client_id"
GITHUB_CLIENT_SECRET="your_client_secret"
```

### Étape 4: Pour Production (Vercel)

Aller sur GitHub Settings → Développer une nouvelle application pour production:
- **Homepage URL**: `https://authentificator.vercel.app`
- **Authorization callback URL**: `https://authentificator.vercel.app/api/callback/github`

Ajouter ces variables dans Vercel Dashboard:
```
GITHUB_CLIENT_ID_PROD="prod_client_id"
GITHUB_CLIENT_SECRET_PROD="prod_client_secret"
```

---

## ⚙️ Configuration Google OAuth

### Étape 1: Créer un Projet Google Cloud

1. Aller à https://console.cloud.google.com
2. Créer un nouveau projet:
   - **Nom du projet**: `Authentificator`
   - Cliquer sur "Create"

### Étape 2: Activer l'API Google+

1. Aller à "APIs & Services" → "Library"
2. Chercher "Google+ API"
3. Cliquer dessus et appuyer sur "Enable"

### Étape 3: Créer les Identifiants OAuth

1. Aller à "APIs & Services" → "Credentials"
2. Cliquer sur "Create Credentials" → "OAuth client ID"
3. Si demandé, configurer d'abord le "OAuth consent screen":
   - **User Type**: External
   - **App name**: Authentificator
   - **User support email**: votre email
   - **Developer contact**: votre email
   - Continuer

4. Créer le client OAuth:
   - **Application type**: Web application
   - **Name**: `Authentificator Web Client`
   - **Authorized redirect URIs**: 
     - `http://localhost:5173/api/callback/google` (dev)
     - `https://authentificator.vercel.app/api/callback/google` (prod)

### Étape 4: Obtenir les Credentials

Après création:
- **Client ID**: Copier cette valeur
- **Client Secret**: Copier cette valeur

### Étape 5: Configurer les Variables d'Environnement

Ajouter à `.env`:
```bash
GOOGLE_CLIENT_ID="your_client_id"
GOOGLE_CLIENT_SECRET="your_client_secret"
```

### Étape 6: Pour Production (Vercel)

Ajouter à la même application Google Cloud:
- Dans "Credentials" → Éditer le client OAuth
- Ajouter l'URI: `https://authentificator.vercel.app/api/callback/google`

Ajouter à Vercel Dashboard:
```
GOOGLE_CLIENT_ID="same_as_above"
GOOGLE_CLIENT_SECRET="same_as_above"
```

---

## 🔐 JWT Secret

Générer une clé secrète sécurisée (minimum 32 caractères):

```bash
# Option 1: OpenSSL (Linux/macOS)
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: En ligne
https://www.random.org/strings/ (très grand, caractères alphanumériques)
```

Ajouter à `.env`:
```bash
JWT_SECRET="votre_clé_secrète_de_32_caractères_minimum"
```

---

## 📝 Fichier .env Complet

```bash
# ==============================================
# DATABASE
# ==============================================
DATABASE_URL="postgresql://user:password@host:5432/authentificator"

# ==============================================
# GITHUB OAUTH
# ==============================================
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"

# ==============================================
# GOOGLE OAUTH
# ==============================================
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# ==============================================
# JWT
# ==============================================
JWT_SECRET="your_jwt_secret_32_chars_or_more"

# ==============================================
# ENVIRONMENT
# ==============================================
NODE_ENV="development"
```

---

## 🧪 Tester OAuth Localement

1. Lancer le serveur:
   ```bash
   npm run dev
   ```

2. Aller à http://localhost:5173

3. Cliquer sur "Login with GitHub" ou "Login with Google"

4. Vous devriez être redirigé vers le provider OAuth

5. Après l'authentification, vous devriez être redirigé vers:
   ```
   http://localhost:5173/callback?status=success&token=...&provider=github
   ```

6. Vérifier la console du navigateur - le token JWT devrait être sauvé

---

## ✅ Checklist de Configuration

### GitHub
- [ ] Aller à https://github.com/settings/developers
- [ ] Créer "New OAuth App"
- [ ] Copier Client ID
- [ ] Générer et copier Client Secret
- [ ] Ajouter GITHUB_CLIENT_ID à .env
- [ ] Ajouter GITHUB_CLIENT_SECRET à .env
- [ ] Pour prod: créer une 2e app pour Vercel
- [ ] Ajouter variables dans Vercel Dashboard

### Google
- [ ] Aller à https://console.cloud.google.com
- [ ] Créer un nouveau projet
- [ ] Activer Google+ API
- [ ] Créer OAuth client ID
- [ ] Configurer consent screen
- [ ] Copier Client ID
- [ ] Copier Client Secret
- [ ] Ajouter GOOGLE_CLIENT_ID à .env
- [ ] Ajouter GOOGLE_CLIENT_SECRET à .env
- [ ] Les mêmes credentials fonctionnent pour dev et prod

### General
- [ ] Générer JWT_SECRET
- [ ] Ajouter JWT_SECRET à .env
- [ ] DATABASE_URL configurée
- [ ] npm install
- [ ] npm run dev fonctionne
- [ ] Tester login avec GitHub
- [ ] Tester login avec Google
- [ ] Vérifier que le token est sauvé en localStorage

---

## 🚀 Déployer en Production

1. Configurer les variables d'environnement dans Vercel Dashboard:
   - GITHUB_CLIENT_ID (prod)
   - GITHUB_CLIENT_SECRET (prod)
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - JWT_SECRET
   - DATABASE_URL (Neon ou Supabase)

2. Pousser les changements:
   ```bash
   git push origin main
   ```

3. Vercel va automatiquement builder et déployer

4. Tester sur https://authentificator.vercel.app

---

## 🐛 Dépannage OAuth

### Erreur: "redirect_uri mismatch"
```
→ L'URL de redirection dans le provider OAuth ne correspond pas
→ Vérifiez que les URLs exactes sont configurées dans GitHub/Google
→ Exactement: http://localhost:5173/api/callback/github (dev)
→ Exactement: https://authentificator.vercel.app/api/callback/github (prod)
```

### Erreur: "Invalid client ID"
```
→ GITHUB_CLIENT_ID ou GOOGLE_CLIENT_ID incorrect
→ Vérifiez que les variables d'environnement sont correctement définies
→ Vérifiez qu'il n'y a pas d'espaces supplémentaires
→ Redémarrez: npm run dev
```

### Erreur: "Invalid client secret"
```
→ Le secret est incorrect ou a été régénéré dans le provider
→ Régénérez un nouveau secret et mettez à jour .env
→ Redémarrez: npm run dev
```

### Erreur 500 sur le callback
```
→ Vérifiez les logs: npm run dev
→ Vérifiez les variables d'environnement
→ DATABASE_URL peut être absent (mais les nouveaux callbacks fonctionnent sans BD)
→ Vérifiez que JWT_SECRET est configuré
```

### Token JWT n'est pas sauvé
```
→ Vérifiez que le statut dans l'URL est 'success'
→ Vérifiez la console du navigateur pour les erreurs
→ Vérifiez que localStorage n'est pas désactivé
→ Vérifiez que Callback.jsx traite correctement les paramètres d'URL
```

---

## 📚 Ressources

- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps)
- [Google OAuth Documentation](https://developers.google.com/identity/oauth2/web)
- [JWT Introduction](https://jwt.io)
- [Neon PostgreSQL](https://neon.tech)
- [Supabase PostgreSQL](https://supabase.com)
