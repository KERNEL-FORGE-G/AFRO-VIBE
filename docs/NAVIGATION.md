# Navigation de l'Application

L'application utilise **React Navigation** pour gérer les transitions entre les écrans. La logique est centralisée dans `src/navigation/`.

## 🛡️ Authentification & Redirection

Le composant `AppNavigator.js` gère l'état d'authentification global :
- **État d'initialisation :** Pendant que l'application vérifie si une session existe (`initializing`), un `LoadingScreen` est affiché.
- **Utilisateur non connecté :** L'utilisateur est dirigé vers le stack d'authentification (`Welcome`, `Login`, `Register`).
- **Utilisateur connecté :** L'utilisateur est automatiquement redirigé vers `MainTabs`.

---

## 📱 Navigation Principale (`MainTabs`)

Le `BottomTabNavigator.js` définit la barre de navigation en bas de l'écran avec 5 onglets :
1.  **Accueil :** `FeedScreen` (Flux de vidéos).
2.  **Découvrir :** `DiscoverScreen` (Recherche et tendances).
3.  **Plus (+ ) :** `CameraScreen` (Capture vidéo). *Note : Cet onglet n'affiche pas de label, seulement l'icône centrale.*
4.  **Boîte :** `InboxScreen` (Messages et notifications).
5.  **Profil :** `ProfileScreen` (Profil de l'utilisateur).

---

## 🚀 Écrans de Second Niveau (Stack)

Certains écrans sont accessibles depuis n'importe où ou via des interactions spécifiques et se superposent à la navigation principale :
- **Live :** Lancé depuis l'accueil ou le profil pour voir un streaming.
- **SoundDetail :** Affiché lorsqu'on clique sur le disque tournant d'une vidéo.
- **Chat :** Lancé depuis la boîte de réception pour une conversation spécifique.
- **Settings :** Accessible depuis le profil personnel.
- **VideoEdit :** Lancé automatiquement après une capture réussie dans `CameraScreen`.

---

## 🎨 Personnalisation

- **Thème :** Les couleurs de la navigation (fond, icônes actives) sont synchronisées avec `src/styles/theme.js`.
- **Badges :** L'onglet "Boîte" affiche un badge rouge avec le nombre de notifications non lues, mis à jour toutes les 30 secondes via un intervalle dans `BottomTabNavigator`.
