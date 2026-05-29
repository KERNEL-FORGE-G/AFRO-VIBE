# 🎵 Afro Vibe - Plateforme Sociale de Culture Afro

Afro Vibe est une application mobile immersive dédiée à la promotion de la culture, de la danse et de la musique africaines. Conçue pour offrir une expérience fluide, elle permet aux utilisateurs de partager leurs vidéos, d'interagir avec la communauté et de gérer leur profil culturel.

## 🎨 Design & Nature du projet
*   **Identité visuelle :** Design "Dark Mode" élégant, avec des accents vibrants (couleurs primaires chaudes), une typographie moderne, et des motifs tribaux subtils en arrière-plan.
*   **Expérience utilisateur :** Navigation par onglets (Bottom Tabs), flux vidéo en plein écran, et interaction centrée sur la communauté (likes, commentaires).
*   **Architecture :**
    *   **Frontend :** React Native (CLI, TypeScript) + React Navigation (v7).
    *   **Backend :** Node.js/Express avec base de données SQLite (pour le mode hors-ligne).
    *   **Cloud (Optionnel) :** Firebase Modular SDK (v22+) pour le stockage média et la base de données.

---

## 🛠️ Installation (De zéro)

### 1. Prérequis
*   Node.js (>= 22.11.0)
*   Android Studio & SDK
*   React Native CLI

### 2. Initialisation
```bash
npx react-native init AfroVibe --template react-native-template-typescript
cd AfroVibe
```

### 3. Librairies principales
```bash
# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context
# Firebase (Modular v22+)
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/storage
# Multimédia/UI
npm install react-native-video react-native-vision-camera react-native-image-picker react-native-svg react-native-reanimated
# Local
npm install @react-native-async-storage/async-storage
```

---

## ⚙️ Configuration spécifique

### Optimisation Android (Taille APK)
Pour installer l'app sur des téléphones avec peu d'espace, nous utilisons les **ABI Splits** dans `android/app/build.gradle` :
```gradle
splits {
    abi {
        reset()
        enable true
        universalApk false
        include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
    }
}
```

### Gestion du stockage (Online vs Local)
*   **Mode Firebase (Online) :** Nécessite le forfait "Blaze" (paiement à l'usage, gratuit sous 5Go).
*   **Mode Local (Offline) :** Utilise le serveur Node.js local. L'application bascule automatiquement si l'option Firebase est désactivée dans les paramètres de l'app.

---

## 🚀 Workflow de développement

*   **Démarrer Metro :** `npm run start`
*   **Lancer Android :** `npm run android`
*   **Lancer le backend :** `cd backend && npm run server`

### En cas d'erreur "Not enough space" sur Android
1.  Nettoyer : `cd android && ./gradlew clean`
2.  Désinstaller l'app sur le téléphone : `adb uninstall com.afrovibe.app`
3.  Réinstaller : `npm run android`

---

## 🛡️ Permissions Android (`AndroidManifest.xml`)
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```
