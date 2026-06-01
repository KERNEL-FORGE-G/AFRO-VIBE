# 🎵 AFRO VIBE - Application de Partage de Danse Afro

Afro Vibe est une application mobile de partage de vidéos courte durée, centrée sur la culture et la danse africaine. Elle utilise une architecture hybride flexible permettant de basculer entre différents modes de stockage et de backend.

## 🚀 Fonctionnalités Clés
- **Flux Vidéo (Feed) :** Lecture fluide de vidéos haute définition avec support du plein écran.
- **Stockage Hybride :** Support de **Cloudinary** (optimisation CDN), **Supabase** (Cloud PostgreSQL) et **Local Backend** (SQLite).
- **Architecture MVC + Redux :** Gestion d'état robuste via Redux Toolkit pour une application fluide et prévisible.
- **Authentification Sociale :** Connexion et inscription rapide via **Google** et **GitHub**.
- **Mode En Ligne / Local :** Basculez entre le cloud (Supabase + Vercel) et le serveur local en un clic depuis les paramètres.
- **Interaction Sociale :** Système de likes, commentaires, partages et gestion de profil.

---

## 🛠 Détails de l'Implémentation Technique

### 🧠 Gestion d'État avec Redux Toolkit
L'application utilise **Redux Toolkit** pour centraliser les données et assurer une synchronisation parfaite entre les écrans.
- **`authSlice.js`** : Gère l'utilisateur actuel, les jetons de session et le mode de fonctionnement (Online/Local).
- **`videoSlice.js`** : Gère la liste globale des vidéos, le chargement et les erreurs.
- **Pourquoi Redux ?** Cela permet de mettre à jour le profil ou les compteurs de likes instantanément sur tous les écrans sans rechargement fastidieux.

### 🔌 Architecture de l'API (Dual Mode)
Le service `apiService.js` agit comme un contrôleur intelligent :
- **Mode Local** : Communique avec un serveur Express Node.js local qui utilise une base **SQLite**.
- **Mode Online** : Communique directement avec le client **Supabase** pour l'authentification et les données, tout en utilisant un serveur proxy sur **Vercel** pour les logiques métier étendues.
- **Détection Automatique** : L'app détecte le mode choisi par l'utilisateur et ajuste ses URLs d'API dynamiquement.

### ☁️ Infrastructure Cloud (Vercel & Supabase)
- **Supabase** : Utilisé comme backend principal en ligne (Base de données PostgreSQL, Auth, Storage).
- **Vercel** : Héberge le dossier `supabase/server.js` sous forme de fonctions serverless, agissant comme une passerelle sécurisée pour l'application.
- **Auto-Déploiement** : Chaque `git push` sur la branche `main` déclenche une mise à jour automatique du serveur sur Vercel.

---

## 🔐 Configuration de l'Authentification Sociale

L'authentification a été implémentée pour offrir une expérience utilisateur sans friction ("One-tap sign-in").

### 1. Google Auth (Android)
- **Côté Google Cloud** : Un identifiant **Android** est nécessaire pour le téléphone, et un identifiant **Web** est nécessaire pour que Supabase valide la connexion.
- **SHA-1** : L'empreinte numérique du certificat de signature lie l'application mobile à votre projet Google.
- **Liaison** : Le `webClientId` configuré dans `src/config/env.js` est le pont qui permet à l'app de demander une autorisation à Google au nom de Supabase.

### 2. GitHub Auth
- **OAuth App** : Configurée via les paramètres développeur de GitHub.
- **Redirect URI** : Pointe vers l'URL de callback spécifique de votre instance Supabase (`/auth/v1/callback`).

---

## 📂 Structure du Projet

```text
/
├── App.tsx             # Point d'entrée avec Provider Redux
├── src/
│   ├── redux/          # Store et Slices (Logic de l'app)
│   ├── services/       # apiService (Online/Local logic)
│   ├── screens/        # UI avec intégration Social Auth
│   └── navigation/     # AppNavigator lié à l'état Redux
├── supabase/           # Backend Online (Vercel)
│   ├── server.js       # Proxy Serverless
│   └── package.json    # Dépendances cloud
├── backend/            # Backend Local (Node.js + SQLite)
├── supabase.sql        # Schéma DB pour Supabase
└── vercel.json         # Config de déploiement cloud
```

---

## 📝 Guide d'Installation Rapide

1. **Cloner et Installer** : `npm install`
2. **Configurer l'Env** : Remplissez `src/config/env.js` avec vos clés Supabase et Google.
3. **Initialiser la DB** : Exécutez le contenu de `supabase.sql` dans l'éditeur SQL de Supabase.
4. **Déployer le Backend** : `vercel --prod` depuis la racine.
5. **Lancer l'App** : `npm run android` ou `npm run ios`.

---

*Développé avec passion pour la culture et la danse Afro.* 🌍🎵🚀
