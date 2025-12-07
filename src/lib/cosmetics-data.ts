/**
 * Cosmetic Items Data
 * All frames, banners, and badges with code-generated SVG URLs
 */

export interface CosmeticItem {
  id: string;
  name: string;
  description: string;
  type: 'Frame' | 'Banner' | 'Badge';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  price: number;
  imageUrl: string;
}

const API_BASE = '/api/cosmetics/generate';

// FRAMES (Avatar border decorations)
export const FRAMES: CosmeticItem[] = [
  // Common Frames (100-200 coins)
  {
    id: 'frame-common-1',
    name: 'Classic Gold',
    description: 'Simple golden frame for beginners',
    type: 'Frame',
    rarity: 'Common',
    price: 100,
    imageUrl: `${API_BASE}/frame?rarity=common&username=Classic Gold`,
  },
  {
    id: 'frame-common-2',
    name: 'Neon Blue',
    description: 'Bright blue frame with soft glow',
    type: 'Frame',
    rarity: 'Common',
    price: 120,
    imageUrl: `${API_BASE}/frame?rarity=common&username=Neon Blue`,
  },
  {
    id: 'frame-common-3',
    name: 'Crystal Clear',
    description: 'Transparent crystal-style frame',
    type: 'Frame',
    rarity: 'Common',
    price: 150,
    imageUrl: `${API_BASE}/frame?rarity=common&username=Crystal Clear`,
  },
  {
    id: 'frame-common-4',
    name: 'Golden Glow',
    description: 'Warm golden radiance',
    type: 'Frame',
    rarity: 'Common',
    price: 180,
    imageUrl: `${API_BASE}/frame?rarity=common&username=Golden Glow`,
  },

  // Rare Frames (250-500 coins)
  {
    id: 'frame-rare-1',
    name: 'Royal Purple',
    description: 'Majestic purple frame fit for royalty',
    type: 'Frame',
    rarity: 'Rare',
    price: 300,
    imageUrl: `${API_BASE}/frame?rarity=rare&username=Royal Purple`,
  },
  {
    id: 'frame-rare-2',
    name: 'Emerald Green',
    description: 'Vibrant emerald with nature vibes',
    type: 'Frame',
    rarity: 'Rare',
    price: 350,
    imageUrl: `${API_BASE}/frame?rarity=rare&username=Emerald Green`,
  },
  {
    id: 'frame-rare-3',
    name: 'Dark Night',
    description: 'Mysterious dark frame with subtle shimmer',
    type: 'Frame',
    rarity: 'Rare',
    price: 400,
    imageUrl: `${API_BASE}/frame?rarity=rare&username=Dark Night`,
  },
  {
    id: 'frame-rare-4',
    name: 'Sunset Orange',
    description: 'Warm sunset gradient frame',
    type: 'Frame',
    rarity: 'Rare',
    price: 450,
    imageUrl: `${API_BASE}/frame?rarity=rare&username=Sunset Orange`,
  },

  // Epic Frames (600-1000 coins)
  {
    id: 'frame-epic-1',
    name: 'Ruby Red',
    description: 'Intense ruby red with fiery accents',
    type: 'Frame',
    rarity: 'Epic',
    price: 700,
    imageUrl: `${API_BASE}/frame?rarity=epic&username=Ruby Red`,
  },
  {
    id: 'frame-epic-2',
    name: 'Sapphire Blue',
    description: 'Deep sapphire with oceanic depth',
    type: 'Frame',
    rarity: 'Epic',
    price: 800,
    imageUrl: `${API_BASE}/frame?rarity=epic&username=Sapphire Blue`,
  },
  {
    id: 'frame-epic-3',
    name: 'Cosmic Purple',
    description: 'Galaxy-inspired purple frame',
    type: 'Frame',
    rarity: 'Epic',
    price: 900,
    imageUrl: `${API_BASE}/frame?rarity=epic&username=Cosmic Purple`,
  },

  // Legendary Frames (1200-2000 coins)
  {
    id: 'frame-legendary-1',
    name: 'Silver Storm',
    description: 'Premium silver frame with lightning effects',
    type: 'Frame',
    rarity: 'Legendary',
    price: 1500,
    imageUrl: `${API_BASE}/frame?rarity=legendary&username=Silver Storm`,
  },
  {
    id: 'frame-legendary-2',
    name: 'Diamond Elite',
    description: 'Exclusive diamond-encrusted frame',
    type: 'Frame',
    rarity: 'Legendary',
    price: 1800,
    imageUrl: `${API_BASE}/frame?rarity=legendary&username=Diamond Elite`,
  },
  {
    id: 'frame-legendary-3',
    name: 'Immortal Champion',
    description: 'The ultimate frame for champions',
    type: 'Frame',
    rarity: 'Legendary',
    price: 2000,
    imageUrl: `${API_BASE}/frame?rarity=legendary&username=Immortal`,
  },
];

