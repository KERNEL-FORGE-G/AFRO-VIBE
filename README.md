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

- Feed vidéo plein écran (likes, commentaires, partage, favoris)
- Caméra + upload vidéo
- Profil (posts, liked, bookmarks)
- Chat et notifications (Inbox)
- Auth email + Google (mode online)
- Mode local SQLite pour développement hors ligne
- Sync local → cloud via backend Express

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
