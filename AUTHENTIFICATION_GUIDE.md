# Documentation d'Intégration : Service Authentifictor

Le service **Authentifictor** est un fournisseur d'identité centralisé (Identity Provider OAuth2) conçu pour simplifier l'authentification dans vos applications via **Google** et **GitHub**.

---

## 1. Vue d'Ensemble du Flux

1.  **Redirection :** Votre application redirige l'utilisateur vers le service Authentifictor (`/api/auth/{provider}`).
2.  **Consentement :** L'utilisateur s'authentifie via le fournisseur choisi (Google ou GitHub).
3.  **Callback :** Authentifictor redirige l'utilisateur vers votre `redirect_uri` avec un jeton sécurisé (JWT).

---

## 2. Endpoints d'Authentification

Utilisez ces URLs pour déclencher le processus de connexion :

*   **Google :** `https://authentificator.vercel.app/api/auth/google`
*   **GitHub :** `https://authentificator.vercel.app/api/auth/github`

### Paramètres de requête requis :

| Paramètre | Description |
| :--- | :--- |
| `app` | Le nom de votre application (pour le suivi administrateur). |
| `redirect_uri` | L'URL complète de votre application où l'utilisateur sera redirigé après succès/échec. |

*Exemple d'URL de redirection :*
`https://authentificator.vercel.app/api/auth/google?app=MonSuperProjet&redirect_uri=https://mon-app.com/callback`

---

## 3. Réception de la Réponse (Callback)

Authentifictor redirige vers votre `redirect_uri` en ajoutant les paramètres suivants :

*   `status` : `success` ou `failure`.
*   `token` : Un **JWT** valide si le statut est `success`.
*   `app` : Le nom de votre application.

*Exemple d'URL de callback :*
`https://mon-app.com/callback?status=success&app=MonSuperProjet&token=eyJhbGciOiJIUzI1...`

---

## 4. Structure du Jeton JWT

Le JWT contient le payload suivant, lisible côté client et vérifiable côté serveur via votre `JWT_SECRET` :

```json
{
  "id": "cuid_de_l_utilisateur",
  "email": "utilisateur@exemple.com",
  "name": "Nom de l'utilisateur",
  "app": "Nom de l'application",
  "iat": 1718294400,
  "exp": 1718298000
}
```

---

## 5. Exemple d'Intégration (React/React Native)

### A. Déclencher la Connexion
```javascript
const loginWith = (provider) => {
  const serviceUrl = "https://authentificator.vercel.app";
  const appName = "AfroVibe"; // Nom configuré
  // Utilisez un schéma d'URL profond (Deep Link) pour le mobile
  const redirectUri = "afrovibe://auth/callback"; 
  
  window.location.href = `${serviceUrl}/api/auth/${provider}?app=${appName}&redirect_uri=${encodeURIComponent(redirectUri)}`;
};
```

### B. Gérer le Callback
Dans votre composant de route `/auth/callback` :

```javascript
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const status = searchParams.get('status');
    const token = searchParams.get('token');

    if (status === 'success' && token) {
      // 1. Stocker le token pour vos futures requêtes API
      localStorage.setItem('auth_token', token);
      
      // 2. Rediriger vers votre application
      navigate('/dashboard');
    } else {
      navigate('/login-failed');
    }
  }, [searchParams, navigate]);

  return <div>Authentification en cours...</div>;
};
```

---

## 6. Administration

Gérez vos applications et surveillez les logs de connexion en temps réel sur la console d'administration :
[https://authentificator.vercel.app/admin](https://authentificator.vercel.app/admin)
