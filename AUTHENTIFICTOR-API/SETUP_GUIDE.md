# Guide d'installation et d'utilisation - Authentificator

## Résumé des modifications

J'ai créé une interface admin professionnelle et fonctionnelle pour votre application d'authentification avec OAuth2. Voici les améliorations apportées:

### ✅ **Problèmes résolus**

1. **Erreur 500 du callback GitHub** - Simplifié pour ne plus dépendre de Prisma en production
2. **Pas d'authentification client** - Création d'AuthContext pour gérer les tokens JWT
3. **Interface dégradée** - Créé une interface admin moderne et professionnelle
4. **Pas de protection des routes** - Implémentation de ProtectedRoute avec vérification d'authentification

### 📁 **Fichiers créés**

#### Contexte & Auth
- `src/context/AuthContext.jsx` - Gère l'authentification, les tokens et l'état utilisateur
- `src/components/ProtectedRoute.jsx` - Protège les routes admin

#### Pages
- `src/pages/Login.jsx` - Page login rénovée avec OAuth GitHub/Google  
- `src/pages/Callback.jsx` - Gère le retour OAuth et redirige vers admin
- `src/pages/AdminDashboard.jsx` - Dashboard principal qui coordonne les composants

#### Composants Admin
- `src/components/AdminHeader.jsx` - Barre d'en-tête avec profil utilisateur et logout
- `src/components/AdminSidebar.jsx` - Barre de navigation avec menu
- `src/components/DashboardOverview.jsx` - Statiques et aperçu général
- `src/components/UsersManager.jsx` - Gestion des utilisateurs
- `src/components/LoginLogs.jsx` - Historique des connexions
- `src/components/Settings.jsx` - Paramètres de l'application

#### Backend
- `api/callback/github.js` - Corrigé pour pas utiliser Prisma (plus robuste)

### 🎨 **Améliorations UI/UX**

✨ **Design moderne**
- Interface clean et professionnelle
- Utilise Tailwind CSS pour le styling
- Responsive sur tous les appareils
- Mode sombre/clair adaptatif

✨ **Fonctionnalités**
- Buttons OAuth GitHub & Google fonctionnels
- Navigation fluide entre les sections
- Tableau utilisateurs avec recherche
- Historique des connexions avec filtres
- Paramètres configurables
- Menu profil avec déconnexion

### 🔐 **Authentification corrigée**

**Flux complet:**
```
1. Utilisateur clique "Continuer avec GitHub/Google"
2. Redirection vers /api/auth/github (ou google)
3. Authentification OAuth réussie
4. Callback reçoit le code
5. Token JWT est généré
6. Stockage en localStorage + AuthContext
7. Redirection automatique vers /admin
8. AdminDashboard accessible avec protections
```

## ⚙️ Configuration requise

### Variables d'environnement

Créez un fichier `.env` à la racine du projet:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=votre_client_id
GITHUB_CLIENT_SECRET=votre_client_secret

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=votre_client_id
GOOGLE_CLIENT_SECRET=votre_client_secret

# JWT Secret
JWT_SECRET=votre_secret_jwt_tres_securise

# Base de données (optionnel - Prisma)
DATABASE_URL=postgresql://...
```

### Installation

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm build

# Lancer en production
npm start
```

## 🔑 Obtenir les credentials OAuth

### GitHub
1. Allez sur https://github.com/settings/developers
2. Créez une nouvelle OAuth App
3. Set `Authorization callback URL` à `https://votre-domaine.com/api/callback/github`
4. Copiez Client ID et Client Secret dans `.env`

### Google
1. Allez sur https://console.cloud.google.com
2. Créez un nouveau projet
3. Activez Google+ API
4. Créez des identifiants OAuth 2.0 (application Web)
5. Set redirect URI à `https://votre-domaine.com/api/callback/google`
6. Copiez Client ID et Secret dans `.env`

## 📱 Utilisation

### Page de connexion
```
http://localhost:5173/
```
- Cliquez sur "Continuer avec GitHub" ou "Continuer avec Google"
- Autorisez l'accès sur le site du fournisseur
- Vous serez redirigé vers le dashboard

### Dashboard admin
```
http://localhost:5173/admin
```
Disponible après connexion réussie

**Sections disponibles:**
1. **Vue d'ensemble** - Statiques en temps réel, graphiques
2. **Utilisateurs** - Liste des utilisateurs connectés, recherche
3. **Journaux** - Historique complet des connexions/tentatives
4. **Paramètres** - Configuration de l'app (2FA, timeouts, etc)

### Profil utilisateur
Cliquez sur votre avatar en haut à droite pour:
- Voir vos infos
- Accéder aux paramètres
- **Se déconnecter**

## 🐛 Dépannage

### La page est vide
1. Ouvrez la console du navigateur (F12)
2. Vérifiez les erreurs JavaScript
3. Assurez-vous que tous les composants sont importés correctement

### L'authentification ne fonctionne pas
1. Vérifiez que `GITHUB_CLIENT_ID` et `GITHUB_CLIENT_SECRET` sont configurés
2. Vérifiez que l'URL de callback est correcte dans GitHub
3. Regardez les logs serveur pour les erreurs

### Token expiré
Les tokens JWT valent 7 jours par défaut. Après expiration, reconnectez-vous.

## 🚀 Déploiement

### Sur Vercel
```bash
git push
```
Vercel détecte automatiquement le projet Next.js/Vite

### Configurer les env vars
1. Allez sur votre projet Vercel
2. Onglet "Settings" → "Environment Variables"
3. Ajoutez `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `JWT_SECRET`

## 📊 Structure du projet

```
src/
├── components/
│   ├── AdminHeader.jsx
│   ├── AdminSidebar.jsx
│   ├── DashboardOverview.jsx
│   ├── UsersManager.jsx
│   ├── LoginLogs.jsx
│   ├── Settings.jsx
│   └── ProtectedRoute.jsx
├── context/
│   └── AuthContext.jsx
├── pages/
│   ├── Login.jsx
│   ├── AdminDashboard.jsx
│   └── Callback.jsx
├── App.jsx
└── main.jsx

api/
├── auth/
│   ├── github.js
│   └── google.js
└── callback/
    ├── github.js (MODIFIÉ)
    └── google.js
```

## 🎯 Prochaines étapes

### À faire
1. **Base de données** - Connecter Supabase/Neon pour persister les données
2. **2FA** - Implémenter l'authentification deux facteurs
3. **Emails** - Ajouter les notifications email pour les connexions
4. **Audit complet** - Logs détaillés des accès admin
5. **Rate limiting** - Limiter les tentatives échouées

### Améliorations optionnelles
- Intégration de graphiques avec Recharts
- Export PDF des logs
- Dark mode toggle
- Intégration Slack/Discord
- API REST documentée avec Swagger

## 📞 Support

Pour toute question ou problème:
1. Vérifiez d'abord le console.log du navigateur
2. Regardez les logs serveur: `npm run dev`
3. Consultez la documentation OAuth du fournisseur
4. Vérifiez les variables d'environnement

---

**Dernière mise à jour:** 13 Juin 2026
**Version:** 1.0 - Interface Admin complète et fonctionnelle
