# Design System et Stylisation

L'identité visuelle d'**Afro Vibe** est centrée sur une esthétique "Afro-Futuriste" combinant des tons sombres profonds et des couleurs tribales vives.

## 🎨 Palette de Couleurs (`COLORS`)

Le thème est principalement sombre pour faire ressortir les vidéos.

- **Fond :** `#13091B` (Violet profond)
- **Primaire (Accent) :** `#FF5E00` (Orange tribal)
- **Secondaire :** `#E60067` (Magenta électrique)
- **Accent (Or) :** `#FFAA00` (Jaune solaire)
- **Texte :** `#FFFFFF` (Blanc pur) et `#B3B3B3` (Gris clair pour le texte secondaire).

---

## 🌈 Dégradés (`GRADIENTS`)

L'application utilise des dégradés pour les éléments interactifs importants :
- **Primary :** Du orange au magenta (Utilisé pour les boutons d'appel à l'action).
- **Accent :** De l'or à l'orange (Utilisé pour le bouton "Plus" et les highlights).
- **Traditional :** Un mélange triple (Orange, Or, Magenta) pour un rendu vibrant.

---

## 📏 Espacement (`SPACING`)

Une échelle standardisée est utilisée pour maintenir la cohérence :
- `xs` : 4px
- `sm` : 8px
- `md` : 16px (Marge standard)
- `lg` : 24px
- `xl` : 32px

---

## ✨ Effets Visuels

### Ombres et Lueurs (`SHADOWS`)
- **Light :** Une ombre subtile pour décoller les éléments.
- **Glow :** Un effet de lueur colorée (magenta) utilisé pour les badges "Live" ou les éléments en cours d'interaction.

### Motifs Tribaux
Le composant `TribalPattern.js` génère des motifs SVG répétitifs utilisés en arrière-plan de certains écrans (comme `WelcomeScreen`) pour renforcer l'identité culturelle du projet.

---

## 📱 Composants UI Dédiés

- **Skeleton Loader :** Utilisé pendant le chargement des données (`FeedSkeleton`, `ProfileSkeleton`).
- **Toast personnalisé :** Un système de notification intra-app géré par `toastManager.js` pour informer l'utilisateur sans interrompre son flux.
