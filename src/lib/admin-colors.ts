/**
 * Admin panel color scheme - Lucide-inspired monochrome with subtle accents
 * Uses only primary color and grayscale for consistency
 */

export const ADMIN_COLORS = {
  // Primary accent (matches website primary)
  accent: 'hsl(var(--primary))',
  accentLight: 'hsl(var(--primary) / 0.1)',
  accentDark: 'hsl(var(--primary) / 0.8)',

  // Semantic colors (functional, not decorative)
  success: '#10B981', // Emerald - only for positive actions
  warning: '#F59E0B', // Amber - only for caution
  danger: '#EF4444', // Red - only for destructive
  info: 'hsl(var(--primary))', // Primary - for info

  // Grayscale (monochrome, Lucide-style)
  bg: {
    primary: 'hsl(var(--background))',
    secondary: 'hsl(var(--secondary))',
    tertiary: 'hsl(var(--card))',
    hover: 'hsl(var(--accent))',
  },

  text: {
    primary: 'hsl(var(--foreground))',
    secondary: 'hsl(var(--muted-foreground))',
    muted: 'hsl(var(--muted-foreground) / 0.6)',
  },

  border: {
    light: 'hsl(var(--border) / 0.3)',
    normal: 'hsl(var(--border))',
    strong: 'hsl(var(--border) / 1.5)',
  },
};

export const RARITY_COLORS = {
  COMMON: {
    bg: '#6B7280', // Gray
    text: '#F3F4F6',
    border: '#4B5563',
  },
  RARE: {
    bg: '#3B82F6', // Blue
    text: '#FFFFFF',
    border: '#1E40AF',
  },
  EPIC: {
    bg: '#8B5CF6', // Purple
    text: '#FFFFFF',
    border: '#5B21B6',
  },
  LEGENDARY: {
    bg: '#FBBF24', // Amber
    text: '#000000',
    border: '#D97706',
  },
};

export function getRarityClass(rarity: string): string {
  const classes: Record<string, string> = {
    COMMON: 'bg-gray-600 text-gray-100 border-gray-700',
    RARE: 'bg-blue-600 text-white border-blue-700',
    EPIC: 'bg-purple-600 text-white border-purple-700',
    LEGENDARY: 'bg-yellow-500 text-black border-yellow-600',
  };
  return classes[rarity] || classes.COMMON;
}
