# Authentifictor Service

Un service d'authentification centralisé (Identity Provider) pour vos applications, utilisant OAuth 2.0 (Google & GitHub).

## 🚀 Fonctionnalités
- Authentification unifiée via Google & GitHub.
- Génération et validation de tokens JWT sécurisés.
- Tableau de bord administrateur (Panel Admin) pour le suivi des connexions en temps réel.
- Base de données PostgreSQL pour l'historique et les statistiques.
- Documentation développeur intégrée.

## 🛠 Technologies & Frameworks

### Frontend
- **ReactJS (Vite) :** Interface utilisateur moderne et rapide.
- **Tailwind CSS :** Framework de style utilitaire pour une interface réactive.
- **Tremor :** Framework de composants UI spécialisé pour les tableaux de bord.
- **Lucide React :** Bibliothèque d'icônes.
- **Recharts :** Visualisation de données pour le panel admin.
- **Axios :** Client HTTP pour la communication API.
- **React Router :** Gestion de la navigation.

### Backend (Serverless)
- **Node.js (Vercel Functions) :** Exécution du code backend côté serveur sans gestion d'infrastructure.
- **Passport.js :** Middleware d'authentification pour gérer les stratégies Google et GitHub.
- **JSON Web Token (jsonwebtoken) :** Gestion de la session utilisateur.

### Base de données & Infra
- **Neon PostgreSQL :** Base de données SQL serverless haute performance.
- **Prisma ORM :** Interface de programmation pour interagir avec la base de données.
- **Vercel :** Plateforme de déploiement pour le frontend et les fonctions API.

## 📖 Guide d'Intégration
Consultez le fichier [DOCS.md](DOCS.md) pour apprendre comment connecter vos applications à ce service.

## 🔒 Sécurité
- Utilisation des standards OAuth2.
- Protection CSRF (via état).
- Variables d'environnement sécurisées (via Vercel).
- Tokens JWT signés.