// BANNERS (Profile background decorations)
export const BANNERS: CosmeticItem[] = [
  // Common Banners (100-200 coins)
  {
    id: 'banner-common-1',
    name: 'Mountains Banner',
    description: 'Peaceful mountain landscape',
    type: 'Banner',
    rarity: 'Common',
    price: 100,
    imageUrl: `${API_BASE}/banner?rarity=common&title=Mountains Banner`,
  },
  {
    id: 'banner-common-2',
    name: 'Ocean Banner',
    description: 'Calm ocean waves background',
    type: 'Banner',
    rarity: 'Common',
    price: 120,
    imageUrl: `${API_BASE}/banner?rarity=common&title=Ocean Banner`,
  },
  {
    id: 'banner-common-3',
    name: 'Forest Banner',
    description: 'Dense forest scenery',
    type: 'Banner',
    rarity: 'Common',
    price: 150,
    imageUrl: `${API_BASE}/banner?rarity=common&title=Forest Banner`,
  },
  {
    id: 'banner-common-4',
    name: 'Fire Banner',
    description: 'Blazing flames background',
    type: 'Banner',
    rarity: 'Common',
    price: 180,
    imageUrl: `${API_BASE}/banner?rarity=common&title=Fire Banner`,
  },
  {
    id: 'banner-common-5',
    name: 'Thunder Banner',
    description: 'Storm clouds with lightning',
    type: 'Banner',
    rarity: 'Common',
    price: 150,
    imageUrl: `${API_BASE}/banner?rarity=common&title=Thunder Banner`,
  },
  {
    id: 'banner-common-6',
    name: 'Ice Banner',
    description: 'Frozen tundra landscape',
    type: 'Banner',
    rarity: 'Common',
    price: 140,
    imageUrl: `${API_BASE}/banner?rarity=common&title=Ice Banner`,
  },
  {
    id: 'banner-common-7',
    name: 'Abstract Banner',
    description: 'Modern abstract patterns',
    type: 'Banner',
    rarity: 'Common',
    price: 120,
    imageUrl: `${API_BASE}/banner?rarity=common&title=Abstract Banner`,
  },
  {
    id: 'banner-common-8',
    name: 'Geometric Banner',
    description: 'Clean geometric shapes',
    type: 'Banner',
    rarity: 'Common',
    price: 130,
    imageUrl: `${API_BASE}/banner?rarity=common&title=Geometric Banner`,
  },
  {
    id: 'banner-common-9',
    name: 'Gradient Banner',
    description: 'Smooth color gradient',
    type: 'Banner',
    rarity: 'Common',
    price: 110,
    imageUrl: `${API_BASE}/banner?rarity=common&title=Gradient Banner`,
  },

  // Rare Banners (250-500 coins)
  {
    id: 'banner-rare-1',
    name: 'City Banner',
    description: 'Cyberpunk cityscape',
    type: 'Banner',
    rarity: 'Rare',
    price: 300,
    imageUrl: `${API_BASE}/banner?rarity=rare&title=City Banner`,
  },
  {
    id: 'banner-rare-2',
    name: 'Desert Banner',
    description: 'Golden desert dunes',
    type: 'Banner',
    rarity: 'Rare',
    price: 350,
    imageUrl: `${API_BASE}/banner?rarity=rare&title=Desert Banner`,
  },
  {
    id: 'banner-rare-3',
    name: 'Cyberpunk Banner',
    description: 'Neon-lit futuristic city',
    type: 'Banner',
    rarity: 'Rare',
    price: 400,
    imageUrl: `${API_BASE}/banner?rarity=rare&title=Cyberpunk Banner`,
  },
  {
    id: 'banner-rare-4',
    name: 'Sakura Banner',
    description: 'Japanese cherry blossom trees',
    type: 'Banner',
    rarity: 'Rare',
    price: 450,
    imageUrl: `${API_BASE}/banner?rarity=rare&title=Sakura Banner`,
  },
  {
    id: 'banner-rare-5',
    name: 'Marble Banner',
    description: 'Luxurious marble texture',
    type: 'Banner',
    rarity: 'Rare',
    price: 380,
    imageUrl: `${API_BASE}/banner?rarity=rare&title=Marble Banner`,
  },
  {
    id: 'banner-rare-6',
    name: 'Wood Banner',
    description: 'Natural wooden texture',
    type: 'Banner',
    rarity: 'Rare',
    price: 320,
    imageUrl: `${API_BASE}/banner?rarity=rare&title=Wood Banner`,
  },

  // Epic Banners (600-1000 coins)
  {
    id: 'banner-epic-1',
    name: 'Galaxy Banner',
    description: 'Stunning cosmic nebula',
    type: 'Banner',
    rarity: 'Epic',
    price: 700,
    imageUrl: `${API_BASE}/banner?rarity=epic&title=Galaxy Banner`,
  },
  {
    id: 'banner-epic-2',
    name: 'Retro Banner',
    description: 'Synthwave aesthetic',
    type: 'Banner',
    rarity: 'Epic',
    price: 800,
    imageUrl: `${API_BASE}/banner?rarity=epic&title=Retro Banner`,
  },
  {
    id: 'banner-epic-3',
    name: 'Metal Banner',
    description: 'Industrial metal texture',
    type: 'Banner',
    rarity: 'Epic',
    price: 900,
    imageUrl: `${API_BASE}/banner?rarity=epic&title=Metal Banner`,
  },

  // Legendary Banners (1200-2000 coins)
  {
    id: 'banner-legendary-1',
    name: 'Aurora Banner',
    description: 'Northern lights phenomenon',
    type: 'Banner',
    rarity: 'Legendary',
    price: 1500,
    imageUrl: `${API_BASE}/banner?rarity=legendary&title=Aurora Banner`,
  },
  {
    id: 'banner-legendary-2',
    name: 'Neon Banner',
    description: 'Electric neon animation',
    type: 'Banner',
    rarity: 'Legendary',
    price: 1800,
    imageUrl: `${API_BASE}/banner?rarity=legendary&title=Neon Banner`,
  },
  {
    id: 'banner-legendary-3',
    name: 'Dragon Fire Banner',
    description: 'Mythical dragon with flames',
    type: 'Banner',
    rarity: 'Legendary',
    price: 2000,
    imageUrl: `${API_BASE}/banner?rarity=legendary&title=Dragon Fire`,
  },
];

