/**
 * Role color system for eclip.pro
 * Colors match specification for visual role identification
 */

export const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#FF3B30',       // Red
  MOD: '#34C759',         // Green
  MODERATOR: '#34C759',   // Green alias
  INSIDER: '#FF9500',     // Orange
  VIP: '#AF52DE',         // Purple
  USER: '#8E8E93',        // Gray (normal user)
};

export const ROLE_BG_COLORS: Record<string, string> = {
  ADMIN: '#FFE5E3',       // Light red
  MOD: '#E8F9F0',         // Light green
  MODERATOR: '#E8F9F0',   // Light green alias
  INSIDER: '#FFF4E8',     // Light orange
  VIP: '#F3E8FF',         // Light purple
  USER: '#F3F3F6',        // Light gray
};

/**
 * Get role color (hex code)
 */
export function getRoleColor(role?: string): string {
  if (!role) return ROLE_COLORS.USER;
  const normalizedRole = role.toUpperCase();
  return ROLE_COLORS[normalizedRole] || ROLE_COLORS.USER;
}

/**
 * Get role background color (hex code)
 */
export function getRoleBgColor(role?: string): string {
  if (!role) return ROLE_BG_COLORS.USER;
  const normalizedRole = role.toUpperCase();
  return ROLE_BG_COLORS[normalizedRole] || ROLE_BG_COLORS.USER;
}

/**
 * Get role label
 */
export function getRoleLabel(role?: string): string {
  if (!role) return 'User';
  const labels: Record<string, string> = {
    ADMIN: '🛡️ Admin',
    MOD: '🔨 Moderator',
    MODERATOR: '🔨 Moderator',
    INSIDER: '⭐ Insider',
    VIP: '👑 VIP',
    USER: 'User',
  };
  return labels[role.toUpperCase()] || 'User';
}
