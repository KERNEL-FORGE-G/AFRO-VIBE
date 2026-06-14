# Guide d'Intégration : Authentifictor

Authentifictor est un service d'authentification centralisé utilisant **Firebase Auth** et **Firestore**. Ce guide explique comment intégrer notre service pour connecter vos utilisateurs via **Google**, **GitHub** ou **Email/Password**.

---

## 1. Fonctionnement
Le service utilise les **Custom Tokens Firebase** pour garantir une sécurité native et une intégration transparente avec Firestore.

1.  **Authentification :** L'utilisateur se connecte via OAuth (Google/GitHub) ou Email/Password.
2.  **Génération de Token :** Notre serveur génère un `customToken` Firebase sécurisé.
3.  **Connexion Client :** Votre application utilise ce token pour se connecter nativement à Firebase.

---

## 2. Intégration Client (React/React Native)

### A. Connexion OAuth
Redirigez l'utilisateur vers notre API de connexion :

```javascript
const loginWithGoogle = () => {
  const serviceUrl = "https://authentificator.vercel.app/api/auth/google";
  // redirect_uri doit être encodée
  const redirectUri = encodeURIComponent("https://votre-site.com/callback");
  window.location.href = `${serviceUrl}?app=VotreApp&redirect_uri=${redirectUri}`;
};
```

### B. Gestion du Callback (Récupération du token)
Dans votre page de callback, échangez le `customToken` reçu contre une session Firebase active :

```javascript
import { signInWithCustomToken } from 'firebase/auth';
import { getAuth } from 'firebase/auth';

const handleCallback = async () => {
  const params = new URLSearchParams(window.location.search);
  const customToken = params.get('customToken');

  if (customToken) {
    const auth = getAuth();
    // Authentifie nativement l'utilisateur auprès de Firebase
    await signInWithCustomToken(auth, customToken);
    console.log("Utilisateur connecté nativement !");
  }
};
```

---

## 3. Sécurisation des Données (Firebase Firestore)

Une fois l'utilisateur connecté via `signInWithCustomToken`, les règles `request.auth` natifs de Firebase sont automatiquement activées. Utilisez ces règles sécurisées :

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Profils utilisateur : accès restreint au propriétaire
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Vidéos/Contenu : public en lecture, protégé en écriture
    match /videos/{videoId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```
---

## 4. Côté Serveur (Backend)
Pour générer le `customToken` à renvoyer au client :

```javascript
// Exemple conceptuel avec Firebase Admin SDK
const customToken = await admin.auth().createCustomToken(userIdFromDb);
// Renvoyer ce token dans l'URL de redirection au client
```