// BADGES (Achievement/Status icons)
export const BADGES: CosmeticItem[] = [
  {
    id: 'badge-common-1',
    name: 'First Win',
    description: 'Badge for winning your first match',
    type: 'Badge',
    rarity: 'Common',
    price: 50,
    imageUrl: `${API_BASE}/badge?rarity=common&label=First Win`,
  },
  {
    id: 'badge-rare-1',
    name: 'Ace Player',
    description: 'Achieved an ace in competitive',
    type: 'Badge',
    rarity: 'Rare',
    price: 250,
    imageUrl: `${API_BASE}/badge?rarity=rare&label=Ace`,
  },
  {
    id: 'badge-epic-1',
    name: 'Pro League 2024',
    description: 'Participated in Pro League',
    type: 'Badge',
    rarity: 'Epic',
    price: 500,
    imageUrl: `${API_BASE}/badge?rarity=epic&label=Pro League`,
  },
  {
    id: 'badge-legendary-1',
    name: 'Champion',
    description: 'Tournament champion badge',
    type: 'Badge',
    rarity: 'Legendary',
    price: 1000,
    imageUrl: `${API_BASE}/badge?rarity=legendary&label=Champion`,
  },
  {
    id: 'badge-legendary-2',
    name: 'Immortal',
    description: 'Reached Immortal rank',
    type: 'Badge',
    rarity: 'Legendary',
    price: 1500,
    imageUrl: `${API_BASE}/badge?rarity=legendary&label=Immortal`,
  },
  {
    id: 'badge-legendary-3',
    name: 'Elite Master',
    description: 'Elite tier achievement',
    type: 'Badge',
    rarity: 'Legendary',
    price: 1200,
    imageUrl: `${API_BASE}/badge?rarity=legendary&label=Elite`,
  },
];

// All cosmetics combined
export const ALL_COSMETICS: CosmeticItem[] = [
  ...FRAMES,
  ...BANNERS,
  ...BADGES,
];

// Get cosmetics by type
export function getCosmeticsByType(type: 'Frame' | 'Banner' | 'Badge'): CosmeticItem[] {
  return ALL_COSMETICS.filter((item) => item.type === type);
}

// Get cosmetics by rarity
export function getCosmeticsByRarity(rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'): CosmeticItem[] {
  return ALL_COSMETICS.filter((item) => item.rarity === rarity);
}

// Get cosmetic by ID
export function getCosmeticById(id: string): CosmeticItem | undefined {
  return ALL_COSMETICS.find((item) => item.id === id);
}
