# Gestion des Données et Bases de Données

Le projet **Afro Vibe** utilise une architecture de données hybride pour maximiser la performance et la flexibilité.

## 🗄️ 1. Supabase (Base Relationnelle Principale)

Située sur le cloud, elle sert de référence pour les données structurées.

### Tables principales :
- **`users` :** Profils, statistiques (followers/following), bio, avatar.
- **`videos` :** URLs des médias, métadonnées (catégorie, audio), compteurs d'interactions.
- **`likes` :** Table de liaison entre utilisateurs et vidéos (contrainte d'unicité).
- **`comments` :** Texte des commentaires liés à une vidéo et un auteur.
- **`messages` :** Historique des discussions privées.
- **`follows` :** Relations d'amitié/suivi.

---

## 🔥 2. Firebase (Temps Réel & Notifications)

- **Firestore :** Utilisé pour les fonctionnalités nécessitant une mise à jour instantanée sans rafraîchissement (ex: notifications de nouveaux messages, mise à jour des compteurs de likes en direct).
- **Firebase Auth :** Utilisé pour la gestion sécurisée des sessions et l'authentification sociale (Google).
- **FCM :** Envoi des notifications push vers les appareils Android/iOS.

---

## 💻 3. SQLite (Backend Local de Dev)

Utilisé pour simuler une base de données lors du développement local sans connexion cloud obligatoire pour tout.
- Le schéma est synchronisé avec celui de Supabase pour assurer la compatibilité.
- Les données sont stockées dans un fichier local sur le serveur Express.

---

## 📱 4. AsyncStorage (Stockage Local App)

Utilisé directement dans l'application mobile pour :
- Le token d'authentification (JWT).
- L'adresse IP personnalisée du serveur.
- Les préférences de l'utilisateur (mode sombre, etc.).
- La mise en cache légère de certaines listes pour un démarrage plus rapide.

---

## 🔒 Sécurité (RLS)

Sur Supabase, la **Row Level Security (RLS)** est activée :
- Tout le monde peut voir les vidéos.
- Seul l'auteur d'une vidéo peut la supprimer ou la modifier.
- Les messages ne sont lisibles que par l'expéditeur et le destinataire.
