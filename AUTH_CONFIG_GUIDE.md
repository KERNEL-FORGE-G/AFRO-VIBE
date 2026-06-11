# Configuration de l'Authentification Google et GitHub (Firebase)

Ce guide explique comment configurer complètement l'authentification sociale pour Afro Vibe.

## 1. Prérequis Firebase
- Allez sur la [Console Firebase](https://console.firebase.google.com/).
- Activez **Authentication** dans le menu latéral.
- Allez dans l'onglet **Sign-in method**.

## 2. Configuration Google

### Firebase Console
1. Dans **Sign-in method**, cliquez sur **Ajouter un fournisseur**.
2. Sélectionnez **Google** et activez-le.
3. Enregistrez les modifications.
4. Notez l'**ID client Web** qui apparaît dans la configuration Google de Firebase.

### Application Mobile
1. Ouvrez `src/config/env.js`.
2. Insérez l'ID client Web dans `google.webClientId`.
3. Pour Android, assurez-vous d'avoir ajouté l'empreinte SHA-1 de votre clé de signature dans les paramètres du projet Firebase.

---

## 3. Configuration GitHub

### GitHub Developer Settings
1. Allez sur [GitHub Settings -> Developer Settings -> OAuth Apps](https://github.com/settings/developers).
2. Cliquez sur **New OAuth App**.
3. Nom de l'application : `Afro Vibe`.
4. Homepage URL : `https://afro-vibe-ab786.firebaseapp.com` (ou votre domaine Firebase).
5. **Authorization callback URL** : Copiez cette URL depuis la console Firebase (voir étape suivante).

### Firebase Console
1. Dans **Sign-in method**, cliquez sur **Ajouter un fournisseur**.
2. Sélectionnez **GitHub**.
3. Firebase vous donnera une **URL de redirection (callback URL)**. Copiez-la et collez-la dans la configuration de l'application GitHub (étape 5 ci-dessus).
4. Copiez l'**ID client** et le **Secret client** depuis GitHub et collez-les dans Firebase.
5. Enregistrez.

### Application Mobile
L'authentification GitHub est initiée via Firebase. Assurez-vous que les dépendances natives sont correctement liées (déjà configuré dans le projet).

---

## 4. Panel Admin (Vercel)
Assurez-vous d'ajouter les variables d'environnement suivantes sur Vercel pour que l'admin panel puisse communiquer avec Firebase :
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
