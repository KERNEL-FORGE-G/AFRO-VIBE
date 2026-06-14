# Guide d'Intégration : Authentifictor

Le service **Authentifictor** est un fournisseur d'identité centralisé (OAuth2) conçu pour simplifier l'authentification dans vos applications via **Google** et **GitHub**. Ce guide détaille comment intégrer ce service dans vos projets.

---

## 1. Fonctionnement
Le processus d'authentification se déroule en trois étapes :

1.  **Redirection :** Votre application redirige l'utilisateur vers le service Authentifictor (`/api/auth/{provider}`).
2.  **Consentement :** L'utilisateur s'authentifie via le fournisseur choisi (Google ou GitHub).
3.  **Callback :** Authentifictor redirige l'utilisateur vers votre `redirect_uri` avec un jeton sécurisé (JWT).

---

## 2. Intégration dans votre Application

### A. Déclencher la Connexion
Utilisez l'une des URLs suivantes pour rediriger l'utilisateur vers notre service :

*   **Google :** `https://authentificator.vercel.app/api/auth/google`
*   **GitHub :** `https://authentificator.vercel.app/api/auth/github`

**Paramètres de requête requis :**

| Paramètre | Description |
| :--- | :--- |
| `app` | Le nom de votre application (pour le suivi). |
| `redirect_uri` | L'URL complète de votre application où l'utilisateur sera redirigé après succès/échec (encodée). |

*Exemple de redirection :*
`https://authentificator.vercel.app/api/auth/google?app=MonApp&redirect_uri=https%3A%2F%2Fmon-app.com%2Fcallback`

### B. Gestion du Callback
Authentifictor redirige vers votre `redirect_uri` en ajoutant les paramètres suivants :

*   `status` : `success` ou `failure`.
*   `token` : Un **JWT** valide si le statut est `success`.

Vous devez récupérer ces paramètres, valider le jeton, et gérer la session utilisateur dans votre application.

### C. Exemples d'implémentation (JavaScript)

**1. Déclencher la Connexion :**
Vous pouvez créer des fonctions dédiées pour chaque fournisseur :

```javascript
const loginWithGoogle = () => {
  const serviceUrl = "https://authentificator.vercel.app/api/auth/google";
  const params = new URLSearchParams({
    app: "NomDeVotreApp",
    redirect_uri: encodeURIComponent("https://votre-site.com/callback")
  });
  window.location.href = `${serviceUrl}?${params.toString()}`;
};

const loginWithGitHub = () => {
  const serviceUrl = "https://authentificator.vercel.app/api/auth/github";
  const params = new URLSearchParams({
    app: "NomDeVotreApp",
    redirect_uri: encodeURIComponent("https://votre-site.com/callback")
  });
  window.location.href = `${serviceUrl}?${params.toString()}`;
};
```

**2. Gérer le Callback :**
```javascript
// Dans votre page de callback
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('status');
  const token = params.get('token');

  if (status === 'success' && token) {
    // Stocker le JWT pour vos futures requêtes
    localStorage.setItem('auth_token', token);
    alert('Authentification réussie !');
  } else {
    alert('Erreur d\'authentification');
  }
}, []);
```

---

## 3. Sécurisation des Données (Firebase Firestore)

Pour garantir la confidentialité et l'intégrité de vos données, déployez les règles de sécurité Firestore suivantes dans votre console Firebase pour assurer que les utilisateurs ne peuvent manipuler que leurs propres données :

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read: if true;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null;
    }

    match /videos/{videoId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null && resource.data.user_id == request.auth.uid;
    }

    // ... (Appliquez des règles similaires pour vos autres collections)
  }
}
```

---

## 4. Administration

Gérez vos applications et surveillez les logs de connexion en temps réel sur la console d'administration :
[https://authentificator.vercel.app/admin](https://authentificator.vercel.app/admin)
