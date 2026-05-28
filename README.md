# 🎵 AFRO VIBE - Réseau Social de la Culture Afro

**Afro Vibe** est une application mobile moderne inspirée de TikTok, dédiée à la célébration de la culture africaine (danse, musique, mode). Développée avec **React Native**, elle intègre une identité visuelle unique basée sur des motifs tribaux traditionnels et un thème sombre premium.

---

## 🚀 Création du Projet

Le projet a été initialisé en utilisant **React Native CLI** (sans Expo) pour un contrôle total sur les modules natifs et les performances. L'architecture est divisée en deux parties principales :
- **Frontend** : Application mobile React Native (iOS & Android).
- **Backend** : Serveur API local Node.js/Express avec base de données SQLite.

---

## 📦 Dépendances Utilisées

### Frontend (Application Mobile)
- **Cœur & UI** : `react`, `react-native`, `react-native-safe-area-context`.
- **Navigation** : `@react-navigation/native`, `stack`, `bottom-tabs`.
- **Multimédia** : `react-native-video` (flux vidéo fluide), `react-native-image-picker` (capture média).
- **Graphismes** : `react-native-svg` (motifs tribaux et icônes Adinkra).
- **Firebase** : `@react-native-firebase/app`, `auth`, `firestore`.
- **Notifications** : `@notifee/react-native`.
- **Stockage Local** : `@react-native-async-storage/async-storage`.

### Backend (Serveur API)
- **Framework** : `express`.
- **Base de Données** : `sqlite3`, `sqlite` (base de données légère et rapide).
- **Authentification** : `jsonwebtoken` (JWT), `bcrypt` (hachage de mots de passe).
- **Gestion de fichiers** : `multer` (upload de vidéos et avatars).
- **Middleware** : `cors`, `dotenv`.

---

## 🔥 Le Rôle de Firebase

Dans **Afro Vibe**, Firebase n'est pas seulement une base de données, c'est une infrastructure hybride qui assure la robustesse et l'extensibilité de l'application :

1.  **Infrastructure Native & Analytics** : Le SDK Firebase est le socle de l'application Android et iOS. Il gère l'initialisation native et fournit des outils d'analyse (Analytics) pour suivre la santé de l'application et les crashs en temps réel.
2.  **Notifications Push (FCM)** : Firebase Cloud Messaging est utilisé comme pont pour envoyer des notifications push vers les appareils mobiles, intégré avec la bibliothèque **Notifee** pour un affichage personnalisé.
3.  **Système de Repli (Fallback) & Développement** : 
    *   L'application est conçue pour être "Firebase-ready". Bien qu'elle utilise actuellement un backend Node.js personnalisé, elle peut basculer sur les services **Firebase Auth** et **Firestore** en un seul changement de configuration.
    *   Un service de simulation (`firebaseService.js`) permet d'exécuter l'application sans fichiers de configuration (`google-services.json`) pour faciliter le développement rapide sur de nouveaux environnements.
4.  **Hébergement Médias (Optionnel)** : Firebase Storage est prêt à prendre le relais du stockage local pour la montée en charge des vidéos et des images en production.

---

## 📱 Pages et Services

### Écrans (Screens)
- **Welcome** : Accueil visuel et introduction.
- **Feed (Accueil)** : Flux vidéo vertical scrollable (style TikTok).
- **Discover** : Recherche de contenus, défis et catégories.
- **Camera** : Studio de création pour enregistrer et publier des vidéos.
- **Inbox** : Boîte de réception pour les notifications et messages.
- **Profile** : Espace personnel du créateur (statistiques, vidéos publiées).
- **Live** : Simulation de diffusion en direct avec réactions.
- **Settings** : Configuration de l'application et du serveur.

### Services
- **apiService.js** : Centralise toutes les requêtes vers le backend (Auth, Vidéos, Profils).
- **notificationService.js** : Gère l'affichage des notifications locales et push.
- **offlineService.js** : Gère la persistance des données et la synchronisation.
- **firebaseService.js** : Interface pour les services Cloud Firebase.

---

## ⚙️ Fonctionnement et Connexion Frontend-Backend

### Architecture de Connexion
L'application communique avec le backend via une **API REST** (protocole HTTP).
- **URL API** : Par défaut, l'application pointe vers `http://10.0.2.2:3000/api` (adresse spécifique pour l'émulateur Android vers l'hôte local).
- **Service d'Authentification** : Gère les jetons JWT pour sécuriser les accès.
- **Synchronisation Offline** : Si le serveur est inaccessible, l'application sauvegarde les actions (comme les inscriptions) localement et tente de les synchroniser automatiquement dès que la connexion est rétablie.

### Tableau de Bord Admin
Le backend inclut un **Dashboard Admin** (accessible sur `http://localhost:3000`) permettant de visualiser les utilisateurs, gérer les vidéos et monitorer l'activité du serveur.

---

## 🔐 Permissions Requises

Pour fonctionner correctement, l'application demande les permissions suivantes :

### Android
- `INTERNET` : Pour la communication avec le serveur et Firebase.
- `CAMERA` : Pour l'enregistrement de vidéos.
- `RECORD_AUDIO` : Pour capturer le son lors des enregistrements.
- `READ/WRITE_EXTERNAL_STORAGE` : Pour sauvegarder et charger des médias.
- `POST_NOTIFICATIONS` : Pour les alertes d'activité.
- `ACCESS_NETWORK_STATE` : Pour détecter la connexion et gérer le mode offline.

### iOS
- `NSCameraUsageDescription` : Accès à la caméra.
- `NSMicrophoneUsageDescription` : Accès au micro.
- `NSPhotoLibraryUsageDescription` : Accès à la galerie pour l'import.
- `NSLocalNetworkUsageDescription` : Pour la connexion au serveur de développement local.

---

## 🛠️ Installation et Lancement

1. **Installer les dépendances** :
   ```bash
   npm install
   cd backend && npm install
   ```

2. **Lancer le serveur backend** :
   ```bash
   npm run server
   ```

3. **Lancer l'application mobile** :
   ```bash
   # Terminal 1 : Metro Bundler
   npx react-native start

   # Terminal 2 : Android
   npx react-native run-android

   # Terminal 2 : iOS (macOS requis)
   npx react-native run-ios
   ```

---

*Développé avec passion pour célébrer l'héritage Afro. 🌍🎵*
