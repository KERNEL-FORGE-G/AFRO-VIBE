# Architecture du Backend (API)

Le backend est une API REST construite avec **Node.js** et **Express**. Il se trouve dans le dossier `backend/`.

## 🏗️ Structure

- **`server.js` :** Point d'entrée principal. Configure Express, les middlewares (CORS, BodyParser) et monte les routes.
- **`database.js` :** Gère la connexion à la base de données SQLite et définit le schéma initial (tables).
- **`firebaseConfig.js` & `cloudinaryConfig.js` :** Configurations pour les services tiers côté serveur.

---

## 🛣️ Routes API

Les routes sont organisées par domaine dans le dossier `backend/routes/`.

### 1. Authentification (`/api/auth`)
- `POST /register` : Création d'un nouveau compte.
- `POST /login` : Connexion et génération du token JWT.
- `GET /me` : Récupération des infos de l'utilisateur connecté.

### 2. Vidéos (`/api/videos`)
- `GET /` : Récupère le flux de vidéos (avec pagination).
- `POST /upload` : Publie une nouvelle vidéo (gestion de `FormData`).
- `POST /:id/like` : Liker ou retirer un like d'une vidéo.
- `GET /:id/comments` : Liste les commentaires d'une vidéo.
- `POST /:id/comments` : Ajouter un commentaire.

### 3. Utilisateurs (`/api/users`)
- `GET /:id` : Profil d'un utilisateur.
- `PUT /update` : Mise à jour des informations du profil (avatar, bio).
- `POST /follow/:id` : Suivre ou ne plus suivre un utilisateur.

### 4. Messages (`/api/messages`)
- Gestion des conversations privées.
- `GET /conversations` : Liste des discussions en cours.
- `GET /:id` : Historique des messages d'une conversation.

### 5. Synchronisation (`/api/sync`)
- Route utilitaire pour la synchronisation des données après une période hors-ligne.

---

## 💾 Base de Données (SQLite)

Le schéma simplifié comprend :
- **Users :** `id`, `username`, `email`, `password_hash`, `avatar_url`, `bio`.
- **Videos :** `id`, `user_id`, `video_url`, `thumbnail_url`, `caption`, `created_at`.
- **Likes :** `id`, `user_id`, `video_id`.
- **Comments :** `id`, `user_id`, `video_id`, `text`, `created_at`.
- **Follows :** `follower_id`, `following_id`.

---

## 📁 Gestion des Fichiers

Le backend dispose d'un dossier `uploads/` servant de stockage temporaire ou permanent (selon la configuration) pour :
- Les avatars des utilisateurs.
- Les vidéos téléchargées avant leur éventuelle migration vers Cloudinary.
