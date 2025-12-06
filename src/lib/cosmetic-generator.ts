/**
 * Code-based cosmetic generator
 * Generates SVG avatar frames, banners, and badges at runtime
 * No external images needed, fully CSS/SVG powered
 */

import sharp from 'sharp';

export interface FrameConfig {
  type: 'legendary' | 'epic' | 'rare' | 'common';
  username?: string;
}

export interface BannerConfig {
  type: 'legendary' | 'epic' | 'rare' | 'common';
  title: string;
  subtitle?: string;
}

/**
 * Generate SVG avatar frame as data URL
 */
export function generateAvatarFrameSVG(config: FrameConfig): string {
  const colors: Record<string, { border: string; glow: string; background: string }> = {
    legendary: {
      border: '#FFD700',
      glow: 'rgba(255, 215, 0, 0.4)',
      background: 'rgba(255, 215, 0, 0.1)',
    },
    epic: {
      border: '#9F7AEA',
      glow: 'rgba(159, 122, 234, 0.4)',
      background: 'rgba(159, 122, 234, 0.1)',
    },
    rare: {
      border: '#4299E1',
      glow: 'rgba(66, 153, 225, 0.4)',
      background: 'rgba(66, 153, 225, 0.1)',
    },
    common: {
      border: '#718096',
      glow: 'rgba(113, 128, 150, 0.3)',
      background: 'rgba(113, 128, 150, 0.05)',
    },
  };

  const c = colors[config.type];

  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap');
        </style>
      </defs>
      
      <!-- Background glow -->
      <circle cx="100" cy="100" r="95" fill="${c.background}" stroke="${c.border}" stroke-width="2" opacity="0.5"/>
      
      <!-- Main frame border -->
      <circle cx="100" cy="100" r="90" fill="none" stroke="${c.border}" stroke-width="3" filter="url(#glow)"/>
      
      <!-- Decorative elements -->
      <circle cx="100" cy="100" r="85" fill="none" stroke="${c.border}" stroke-width="1" opacity="0.3" stroke-dasharray="5,5"/>
      
      <!-- Corner accents for legendary -->
      ${
        config.type === 'legendary'
          ? `
        <rect x="15" y="15" width="20" height="3" fill="${c.border}" opacity="0.8"/>
        <rect x="15" y="15" width="3" height="20" fill="${c.border}" opacity="0.8"/>
        <rect x="165" y="15" width="20" height="3" fill="${c.border}" opacity="0.8"/>
        <rect x="182" y="15" width="3" height="20" fill="${c.border}" opacity="0.8"/>
        <rect x="15" y="182" width="20" height="3" fill="${c.border}" opacity="0.8"/>
        <rect x="15" y="165" width="3" height="20" fill="${c.border}" opacity="0.8"/>
        <rect x="165" y="182" width="20" height="3" fill="${c.border}" opacity="0.8"/>
        <rect x="182" y="165" width="3" height="20" fill="${c.border}" opacity="0.8"/>
      `
          : ''
      }
      
      <!-- Rarity text -->
      <text x="100" y="185" font-family="Inter, sans-serif" font-size="12" font-weight="700" text-anchor="middle" fill="${c.border}" opacity="0.7">
        ${config.type.toUpperCase()}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Generate banner as SVG data URL
 */
export function generateBannerSVG(config: BannerConfig): string {
  const colors: Record<string, { primary: string; secondary: string; accent: string }> = {
    legendary: {
      primary: '#FFD700',
      secondary: '#FFA500',
      accent: '#FF69B4',
    },
    epic: {
      primary: '#9F7AEA',
      secondary: '#6B46C1',
      accent: '#D6BCFA',
    },
    rare: {
      primary: '#4299E1',
      secondary: '#2B6CB0',
      accent: '#BEE3F8',
    },
    common: {
      primary: '#A0AEC0',
      secondary: '#718096',
      accent: '#E2E8F0',
    },
  };

  const c = colors[config.type];

  const svg = `
    <svg width="1200" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${c.secondary};stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:${c.primary};stop-opacity:0.7" />
        </linearGradient>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" seed="2"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2"/>
        </filter>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@700&display=swap');
          .banner-text { font-family: Lexend, sans-serif; font-weight: 700; fill: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
        </style>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="300" fill="url(#bg)" filter="url(#noise)"/>
      
      <!-- Accent lines -->
      <rect y="0" width="1200" height="3" fill="${c.primary}" opacity="0.8"/>
      <rect y="297" width="1200" height="3" fill="${c.primary}" opacity="0.8"/>
      
      <!-- Title -->
      <text x="60" y="120" class="banner-text" font-size="48">${config.title}</text>
      
      <!-- Subtitle -->
      ${
        config.subtitle
          ? `<text x="60" y="180" class="banner-text" font-size="24" opacity="0.9">${config.subtitle}</text>`
          : ''
      }
      
      <!-- Decorative corner accent -->
      <polygon points="1200,0 1200,100 1100,0" fill="${c.accent}" opacity="0.3"/>
      <polygon points="0,300 0,200 100,300" fill="${c.accent}" opacity="0.3"/>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Generate badge SVG
 */
export function generateBadgeSVG(config: { type: 'legendary' | 'epic' | 'rare' | 'common'; label: string }): string {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    legendary: { bg: '#FFD700', border: '#FF8C00', text: '#000' },
    epic: { bg: '#9F7AEA', border: '#6B46C1', text: '#FFF' },
    rare: { bg: '#4299E1', border: '#2B6CB0', text: '#FFF' },
    common: { bg: '#A0AEC0', border: '#718096', text: '#FFF' },
  };

  const c = colors[config.type];

  const svg = `
    <svg width="160" height="160" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow">
          <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.5"/>
        </filter>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap');
        </style>
      </defs>
      
      <!-- Star badge -->
      <g filter="url(#shadow)">
        <!-- Star shape -->
        <polygon points="80,10 100,50 145,55 115,85 125,130 80,105 35,130 45,85 15,55 60,50" fill="${c.bg}" stroke="${c.border}" stroke-width="2"/>
        <!-- Inner details -->
        <polygon points="80,25 95,50 120,52 105,65 112,90 80,70 48,90 55,65 40,52 65,50" fill="${c.text}" opacity="0.3"/>
      </g>
      
      <!-- Label below -->
      <text x="80" y="145" font-family="Inter, sans-serif" font-size="11" font-weight="700" text-anchor="middle" fill="${c.border}">
        ${config.label}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Generate default banner when none equipped
 */
export function getDefaultBannerDataUrl(): string {
  return generateBannerSVG({
    type: 'rare',
    title: 'Eclip.pro',
    subtitle: 'Competitive Counter-Strike 2 Platform',
  });
}

/**
 * Generate default avatar frame (common)
 */
export function getDefaultAvatarFrameDataUrl(): string {
  return generateAvatarFrameSVG({ type: 'common' });
}
