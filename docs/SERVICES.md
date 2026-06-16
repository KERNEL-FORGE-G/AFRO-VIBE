# Services et Intégrations

Le dossier `src/services/` contient la logique métier et les clients de communication avec les services externes.

## 📡 API & Réseau

### `apiService.js`
Le service central de l'application. Il gère :
- **Authentification :** Login, Logout, Inscription.
- **Vidéos :** Récupération du flux, publication, likes et commentaires.
- **Utilisateurs :** Récupération des profils, recherche.
- **Persistance :** Gestion de l'adresse IP du serveur et du token JWT via `AsyncStorage`.

### `onlineService.js` & `offlineService.js`
- Gèrent la détection de la connectivité réseau.
- Permettent un mode dégradé ou la mise en attente des actions lorsque l'utilisateur est hors-ligne.

---

## ☁️ Services Cloud

### `firebaseClient.js`
- Initialisation de Firebase.
- Utilisation de **Firestore** pour les données en temps réel (chats, likes).
- Gestion des **Cloud Messaging (FCM)** pour les notifications push.

### `supabaseClient.js`
- Client pour l'intégration de Supabase.
- Utilisé pour le stockage de fichiers et certaines requêtes de base de données relationnelle complexes.

### `cloudinaryClient.js`
- Gère le téléversement (upload) des vidéos et des images vers Cloudinary.
- Fournit les URLs optimisées pour le streaming vidéo.

---

## 🛠️ Services Utilitaires

### `localService.js`
- Couche d'abstraction pour le stockage local (`AsyncStorage`).
- Utilisé pour stocker les préférences utilisateur et les données en cache.

### `notificationService.js`
- Gère l'affichage des notifications locales et le traitement des notifications push reçues.
- Utilise `@notifee/react-native`.

### `outboxService.js`
- Gère la file d'attente des actions à synchroniser (ex: un like effectué hors-ligne qui doit être envoyé au serveur dès que la connexion revient).

### `mockData.js`
- Fournit des données statiques pour le développement et les tests lorsque le serveur n'est pas disponible.
