# Architecture du Projet Afro Vibe

Cette page détaille l'architecture globale et les choix technologiques du projet **Afro Vibe**.

## 🏗️ Structure Globale

Le projet est divisé en deux parties principales :

1.  **Frontend (React Native) :** L'application mobile située à la racine et dans le dossier `src/`.
2.  **Backend (Node.js/Express) :** L'API serveur située dans le dossier `backend/`.
3.  **Server Next.js (Admin/Web) :** Un portail web situé dans `server-next/`.

---

## 🛠️ Stack Technologique

### Frontend Mobile
- **Framework :** React Native CLI (v0.85.3)
- **Langage :** TypeScript / JavaScript
- **Gestion d'état :** Redux Toolkit (Slices pour l'authentification, les vidéos, etc.)
- **Navigation :** React Navigation (Stack & Bottom Tabs)
- **Média :** `react-native-vision-camera` (v5), `react-native-video` (v6)
- **Icons :** Composants SVG personnalisés (`src/components/SVGIcon.js`)

### Services & Cloud
- **Firebase :** Authentification, Firestore, Cloud Messaging (Notifications)
- **Supabase :** Base de données relationnelle complémentaire, Stockage
- **Cloudinary :** Gestion et hébergement des vidéos et images
- **SQLite (Backend Local) :** Persistance des données pour le serveur de développement

### Backend
- **Framework :** Express.js
- **Base de données :** SQLite (via `database.js`)
- **Authentification :** JWT et utilitaires personnalisés

---

## 📂 Organisation des Dossiers (Frontend)

- `src/assets/` : Ressources statiques (images, polices).
- `src/components/` : Composants UI réutilisables (Skeletons, Toasts, VideoPlayer).
- `src/config/` : Configuration globale et variables d'environnement.
- `src/hooks/` : Hooks React personnalisés (ex: `useVideoActions`).
- `src/navigation/` : Logique de navigation (Navigators).
- `src/redux/` : Configuration Redux et Slices.
- `src/screens/` : Écrans de l'application.
- `src/services/` : Clients API et intégrations (Firebase, Supabase, Cloudinary).
- `src/styles/` : Thème global et constantes de design.
- `src/utils/` : Fonctions utilitaires (Haptics, Media processing).

---

## 🔌 Communication API

L'application communique avec le backend via `apiService.js`. L'adresse du serveur est configurable dynamiquement via l'écran des paramètres pour faciliter le développement sur mobile physique.
