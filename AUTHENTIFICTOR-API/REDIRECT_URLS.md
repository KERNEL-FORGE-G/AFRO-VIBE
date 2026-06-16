# Redirect URLs Configuration

Ce fichier contient toutes les URLs de redirection necessaires pour configurer Google Cloud Console et GitHub OAuth Apps.

## URLs de Base

- **Production**: `https://authentifictor.vercel.app`
- **Preview**: `https://authentificator-git-main-archlord12345s-projects.vercel.app`
- **Local Development**: `http://localhost:5173`

---

## Google Cloud Console (OAuth 2.0)

### Authorized JavaScript origins
```
https://authentifictor.vercel.app
https://authentificator-git-main-archlord12345s-projects.vercel.app
http://localhost:5173
```

### Authorized redirect URIs
```
https://authentifictor.vercel.app/api/callback/google
https://authentificator-git-main-archlord12345s-projects.vercel.app/api/callback/google
http://localhost:5173/api/callback/google
```

---

## GitHub OAuth App

### Homepage URL
```
https://authentifictor.vercel.app
```

### Authorization callback URL
```
https://authentifictor.vercel.app/api/callback/github
```

### Pour les previews et development, creez des OAuth Apps separees:

**Preview OAuth App:**
- Homepage URL: `https://authentificator-git-main-archlord12345s-projects.vercel.app`
- Callback URL: `https://authentificator-git-main-archlord12345s-projects.vercel.app/api/callback/github`

**Development OAuth App:**
- Homepage URL: `http://localhost:5173`
- Callback URL: `http://localhost:5173/api/callback/github`

---

## Structure des Endpoints d'Authentification

### Initier une connexion Google
```
GET /api/auth/google?app=NOM_APP&redirect_uri=URL_CALLBACK
```

### Initier une connexion GitHub
```
GET /api/auth/github?app=NOM_APP&redirect_uri=URL_CALLBACK
```

### Parametres
- `app` (requis): Nom de votre application
- `redirect_uri` (requis): URL de retour apres authentification
- `email` (optionnel, Google only): Pre-remplit l'email

---

## URLs de Callback (a configurer dans votre application cliente)

Votre application doit avoir une route pour recevoir le token JWT apres authentification:

```
https://votre-app.com/callback?status=success&app=NOM_APP&token=JWT_TOKEN
```

---

## Checklist Configuration

- [ ] Google Cloud Console: Creer un projet OAuth 2.0
- [ ] Google Cloud Console: Ajouter les Authorized JavaScript origins
- [ ] Google Cloud Console: Ajouter les Authorized redirect URIs
- [ ] GitHub: Creer une OAuth App pour production
- [ ] GitHub: Creer une OAuth App pour preview (optionnel)
- [ ] GitHub: Creer une OAuth App pour development (optionnel)
- [ ] Configurer les variables d'environnement dans Vercel

---

## Variables d'Environnement Requises

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# JWT
JWT_SECRET=your_jwt_secret

# Database (Neon/PostgreSQL)
DATABASE_URL=your_database_url
```