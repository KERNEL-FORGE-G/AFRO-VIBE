# 🎵 AFRO VIBE - Application de Partage de Danse Afro

Afro Vibe est une application mobile de partage de vidéos courte durée, centrée sur la culture et la danse africaine. Elle utilise une architecture hybride flexible permettant de basculer entre différents modes de stockage et de backend.

## 🚀 Fonctionnalités Clés
- **Flux Vidéo (Feed) :** Lecture fluide de vidéos haute définition.
- **Stockage Hybride :** Support de **Cloudinary** (optimisation CDN), **Firebase** (Cloud Google) et **Local Backend** (Node.js).
- **Profil Utilisateur :** Gestion des avatars et informations personnelles.
- **Mode Hors-ligne :** Synchronisation automatique des comptes créés hors-ligne une fois la connexion rétablie.
- **Interaction :** Système de likes, commentaires et partages.

---

## 📂 Structure du Projet

### 📱 Frontend (React Native)
Situé à la racine et dans le dossier `src/`.

- **`App.tsx`** : Point d'entrée de l'application mobile.
- **`src/navigation/`** : Gestionnaire de navigation (Tabs, Stacks).
- **`src/screens/`** : Les pages de l'application :
  - `FeedScreen.js` : Le flux principal des vidéos.
  - `CameraScreen.js` : Enregistrement des vidéos.
  - `ProfileScreen.js` : Profil utilisateur et ses vidéos.
  - `SettingsScreen.js` : Configuration du mode de stockage et IP serveur.
  - `LoginScreen.js` / `RegisterScreen.js` : Authentification.
- **`src/services/`** : Logique métier :
  - `apiService.js` : Cœur de la communication avec le backend et Cloudinary.
  - `firebaseService.js` : Intégration spécifique pour Firebase Storage/Firestore.
- **`src/components/`** : Composants UI réutilisables (VideoPlayer, Icons, etc.).
- **`src/config/env.js`** : Variables d'environnement globales.

### ⚙️ Backend (Node.js)
Situé dans le dossier `backend/`.

- **`server.js`** : Point d'entrée du serveur Express.
- **`database.js`** : Configuration de la base de données **SQLite**.
- **`cloudinaryConfig.js`** : Configuration du SDK Cloudinary.
- **`routes/`** : Points de terminaison de l'API :
  - `videos.js` : Gestion des uploads et métadonnées vidéos.
  - `users.js` : Gestion des profils et avatars.
  - `auth.js` : Inscription et connexion.
- **`uploads/`** : Stockage local temporaire des fichiers.

---

## ☁️ Fonctionnement des Uploads (Cloudinary)

Le projet utilise une méthode d'upload **Backend-Proxy** pour maximiser la sécurité et la performance :

1.  **Sélection :** L'utilisateur choisit une vidéo ou une photo dans l'app.
2.  **Envoi :** Le fichier est envoyé via `multipart/form-data` au Backend Node.js.
3.  **Traitement Backend :**
    - Si le mode est `cloudinary` : Le backend utilise `cloudinary.uploader.upload_large` (pour les vidéos) pour envoyer le fichier vers le cloud.
    - **Optimisation :** Cloudinary génère automatiquement des versions compressées (f_auto, q_auto) et des miniatures.
    - **Nettoyage :** Le fichier temporaire est supprimé du serveur après l'envoi.
4.  **Base de données :** L'URL sécurisée Cloudinary (HTTPS) est enregistrée dans la base SQLite.

---

## 🔐 Permissions Requises

Pour offrir une expérience complète, l'application demande les accès suivants :

### 📸 Multimédia
- **Caméra (`CAMERA`) :** Pour enregistrer tes performances de danse directement dans l'application.
- **Microphone (`RECORD_AUDIO`) :** Pour capturer le son ambiant et ta musique lors de l'enregistrement.
- **Galerie / Stockage (`READ_EXTERNAL_STORAGE`, `READ_MEDIA_VIDEO`) :** Pour te permettre de choisir une vidéo déjà enregistrée sur ton téléphone et la publier.

### 🌐 Réseau et Connectivité
- **Internet (`INTERNET`) :** Indispensable pour charger le flux vidéo, envoyer tes créations sur Cloudinary/Firebase et discuter avec tes amis.
- **État du réseau (`ACCESS_NETWORK_STATE`) :** Permet à l'application de détecter si tu es hors-ligne et de basculer en mode de stockage local automatiquement.

### 🔔 Notifications et Système
- **Notifications (`POST_NOTIFICATIONS`) :** Pour t'alerter quand quelqu'un aime ta vidéo ou t'envoie un message.
- **Vibreur (`VIBRATE`) :** Pour les retours haptiques lors des interactions et notifications.

### 🛠️ Sécurité Réseau (Android)
- **Cleartext Traffic :** L'application autorise le trafic en clair pour permettre la lecture fluide des médias depuis le serveur local de développement ou certaines URLs de redirection Cloudinary.

---

## 📦 Dépendances & Bibliothèques Principales

Le projet s'appuie sur des bibliothèques robustes pour garantir performance et flexibilité.

### 📱 Frontend (Mobile)
- **`react-navigation`** : Gère toute la navigation entre les écrans (onglets du bas et piles de navigation).
- **`react-native-video`** : Le moteur de lecture pour les vidéos du flux (Feed).
- **`react-native-vision-camera`** : Utilisé pour capturer des vidéos avec des performances proches du natif.
- **`@react-native-firebase/*`** : Ensemble de modules pour l'authentification et le stockage via Google Firebase.
- **`react-native-reanimated` & `react-native-gesture-handler`** : Pour des animations fluides et une gestion tactile réactive.
- **`@notifee/react-native`** : Gestion avancée des notifications locales et push.
- **`react-native-svg`** : Pour l'affichage des icônes et motifs tribaux sans perte de qualité.

### ⚙️ Backend (Serveur)
- **`express`** : Framework web minimaliste pour construire notre API REST.
- **`cloudinary`** : SDK officiel pour l'upload, la transformation et l'optimisation des médias.
- **`multer`** : Middleware pour gérer l'upload de fichiers (multipart/form-data) via le serveur.
- **`sqlite` & `sqlite3`** : Base de données légère et rapide, idéale pour le stockage local et le développement.
- **`jsonwebtoken` (JWT)** : Utilisé pour sécuriser les échanges entre l'application et le serveur.
- **`bcrypt`** : Pour le hachage sécurisé des mots de passe utilisateurs.
- **`dotenv`** : Gestion sécurisée des variables d'environnement (clés API).

---

## 🛠️ Installation & Lancement

### 1. Pré-requis
- Node.js (v22+)
- Android Studio / Xcode
- Un compte Cloudinary

### 2. Configuration Backend
```bash
cd backend
npm install
# Créez un fichier .env avec :
# CLOUDINARY_CLOUD_NAME=votre_nom
# CLOUDINARY_API_KEY=votre_cle
# CLOUDINARY_API_SECRET=votre_secret
npm start
```

### 3. Lancement Mobile
```bash
# Dans le dossier racine
npm install
npx react-native run-android # ou run-ios
```

---

## 📝 Configuration du Stockage
Vous pouvez changer le mode de stockage directement dans l'application :
**Profil > Paramètres > Mode de Stockage**
- **Firebase :** Stockage cloud classique.
- **Cloudinary :** (Recommandé) Pour une lecture vidéo ultra-rapide et optimisée.
- **Local :** Pour le développement sans internet.

---

*Développé avec passion pour la culture Afro.* 🌍🎵
