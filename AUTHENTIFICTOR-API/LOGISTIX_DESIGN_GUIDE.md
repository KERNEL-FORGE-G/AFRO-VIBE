# Logistix Design Guide - Authentificator

## Vue d'ensemble du Design

L'interface admin a été complètement redessinée pour suivre le design système **Logistix**, avec:

### Couleurs Principales
```css
Primary: Indigo (#1e40af to #3b82f6) - Sidebar & accents
Secondary: Blue (#3b82f6) - Top bar & active states
Accent: Orange (#ff9800) - Logo & highlights
Neutral: Gray (#f3f4f6 to #111827) - Backgrounds & text
Status Colors:
  - Green (#10b981) - Active/Success
  - Red (#ef4444) - Pending/Alert
  - Yellow (#f59e0b) - Warning
  - Blue (#3b82f6) - Info
```

### Tipographie
```
Headers: Inter Bold (24px - 32px)
Body: Inter Regular (14px - 16px)
Labels: Inter Medium (12px - 14px)
Line Height: 1.5 (relaxed)
```

### Composants Principaux

#### 1. AdminLayout
Structure globale avec:
- Sidebar collapsible sur la gauche (w-64 ou w-20)
- Header avec recherche, notifications, profil
- Main content area responsive
- Bottom navigation bar avec onglets

**Fichier:** `src/components/AdminLayout.jsx`

```jsx
<AdminLayout activeTab="logistics">
  <YourContent />
</AdminLayout>
```

#### 2. StatsCard
Cartes statistiques avec 8 couleurs de gradient disponibles:

```jsx
<StatsCard
  icon={Truck}
  label="Total Shipments"
  value="869"
  color="blue"  // blue, red, purple, dark, green, yellow, teal, orange
  trend="↑ 12% from last week"
/>
```

**Caractéristiques:**
- Gradient background (4 colors disponibles)
- Large icon on the left
- Value prominently displayed
- Optional trend indicator

