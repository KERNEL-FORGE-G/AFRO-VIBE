# Base de Données - Guide Complet de Configuration

## 🚀 Démarrage Rapide

### 1. Avec Neon (RECOMMANDÉ - Gratuit & Serverless)

```bash
# 1. Créer un compte: https://console.neon.tech
# 2. Créer une nouvelle base de données PostgreSQL
# 3. Copier la DATABASE_URL depuis le dashboard Neon
# 4. Ajouter à votre .env
DATABASE_URL="postgresql://user:password@host/database"
```

### 2. Avec Supabase (Alternative gratuite)

```bash
# 1. Créer un compte: https://supabase.com
# 2. Créer un nouveau projet
# 3. Aller dans SQL Editor
# 4. Exécuter le fichier database_init.sql
# 5. Copier la DATABASE_URL (Connection String)
```

### 3. Avec PostgreSQL Local

```bash
# Installation (macOS)
brew install postgresql

# Démarrer le serveur
brew services start postgresql

# Créer une base de données
createdb authentificator

# La DATABASE_URL sera:
DATABASE_URL="postgresql://localhost/authentificator"
```

---

## 📋 Installation de la Base de Données

### Option 1: Utiliser Prisma Migrate

```bash
# 1. Ajouter DATABASE_URL à .env
# 2. Installer les dépendances
npm install

# 3. Exécuter les migrations
npx prisma migrate dev --name init

# 4. Voir le Prisma Studio
npx prisma studio
```

### Option 2: Exécuter le Script SQL Directement

#### Avec Neon/Supabase:
```
1. Aller dans l'interface SQL
2. Copier le contenu de database_init.sql
3. L'exécuter complètement
4. Vérifier que les tables sont créées
```

#### Avec psql (Local):
```bash
# Se connecter à PostgreSQL
psql -U postgres -d authentificator

# Exécuter le fichier SQL
\i database_init.sql

# Vérifier les tables
\dt
```

#### Avec MySQL/MariaDB:
⚠️ Le script SQL est pour PostgreSQL. Pour MySQL, vous devez adapter:
- Remplacer `uuid` par `CHAR(36)` ou `BINARY(16)`
- Remplacer `TIMESTAMP WITH TIME ZONE` par `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
- Supprimer les extensions PostgreSQL

---

## 🗄️ Structure de la Base de Données

```
User
├── id (UUID, PK)
├── email (String, UNIQUE)
├── name (String)
├── avatar (String URL)
├── role (String: user|admin|manager)
├── currentToken (JWT token)
├── tokenExpiresAt (Date)
├── lastTokenRefresh (Date)
├── githubId (String, UNIQUE)
├── googleId (String, UNIQUE)
├── provider (String: github|google|email)
├── createdAt (Date)
└── updatedAt (Date)

LoginLog
├── id (UUID, PK)
├── userId (FK → User)
├── appName (String)
├── provider (String)
├── status (String: success|failure)
├── errorMessage (String)
├── ipAddress (String)
├── userAgent (String)
└── createdAt (Date)

Session (Optional)
├── id (UUID, PK)
├── userId (FK → User)
├── token (String, UNIQUE)
├── ipAddress (String)
├── userAgent (String)
├── isActive (Boolean)
├── createdAt (Date)
├── expiresAt (Date)
└── lastActivityAt (Date)

OAuthToken (Optional)
├── id (UUID, PK)
├── userId (FK → User)
├── provider (String)
├── accessToken (String)
├── refreshToken (String)
├── tokenType (String)
├── createdAt (Date)
├── expiresAt (Date)
└── updatedAt (Date)

AuditLog (Optional)
├── id (UUID, PK)
├── userId (FK → User)
├── action (String)
├── entityType (String)
├── entityId (String)
├── oldValues (JSONB)
├── newValues (JSONB)
├── ipAddress (String)
├── userAgent (String)
└── createdAt (Date)
```

---

## 🔐 Variables d'Environnement

```bash
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@host/database"

# OAuth GitHub (REQUIRED for GitHub OAuth)
GITHUB_CLIENT_ID="your_client_id"
GITHUB_CLIENT_SECRET="your_client_secret"

# OAuth Google (REQUIRED for Google OAuth)
GOOGLE_CLIENT_ID="your_client_id"
GOOGLE_CLIENT_SECRET="your_client_secret"

# JWT (REQUIRED for token generation)
JWT_SECRET="your_secret_key_min_32_chars"

# Optional
NODE_ENV="production"
```

### Générer un JWT_SECRET sécurisé:

```bash
# Linux/macOS
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))
```

---

## 🧪 Tester la Connexion à la BD

```bash
# Avec Prisma
npx prisma db push

# Voir les données
npx prisma studio

# Avec psql
psql -U user -d database -h host -c "SELECT COUNT(*) FROM \"User\";"
```

---

## ✅ Checklist d'Installation

- [ ] Base de données créée
- [ ] DATABASE_URL configurée dans .env
- [ ] Tables créées (via migrations ou script SQL)
- [ ] Données de test insérées (admin user)
- [ ] Connexion testée
- [ ] GITHUB_CLIENT_ID/SECRET configurés
- [ ] GOOGLE_CLIENT_ID/SECRET configurés
- [ ] JWT_SECRET généré et configuré
- [ ] npm install effectué
- [ ] npm run dev fonctionne

---

## 🐛 Dépannage

### Erreur: "ECONNREFUSED 127.0.0.1:5432"
```
→ PostgreSQL n'est pas lancé
Sous macOS: brew services start postgresql
Vérifiez: psql -U postgres
```

### Erreur: "FATAL: role "user" does not exist"
```
→ L'utilisateur PostgreSQL n'existe pas
Créez-le: createuser -P username
Ou utilisez l'utilisateur par défaut: postgres
```

### Erreur: "relation "User" does not exist"
```
→ Les tables n'ont pas été créées
Exécutez: npx prisma db push
Ou: psql -d database -f database_init.sql
```

### Erreur: "ENOTFOUND database_url"
```
→ DATABASE_URL n'est pas configurée
Vérifiez le fichier .env
Vérifiez que le format est correct: postgresql://user:pass@host/db
```

### OAuth retourne 500
```
→ DATABASE_URL n'est pas configurée (problème résolu dans les nouvelles versions)
Vérifiez les logs: npm run dev
Vérifiez les variables d'environnement
```

---

## 📚 Fichiers Importants

| Fichier | Description |
|---------|------------|
| `database_init.sql` | Script complet d'initialisation |
| `.env` | Variables d'environnement locales |
| `prisma/schema.prisma` | Définition du schéma Prisma |
| `api/callback/github.js` | Callback GitHub OAuth |
| `api/callback/google.js` | Callback Google OAuth |

---

## 🚀 Prochaines Étapes

1. [Configurer GitHub OAuth](./URLS_ET_CODE_FINAL.md#github-oauth-setup)
2. [Configurer Google OAuth](./URLS_ET_CODE_FINAL.md#google-oauth-setup)
3. [Tester l'authentification](./TESTING_GUIDE.md)
4. [Déployer en production](./FINAL_SUMMARY.md#deployment)

---

## 📞 Support

- Neon Support: https://neon.tech/docs
- Supabase Support: https://supabase.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs
- Prisma Docs: https://www.prisma.io/docs
