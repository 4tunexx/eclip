/**
 * Role Configuration
 * Centralized role definitions with colors and extras
 */

export const ROLE_CONFIG = {
  'USER': {
    color: '#808080',
    nickname: 'User',
    description: 'Standard user',
    icon: '👤',
    badge: false,
    priority: 1
  },
  'VIP': {
    color: '#FFD700',
    nickname: 'VIP',
    description: 'VIP Subscriber',
    icon: '👑',
    badge: true,
    priority: 3
  },
  'INSIDER': {
    color: '#87CEEB',
    nickname: 'Insider',
    description: 'Community Insider',
    icon: '🔍',
    badge: true,
    priority: 4
  },
  'MODERATOR': {
    color: '#FF8C00',
    nickname: 'Moderator',
    description: 'Community Moderator',
    icon: '🛡️',
    badge: true,
    priority: 5
  },
  'MOD': {
    color: '#FF8C00',
    nickname: 'Mod',
    description: 'Community Moderator',
    icon: '🛡️',
    badge: true,
    priority: 5
  },
  'ADMIN': {
    color: '#FF1493',
    nickname: 'Admin',
    description: 'Administrator',
    icon: '⚙️',
    badge: true,
    priority: 10
  }
};

export type UserRole = keyof typeof ROLE_CONFIG;

export function getRoleConfig(role: string) {
  const normalized = role.toUpperCase() as UserRole;
  return ROLE_CONFIG[normalized] || ROLE_CONFIG['USER'];
}

export function getRoleColor(role: string): string {
  return getRoleConfig(role).color;
}

export function getRoleNickname(role: string): string {
  return getRoleConfig(role).nickname;
}

export function hasRoleBadge(role: string): boolean {
  return getRoleConfig(role).badge;
}

export function getRolePriority(role: string): number {
  return getRoleConfig(role).priority;
}

/**
 * Get all available roles
 */
export function getAllRoles(): UserRole[] {
  return Object.keys(ROLE_CONFIG) as UserRole[];
}

/**
 * Get available roles for admin assignment (admin can assign these)
 */
export function getAssignableRoles(): UserRole[] {
  return ['USER', 'VIP', 'INSIDER', 'MODERATOR', 'ADMIN'];
}
