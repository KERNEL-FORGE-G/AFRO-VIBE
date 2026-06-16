# Guide des modifications : AUTHENTIFICTOR-API

Ce fichier récapitule les modifications nécessaires à apporter à votre projet serveur pour passer aux **Firebase Custom Tokens** et rendre l'authentification opérationnelle avec `AfroVibe`.

---

## 1. Installation des dépendances
Dans le répertoire `/home/ravel/Bureau/AUTHENTIFICTOR-API`, exécutez :
```bash
npm install firebase-admin
```

## 2. Configuration Firebase Admin
Assurez-vous d'avoir téléchargé votre fichier `serviceAccountKey.json` depuis la console Firebase et placez-le à la racine de votre projet.

Ajoutez l'initialisation au début de vos fichiers de route (ex: `github.js`, `google.js`) :

```javascript
import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
```

## 3. Modification de la logique de Callback
Dans `github.js` et `google.js`, remplacez la génération de votre JWT manuel par le `Custom Token` Firebase.

### Ancien code (à supprimer) :
```javascript
const jwtToken = jwt.sign({...}, process.env.JWT_SECRET, {...});
finalUrl.searchParams.append('token', jwtToken);
```

### Nouveau code (à implémenter) :
```javascript
// 1. Générer le token Firebase
const customToken = await admin.auth().createCustomToken(user.id);

// 2. Rediriger avec le bon paramètre 'customToken'
const finalUrl = new URL(redirect_uri);
finalUrl.searchParams.append('customToken', customToken); // IMPORTANT: Nom exact
finalUrl.searchParams.append('status', 'success');
res.redirect(finalUrl.toString());
```

## 4. Vérification finale
Une fois les modifications appliquées :
1. Sauvegardez les fichiers.
2. `git add .`
3. `git commit -m "feat: use firebase custom tokens"`
4. `git push origin main`

Votre application `AfroVibe` est déjà prête à recevoir ce `customToken` et à s'authentifier nativement auprès de Firebase.
