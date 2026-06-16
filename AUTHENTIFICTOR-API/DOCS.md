# Authentifictor Service - Developer Documentation

Ce document explique comment intégrer le service d'authentification centralisé dans vos propres applications.

## 1. Flux d'authentification

Le service fonctionne selon un modèle de redirection simple :
1. Votre application redirige l'utilisateur vers Authentifictor.
2. L'utilisateur se connecte via Google ou GitHub.
3. Authentifictor redirige l'utilisateur vers votre application avec un JWT.

## 2. Endpoints d'Authentification

### Google
`GET https://votre-service.vercel.app/api/auth/google?app=NOM_APP&redirect_uri=URL_RETOUR`

### GitHub
`GET https://votre-service.vercel.app/api/auth/github?app=NOM_APP&redirect_uri=URL_RETOUR`

**Paramètres :**
- `app` : Le nom de votre application (pour le suivi dans l'admin).
- `redirect_uri` : L'URL complète où l'utilisateur sera renvoyé après connexion.

## 3. Réception de la réponse

Une fois connecté, nous redirigeons vers votre `redirect_uri` avec les paramètres suivants en query string :

- `status` : `success` ou `failure`
- `app` : Le nom de votre application.
- `token` : Un JWT (JSON Web Token) si le statut est `success`.

**Exemple d'URL de retour :**
`https://mon-app.com/callback?status=success&app=MonApp&token=eyJhbGciOiJIUzI1...`

## 4. Format du Token JWT

Le JWT contient les informations suivantes (décodable côté client sans secret pour la lecture, mais vérifiable côté serveur avec votre `JWT_SECRET`) :

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

## 5. Exemple d'intégration (React)

```javascript
const loginWithGoogle = () => {
  const serviceUrl = "https://authentifictor.vercel.app";
  const appName = "MonProjet";
  const redirectUri = window.location.origin + "/auth-callback";
  
  window.location.href = `${serviceUrl}/api/auth/google?app=${appName}&redirect_uri=${redirectUri}`;
};

// Dans votre composant de callback (/auth-callback)
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (token) {
    localStorage.setItem('auth_token', token);
    // Rediriger vers l'accueil
  }
}, []);
```
