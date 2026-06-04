# 🎵 AFRO VIBE - Application de Partage de Danse Afro

Afro Vibe est une application mobile de partage de vidéos courte durée, centrée sur la culture et la danse africaine. Elle utilise une architecture hybride permettant de travailler en **mode online** avec Firestore + Cloudinary, ou en **mode local** avec SQLite + fichiers locaux.

## 🚀 Fonctionnalités Clés
- **Flux Vidéo (Feed) :** Lecture fluide de vidéos haute définition avec support du plein écran.
- **Stockage Hybride :** **Firestore** pour la base de données online, **Cloudinary** pour les images/vidéos, et **SQLite** en fallback local.
- **Architecture MVC + Redux :** Gestion d'état robuste via Redux Toolkit pour une application fluide et prévisible.
- **Authentification Sociale :** Connexion et inscription rapide via **Google** et **GitHub**.
- **Mode En Ligne / Local :** Basculez entre le cloud (Firestore + Cloudinary) et le serveur local depuis les paramètres.
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
- **Mode Online** : Communique avec l'API backend. Le backend utilise **Firestore** pour les collections (`users`, `videos`, `comments`, `likes`, `follows`, `messages`) et **Cloudinary** pour les fichiers vidéo/avatar.
- **Détection Automatique** : L'app détecte le mode choisi par l'utilisateur et ajuste ses URLs d'API dynamiquement.

### ☁️ Infrastructure Cloud (Firestore & Cloudinary)
- **Firestore** : base de données principale en ligne.
- **Cloudinary** : stockage/CDN pour avatars et vidéos.
- **Backend Express** : conserve les mêmes endpoints REST que l'app mobile (`/api/auth`, `/api/videos`, `/api/users`, `/api/messages`, `/api/sync`) et choisit Firestore si Firebase Admin est configuré, sinon SQLite.

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
├── backend/            # API Express: Firestore online + SQLite local
├── server-next/        # Dashboard/API Next historique
├── supabase.sql        # Ancien schéma Supabase conservé en référence
└── .github/workflows/  # Build Android CI
```

---

## 📝 Guide d'Installation Rapide

1. **Installer l'app mobile** : `npm ci`
2. **Installer le backend** : `npm --prefix backend ci`
3. **Configurer l'Env backend** : copiez `backend/.env.example` vers `backend/.env` et remplissez Firebase Admin + Cloudinary.
4. **Lancer le backend** : `npm run backend:dev`
5. **Lancer l'app** : `npm run android` ou `npm run ios`
6. **Build Android release** : `npm run build:android`

---

*Développé avec passion pour la culture et la danse Afro.* 🌍🎵🚀
