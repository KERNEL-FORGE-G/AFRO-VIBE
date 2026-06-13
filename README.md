# 🎵 AFRO VIBE - Application de Partage de Danse Afro

Afro Vibe est une application mobile React Native de partage de vidéos courte durée, centrée sur la culture et la danse africaine.

## Architecture

| Mode | Données | Médias | Auth |
|------|---------|--------|------|
| **En Ligne** | Firestore (SDK client direct) | Cloudinary (upload preset) | Firebase Auth |
| **Local** | SQLite via Express LAN | Fichiers `/uploads/` | JWT Express |

**Plus de serveur Vercel.** Le mode online se connecte directement à Firebase et Cloudinary depuis l'app via `src/config/env.js`.

---

## 🚀 Fonctionnalités

- **Streaming Vidéo Optimisé** : Lecture bloc par bloc pour une fluidité maximale.
- **Feed Vidéo Intelligent** : Pagination (Infinite Scroll) pour économiser la data et la batterie.
- **Skeleton Loaders** : Feedback visuel moderne pendant le chargement des données.
- **Mode Outbox (Sync Offline)** : Likez, commentez et suivez vos créateurs même sans réseau. Les actions se synchronisent automatiquement au retour de la connexion.
- **Compression Vidéo Native** : Réduction de la taille des vidéos avant l'upload pour des publications ultra-rapides.
- **Feedback Haptique** : Vibrations subtiles lors des interactions pour une expérience immersive.
- **Notifications Réelles** : Notifications natives via Firebase et Notifee.
- **Profil Complet** : Gestion des posts, likes et favoris avec grilles performantes.
- **Chat Temps Réel** : Messagerie instantanée intégrée.
- **Auth Sociale** : Support Google et GitHub via Firebase.

---

## 📝 Installation

```bash
# App mobile
npm ci

# Backend local (mode offline uniquement)
npm --prefix backend ci
cp backend/.env.example backend/.env
```

### 1. Configurer le mode online

Remplissez `src/config/env.js` avec vos clés Firebase, Cloudinary et Google (voir section Variables ci-dessous).

### 2. Publier les règles Firestore

```bash
firebase deploy --only firestore:rules
# ou copiez firestore.rules dans Firebase Console → Firestore → Règles
```

### 3. Configurer Cloudinary

1. Console Cloudinary → Settings → Upload
2. Créez un **Upload Preset** en mode **Unsigned**
3. Notez le `cloud_name` et le nom du preset

### 4. Lancer l'app

```bash
npm run android   # ou npm run ios
```

### 5. Mode local (optionnel)

```bash
npm run backend:dev:offline
# Dans l'app : Paramètres → Mode Local → IP du serveur (ex: http://192.168.x.x:3000/api)
```

---

## 🔐 Configuration Authentification (Google & GitHub)

### Google Auth
1. Allez dans la [Console Firebase](https://console.firebase.google.com/).
2. **Authentification** -> **Sign-in method** -> Activer **Google**.
3. Dans les paramètres du projet, téléchargez le fichier `google-services.json` et placez-le dans `android/app/`.
4. Récupérez l'**ID client Web** (OAuth 2.0) dans la console Google Cloud ou les paramètres Firebase.
5. Copiez cet ID dans `src/config/env.js` sous `google.webClientId`.
6. **Important** : Pour le développement, ajoutez l'empreinte SHA-1 de votre clé de debug dans la console Firebase.

### GitHub Auth
1. Allez dans les [Paramètres Développeur GitHub](https://github.com/settings/developers).
2. Créez une nouvelle **OAuth App**.
3. L'URL de rappel (Callback URL) est fournie par Firebase : **Auth** -> **GitHub** -> Copiez l'URL.
4. Récupérez le **Client ID** et le **Client Secret**.
5. Collez-les dans la console Firebase (Auth -> Sign-in method -> GitHub).
6. L'application gérera automatiquement le flux via `signInWithGitHub` dans `onlineService.js`.

---

## 📂 Structure

```text
src/
  config/env.js          # Clés online embarquées dans l'app
  services/
    apiService.js        # Routeur online/local
    onlineService.js     # Firebase + Cloudinary
    localService.js      # Express LAN
    firebaseClient.js
    cloudinaryClient.js
backend/                 # Serveur local + sync (mode offline)
firestore.rules          # Règles de sécurité Firestore
```

---

*Développé avec passion pour la culture et la danse Afro.* 🌍🎵🚀
