# Afro Vibe - Documentation Technique Complète

**Afro Vibe** est une application mobile de partage de vidéos courtes, inspirée par la culture africaine, développée avec **React Native CLI** et un backend **Node.js/SQLite**.

---

## 📱 Architecture Globale

L'application repose sur une séparation claire entre le client mobile et le serveur de données :

- **Frontend :** React Native (v0.85.3) utilisant TypeScript/JavaScript.
- **Backend :** API REST Express.js avec base de données SQLite.
- **Stockage Médias :** Serveur local (dossier `uploads/`) pour les vidéos et avatars.

---

## 🚀 Guide de démarrage rapide

### 1. Installation du Backend
```bash
cd backend
npm install
npm start
```
*Le serveur démarrera sur le port 3000. Notez l'adresse IP réseau affichée dans la console (ex: `http://192.168.1.15:3000`).*

### 2. Installation du Frontend
```bash
# À la racine du projet
npm install
npx react-native start
```

### 3. Lancement sur Mobile
- **Android :** `npx react-native run-android`
- **iOS :** `cd ios && pod install && cd .. && npx react-native run-ios`

---

## 📱 Utilisation sur Mobile Physique (TRÈS IMPORTANT)

Pour que l'application sur votre téléphone puisse communiquer avec le serveur sur votre ordinateur :

1.  **Même Réseau :** Connectez votre téléphone et votre ordinateur au **même réseau Wi-Fi**.
2.  **Configuration IP :** 
    - Ouvrez l'application Afro Vibe sur votre téléphone.
    - Allez dans **Profil** → **Paramètres** (icône roue crantée en haut à droite).
    - Dans la section **Configuration Serveur**, saisissez l'adresse IP de votre ordinateur suivie de `/api`.
    - Exemple : `http://192.168.1.15:3000/api`
    - Appuyez sur **Tester et sauvegarder**.

---

## 🛠️ Gestion de la Caméra et des Médias

L'application utilise `react-native-vision-camera` (v5) pour l'enregistrement.

### Sécurisation contre les Crashs
- **Cycle de vie :** La caméra est automatiquement désactivée lorsque l'écran perd le focus ou que l'application passe en arrière-plan pour libérer les ressources matérielles.
- **Permissions :** Les permissions Caméra et Microphone sont demandées au démarrage de l'écran `Plus`.
- **Enregistrement :** La logique d'arrêt/démarrage est protégée par des blocs `try-catch` pour éviter les plantages si le matériel ne répond pas instantanément.

### Téléversement des Vidéos
- **Format :** Utilisation de `FormData` pour envoyer les fichiers binaires.
- **Compatibilité Android :** Les URI de fichiers locaux sont automatiquement préfixées par `file://` pour garantir la lecture par le moteur réseau natif.
- **Types MIME :** Support automatique des formats `.mp4` et `.mov`.

---

## 📂 Structure du Projet

### Backend (`/backend`)
- `server.js` : Point d'entrée, gestion Express et démarrage.
- `database.js` : Schéma SQLite (Tables: `users`, `videos`, `comments`, `likes`).
- `routes/` : Logique API (Auth, Vidéos, Utilisateurs).
- `uploads/` : Dossier de stockage des fichiers multimédias.

### Frontend (`/src`)
- `screens/` : Écrans principaux (Flux, Caméra, Profil, Paramètres).
- `services/apiService.js` : Centralisation des appels réseau et gestion du stockage local (`AsyncStorage`).
- `components/` : Composants réutilisables (Lecteur vidéo, Modales, Motifs SVG).
- `styles/theme.js` : Charte graphique (Couleurs tribales, espacements).

---

## 🔍 Dépannage et Optimisation (Nouveau)

### L'application crash à l'ouverture de la caméra
- **Correction apportée :** La caméra est désormais liée au cycle de vie de l'application. Elle se désactive si l'app est en arrière-plan.
- **Action utilisateur :** Vérifiez que vous n'avez pas d'autres applications (Instagram, TikTok) utilisant la caméra simultanément.

### Plantages lors du défilement des vidéos
- **Optimisation :** Nous avons limité le nombre de vidéos chargées en mémoire (max 3). Les vidéos hors-écran sont automatiquement détruites pour libérer la RAM.
- **Astuce :** Si votre téléphone a peu de RAM, fermez les applications inutiles en arrière-plan.

### Problèmes de Debugger (UNREGISTERED_DEVICE)
- Si Metro affiche cette erreur, relancez l'application manuellement sur votre téléphone. C'est souvent dû à un redémarrage trop rapide après une modification.

---

## 🎨 Charte Graphique
- **Primaire (Violet) :** `#13091B`
- **Accent (Orange) :** `#FF5E00`
- **Secondaire (Magenta) :** `#E60067`
- **Or :** `#FFAA00`
