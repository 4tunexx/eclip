// Avatar Frame Cosmetics - Animated & Glowing

export interface AvatarFrame {
  id: string;
  name: string;
  description: string;
  border_color: string;
  border_width: number;
  border_style: 'solid' | 'dashed' | 'dotted' | 'double';
  shadow_color: string;
  animation_type: 'glow' | 'pulse' | 'rotate' | 'none';
  animation_speed: number; // 1-10 scale
  price: number; // In coins
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: 'cosmetic';
  is_vip?: boolean;
  vip_tier_required?: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'any';
}

export const AVATAR_FRAMES: AvatarFrame[] = [
  {
    id: 'frame_default',
    name: 'Default Frame',
    description: 'Simple and clean border frame.',
    border_color: '#9333ea',
    border_width: 4,
    border_style: 'solid',
    shadow_color: 'rgba(147, 51, 234, 0.5)',
    animation_type: 'none',
    animation_speed: 1,
    price: 0,
    rarity: 'common',
    category: 'cosmetic'
  },
  {
    id: 'frame_glow_blue',
    name: 'Electric Blue Glow',
    description: 'Animated glowing blue frame that pulses with energy!',
    border_color: '#3b82f6',
    border_width: 5,
    border_style: 'solid',
    shadow_color: 'rgba(59, 130, 246, 0.8)',
    animation_type: 'glow',
    animation_speed: 3,
    price: 200,
    rarity: 'uncommon',
    category: 'cosmetic'
  },
  {
    id: 'frame_pulse_rainbow',
    name: 'Rainbow Pulse',
    description: 'Vibrant rainbow frame that pulses with colors!',
    border_color: '#8b5cf6',
    border_width: 6,
    border_style: 'solid',
    shadow_color: 'rgba(139, 92, 246, 0.9)',
    animation_type: 'pulse',
    animation_speed: 4,
    price: 400,
    rarity: 'rare',
    category: 'cosmetic'
  },
  {
    id: 'frame_glow_gold',
    name: 'Golden Aura',
    description: 'Radiant golden glow that shines brightly!',
    border_color: '#fbbf24',
    border_width: 6,
    border_style: 'solid',
    shadow_color: 'rgba(251, 191, 36, 0.9)',
    animation_type: 'glow',
    animation_speed: 5,
    price: 600,
    rarity: 'epic',
    category: 'cosmetic'
  },
  {
    id: 'frame_rotate_neon',
    name: 'Neon Spinner',
    description: 'Rotating neon frame with electric colors!',
    border_color: '#10b981',
    border_width: 6,
    border_style: 'dashed',
    shadow_color: 'rgba(16, 185, 129, 0.9)',
    animation_type: 'rotate',
    animation_speed: 6,
    price: 800,
    rarity: 'epic',
    category: 'cosmetic'
  },
  {
    id: 'frame_legendary_aura',
    name: 'Legendary Aura',
    description: 'Ultimate animated frame with multiple effects!',
    border_color: '#ec4899',
    border_width: 8,
    border_style: 'double',
    shadow_color: 'rgba(236, 72, 153, 1)',
    animation_type: 'pulse',
    animation_speed: 7,
    price: 1200,
    rarity: 'legendary',
    category: 'cosmetic'
  },
  {
    id: 'frame_vip',
    name: 'VIP Exclusive Frame',
    description: 'Exclusive animated VIP frame with purple and gold glow! Only for VIP members.',
    border_color: '#a855f7',
    border_width: 8,
    border_style: 'solid',
    shadow_color: 'rgba(168, 85, 247, 1)',
    animation_type: 'glow',
    animation_speed: 8,
    price: 0,
    rarity: 'legendary',
    category: 'cosmetic',
    is_vip: true,
    vip_tier_required: 'any'
  }
];

// Helper function to get frame by ID
export function getFrameById(id: string): AvatarFrame | undefined {
  return AVATAR_FRAMES.find(frame => frame.id === id);
}

// Helper function to get default frame
export function getDefaultFrame(): AvatarFrame {
  return AVATAR_FRAMES[0];
}

// Get animation CSS class based on animation type
export function getFrameAnimationClass(frame: AvatarFrame): string {
  switch (frame.animation_type) {
    case 'glow':
      return `animate-glow-${Math.min(Math.max(frame.animation_speed, 1), 8)}`;
    case 'pulse':
      return 'animate-pulse';
    case 'rotate':
      return 'animate-spin-slow';
    default:
      return '';
  }
}

// Get frame style object for React
export function getFrameStyle(frame: AvatarFrame): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    borderColor: frame.border_color,
    borderWidth: `${frame.border_width}px`,
    borderStyle: frame.border_style,
    borderRadius: '50%', // CRITICAL: Make frame circular, not square!
    boxShadow: `0 0 ${20 * (frame.animation_speed / 5)}px ${frame.shadow_color}`,
  };

  if (frame.animation_type === 'glow') {
    return {
      ...baseStyle,
      animation: `glow-${frame.animation_speed} 2s ease-in-out infinite alternate`,
    };
  }

  return baseStyle;
}
