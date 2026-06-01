# 🎵 AFRO VIBE - Application de Partage de Danse Afro

Afro Vibe est une application mobile de partage de vidéos courte durée, centrée sur la culture et la danse africaine. Elle utilise une architecture hybride flexible permettant de basculer entre différents modes de stockage et de backend.

## 🚀 Fonctionnalités Clés
- **Flux Vidéo (Feed) :** Lecture fluide de vidéos haute définition.
- **Stockage Hybride :** Support de **Cloudinary** (optimisation CDN), **Supabase** (Cloud PostgreSQL) et **Local Backend** (SQLite).
- **Architecture MVC + Redux :** Gestion d'état robuste via Redux Toolkit pour une application fluide et prévisible.
- **Authentification Sociale :** Connexion rapide via **Google** et **GitHub**.
- **Mode En Ligne / Local :** Basculez entre le cloud (Supabase + Vercel) et le serveur local en un clic.

---

## 📂 Structure du Projet

### 📱 Frontend (React Native)
- **`src/redux/`** : Store centralisé et Slices (auth, videos) pour la gestion d'état.
- **`src/services/`** : 
  - `apiService.js` : Communication avec le backend (Local/Online).
  - `supabaseClient.js` : Configuration du client Supabase.
- **`src/screens/`** : Interfaces utilisateur avec boutons de connexion sociale intégrés.

### ⚙️ Backend & Supabase Proxy
- **`backend/`** : Serveur local Node.js + SQLite.
- **`supabase/`** : Serveur proxy pour Supabase, prêt pour le déploiement Cloud.
- **`vercel.json`** : Configuration pour l'hébergement du backend sur Vercel.
- **`supabase.sql`** : Schéma complet pour initialiser votre base de données Supabase.

---

## 🔐 Configuration de l'Authentification Sociale

### 1. Google Auth (Android)
Pour que la connexion Google fonctionne à 100% :

1.  **Google Cloud Console** :
    *   Créez un projet et un **ID client OAuth Android** avec votre SHA-1 (`cd android && ./gradlew signingReport`).
    *   Créez un **ID client OAuth Application Web** (Indispensable pour Supabase).
    *   Ajoutez `https://reapauoxqaqdtxtrxczx.supabase.co/auth/v1/callback` dans les URIs de redirection autorisés de l'ID Web.
2.  **Supabase Dashboard** :
    *   Allez dans `Auth > Providers > Google`.
    *   Activez Google et collez l'**ID client Web** et le **Secret client Web**.
3.  **Application Mobile** :
    *   Mettez à jour `webClientId` dans `src/config/env.js` avec l'ID client Web.

### 2. GitHub Auth
1.  **GitHub Settings** :
    *   Créez une nouvelle **OAuth App**.
    *   L'URL de redirection est disponible dans votre dashboard Supabase sous `Auth > Providers > GitHub`.
2.  **Supabase Dashboard** :
    *   Activez GitHub et renseignez le Client ID et le Client Secret fournis par GitHub.

---

## ☁️ Déploiement Cloud (Vercel)

Le backend Supabase peut être hébergé gratuitement sur Vercel :
1.  Installez la CLI Vercel : `npm install -g vercel`.
2.  Lancez le déploiement à la racine : `vercel --prod`.
3.  L'application est configurée pour pointer automatiquement vers `https://afro-vibe-backend.vercel.app/api` en mode online.

---

## 📝 Configuration du Mode de Fonctionnement
Vous pouvez changer le mode directement dans l'application :
**Profil > Paramètres > Mode de fonctionnement**
- **Mode En Ligne (Supabase) :** Utilise le cloud (Vercel + Supabase) pour une expérience mondiale.
- **Mode Local (SQLite) :** Utilise votre serveur Node.js local (idéal pour le dev ou usage privé).

---

*Développé avec passion pour la culture Afro.* 🌍🎵
