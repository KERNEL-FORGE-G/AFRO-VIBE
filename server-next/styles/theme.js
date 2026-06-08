// Afro Vibe UI Theme Configuration

export const COLORS = {
  background: '#13091B',     // Deep dark obsidian purple
  cardBackground: '#1F0E31', // Warm dark purple for cards/modals
  primary: '#FF5E00',        // Vibrant tribal orange
  secondary: '#E60067',      // Electric magenta/pink
  accent: '#FFAA00',         // Sun gold yellow
  text: '#FFFFFF',           // Crisp white for main content
  textSecondary: '#B3B3B3',  // Muted light grey for subtext
  border: '#2D1845',         // Subtle border purple
  success: '#00E676',        // Alert green
  error: '#FF1744',          // Alert red
  liveBadge: '#FF0055',      // Live indicator neon pink
  black: '#000000',
  glass: 'rgba(31, 14, 49, 0.7)',
};

export const GRADIENTS = {
  primary: [COLORS.primary, COLORS.secondary],      // Accent CTA buttons
  accent: [COLORS.accent, COLORS.primary],          // Plus button & Highlights
  dark: [COLORS.cardBackground, COLORS.background], // Page transitions
  traditional: ['#FF5E00', '#FFAA00', '#E60067'],   // Triple-blend tribal gradient
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  semibold: 'System',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  glow: {
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
};

export default {
  COLORS,
  GRADIENTS,
  FONTS,
  SPACING,
  SHADOWS,
};