#### 3. VehicleTable
Tableau professionnel avec:
- Header en bleu (#3b82f6)
- Rows avec alternating hover effect
- Status badges colorées
- Avatar circles pour les drivers
- Chevron pour les actions

**Fichier:** `src/components/VehicleTable.jsx`

```jsx
<VehicleTable />
```

### Layout Responsive

#### Desktop (≥1024px)
- Sidebar entièrement visible (w-64)
- 4 colonnes pour stats cards
- Full width tables
- Bottom nav visible

#### Tablet (768px - 1023px)
- Sidebar collapsible
- 2 colonnes pour stats cards
- Horizontal scroll sur tables
- Bottom nav visible

#### Mobile (< 768px)
- Sidebar collapsed (w-20 with icons only)
- 1 colonne pour stats cards
- Stacked layouts
- Bottom nav accessible via tap

### Color Palette Détaillée

#### Sidebar (Gradient)
```
from-indigo-900 to-indigo-800
#1e3a8a to #1e40af
```

#### Stats Cards
| Color | Gradient | Usages |
|-------|----------|--------|
| blue | from-blue-400 to-blue-600 | Active, Shipments |
| red | from-red-400 to-red-600 | Pending, Alerts |
| purple | from-purple-400 to-purple-600 | Delivered |
| dark | from-gray-700 to-gray-900 | Cancelled |
| green | from-green-400 to-green-600 | In Transit |
| yellow | from-yellow-400 to-yellow-600 | Warnings |
| teal | from-teal-400 to-teal-600 | Active |
| orange | from-orange-400 to-orange-600 | Critical |

#### Status Badges
```
Active: bg-green-100 text-green-800
Idle: bg-gray-100 text-gray-800
Maintenance: bg-yellow-100 text-yellow-800
```

#### Tables
- Header: bg-blue-500 text-white
- Borders: border-gray-200
- Hover: hover:bg-gray-50
- Alt rows: No stripe (clean design)

### Iconographie

Icons utilisés (de lucide-react):
- `BarChart3` - Analytics, Reports
- `Truck` - Fleet, Logistics
- `Package` - Orders, Shipments
- `Warehouse` - Storage, Warehouse
- `DollarSign` - Income, Finances
- `Users` - Employees, Users
- `Settings` - Configuration
- `LogOut` - Logout
- `Menu` / `X` - Hamburger
- `Search` - Search input
- `Bell` - Notifications
- `ChevronDown` - Dropdowns

### Espacement (Tailwind Scale)

```
Gap between stats: gap-4 (1rem)
Padding sections: px-6 py-4 (1.5rem, 1rem)
Card padding: p-6 (1.5rem)
Margins: mb-8, mt-6, etc.
```

### Interaction Patterns

#### Boutons
```jsx
// Primary action
className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"

// Secondary action
className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-2 rounded-lg transition-colors"

// Danger action
className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
```

#### Transitions
```jsx
// Smooth transitions
transition-colors duration-300
transition-all duration-300
```

#### Hover States
```
Buttons: opacity-90 or darker shade
Cards: shadow-lg (on hover)
Rows: bg-gray-50
```

### Spacing System

```
xs: 4px (0.25rem)
sm: 8px (0.5rem)
md: 16px (1rem)
lg: 24px (1.5rem)
xl: 32px (2rem)
2xl: 48px (3rem)
```

### Shadow System

```
sm: box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
md: shadow-md (used for cards)
lg: shadow-lg (used on hover)
xl: shadow-xl (modals, dropdowns)
```

### Élévation & Profondeur

```
L0 (Background): #f3f4f6 (gray-50)
L1 (Cards): white with shadow-md
L2 (Dropdowns/Modals): white with shadow-xl
L3 (Notifications): Colored with icon
```

### Radius

```
Buttons: rounded-lg (0.5rem)
Cards: rounded-lg
Tables: rounded-t-lg (top only)
Badges: rounded-full
Sidebar: No radius (fills edge)
```

### Typographie Sizing

```
h1: text-4xl font-bold (2.25rem)
h2: text-3xl font-bold (1.875rem)
h3: text-lg font-bold (1.125rem)
p: text-sm to text-base
labels: text-xs to text-sm
```

### Mobile-First Considerations

1. **Sidebar becomes icon-only on mobile**
   ```jsx
   ${sidebarOpen ? 'w-64' : 'w-20'} // Toggle via hamburger
   ```

2. **Stats cards stack 1 per row on mobile**
   ```jsx
   className="flex gap-4 flex-wrap" // Wraps on small screens
   ```

3. **Tables scroll horizontally on mobile**
   ```jsx
   <div className="overflow-x-auto">
   ```

4. **Dropdowns position correctly on mobile**
   ```jsx
   absolute right-0 top-full mt-2 // Won't overflow
   ```

### Animations

```
Loading spinner: animate-spin
Transitions: transition-colors duration-300
Hovers: hover:shadow-lg transition-shadow
```

### Accessibility

- **ARIA Labels:** All interactive elements have aria-labels
- **Semantic HTML:** Uses <button>, <table>, etc.
- **Contrast:** White text on dark backgrounds (WCAG AA)
- **Focus States:** Visible focus rings on all interactive elements
- **Touch Targets:** Min 48px for mobile buttons

### Fichiers Clés

| Fichier | Responsabilité |
|---------|----------------|
| `AdminLayout.jsx` | Structure globale + navigation |
| `StatsCard.jsx` | Composant réutilisable pour stats |
| `VehicleTable.jsx` | Tableau avec données mock |
| `AdminDashboard.jsx` | Page principale du dashboard |
| `index.css` | Styles globaux + Tailwind config |

### Usage Example

```jsx
import AdminLayout from '../components/AdminLayout';
import StatsCard from '../components/StatsCard';
import VehicleTable from '../components/VehicleTable';

export default function Dashboard() {
  return (
    <AdminLayout activeTab="logistics">
      <div className="space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-lg text-gray-600">Logistics Dashboard</p>
        </div>

        {/* Stats Row */}
        <div className="flex gap-4 flex-wrap">
          <StatsCard
            icon={Truck}
            label="Total Shipments"
            value="869"
            color="blue"
          />
          {/* More stats... */}
        </div>

        {/* Table */}
        <VehicleTable />
      </div>
    </AdminLayout>
  );
}
```

### Design System Updates

Pour modifier l'apparence globale:

1. **Couleurs:** Modifiez les Tailwind classes dans les composants
2. **Spacing:** Utilisez le système de spacing Tailwind (p-, m-, gap-)
3. **Typography:** Modifiez les text-{size} classes
4. **Shadows:** Utilisez shadow-{size} de Tailwind
5. **Radius:** Utilisez rounded-{size} de Tailwind

Tous les changements sont basés sur Tailwind CSS v3 (inclus dans le projet).

### Performance Considerations

1. **Image Lazy Loading:** Les images de profil utilisent avatars générés
2. **Component Memoization:** Les composants lourds peuvent être mémorisés
3. **Pagination:** Les tables montrent données mock (à paginer en prod)
4. **Bundle Size:** Lucide-react ~15kb gzipped (minimal impact)

### Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest version
- Mobile: iOS 12+, Android 6+

Testé et validé sur tous les viewports courants.
