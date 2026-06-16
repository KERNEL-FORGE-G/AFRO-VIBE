# Écrans de l'Application (Screens)

L'application **Afro Vibe** est composée des écrans suivants, situés dans `src/screens/`.

## 🧭 Navigation Principale (Tab Bar)

1.  **FeedScreen (`Accueil`) :**
    - Flux principal de vidéos courtes.
    - Supporte le défilement vertical (swipe up/down).
    - Interaction : Like, Commentaire, Partage, Suivre.
    - Utilise `VideoPlayerView` pour une lecture optimisée.

2.  **DiscoverScreen (`Découvrir`) :**
    - Grille de vidéos tendances et populaires.
    - Barre de recherche pour trouver des sons, des utilisateurs ou des hashtags.

3.  **CameraScreen (`Plus`) :**
    - Interface d'enregistrement vidéo.
    - Gestion du flash, changement de caméra (avant/arrière).
    - Gestion des permissions en temps réel.
    - Navigation vers `VideoEditScreen` après capture.

4.  **InboxScreen (`Boîte`) :**
    - Centre de notifications et messages.
    - Badge dynamique sur la Tab Bar pour les messages non lus.

5.  **ProfileScreen (`Profil`) :**
    - Profil personnel ou d'un tiers.
    - Affichage de la grille des vidéos postées.
    - Accès aux statistiques (Abonnés, Abonnements, J'aime).
    - Accès aux paramètres (si profil personnel).

---

## 🔐 Authentification

- **WelcomeScreen :** Écran d'accueil initial avec options de connexion/inscription.
- **LoginScreen :** Formulaire de connexion par email/mot de passe.
- **RegisterScreen :** Formulaire de création de compte.

---

## 🛠️ Écrans Auxiliaires

- **VideoEditScreen :** Prévisualisation de la vidéo capturée, ajout de légende et publication.
- **SettingsScreen :** Configuration de l'application (IP serveur, thème, déconnexion).
- **SoundDetailScreen :** Détails d'un son spécifique et liste des vidéos l'utilisant.
- **LiveScreen :** Interface pour les diffusions en direct (Streaming).
- **ChatScreen :** Interface de discussion privée entre utilisateurs.
- **AdminDashboardScreen :** Tableau de bord pour la gestion administrative (utilisateurs, modération).
