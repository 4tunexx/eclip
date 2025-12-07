/**
 * Code-based cosmetic generator
 * Generates SVG avatar frames, banners, and badges at runtime
 * No external images needed, fully CSS/SVG powered
 */

export interface FrameConfig {
  type: 'legendary' | 'epic' | 'rare' | 'common';
  username?: string;
  // Optional: Override with specific frame properties
  border_color?: string;
  border_width?: number;
  border_style?: 'solid' | 'dashed' | 'dotted' | 'double';
  shadow_color?: string;
  animation_type?: 'glow' | 'pulse' | 'rotate' | 'none';
  animation_speed?: number;
}

export interface BannerConfig {
  type: 'legendary' | 'epic' | 'rare' | 'common';
  title: string;
  subtitle?: string;
  // Optional: Override with specific gradient
  gradient?: string;
}

/**
 * Generate SVG avatar frame as data URL
 * Supports animation types: glow, pulse, rotate, none
 * Supports border styles: solid, dashed, dotted, double
 */
export function generateAvatarFrameSVG(config: FrameConfig): string {
  const styles: Record<string, any> = {
    legendary: {
      border: config.border_color || '#FFD700',
      glow: config.shadow_color || 'rgba(255, 215, 0, 0.5)',
      background: 'rgba(255, 215, 0, 0.15)',
      innerBorder: '#FFA500',
      width: config.border_width || 8,
      corners: true,
      stars: true,
    },
    epic: {
      border: config.border_color || '#A78BFA',
      glow: config.shadow_color || 'rgba(167, 139, 250, 0.4)',
      background: 'rgba(167, 139, 250, 0.12)',
      innerBorder: '#8B5CF6',
      width: config.border_width || 6,
      corners: true,
      stars: false,
    },
    rare: {
      border: config.border_color || '#60A5FA',
      glow: config.shadow_color || 'rgba(96, 165, 250, 0.35)',
      background: 'rgba(96, 165, 250, 0.1)',
      innerBorder: '#3B82F6',
      width: config.border_width || 5,
      corners: false,
      stars: false,
    },
    common: {
      border: config.border_color || '#9CA3AF',
      glow: config.shadow_color || 'rgba(156, 163, 175, 0.25)',
      background: 'rgba(156, 163, 175, 0.05)',
      innerBorder: '#6B7280',
      width: config.border_width || 4,
      corners: false,
      stars: false,
    },
  };

  const s = styles[config.type];
  const animationType = config.animation_type || 'none';
  const animationSpeed = config.animation_speed || 5;
  const borderStyle = config.border_style || 'solid';

  let cornerAccents = '';
  if (s.corners) {
    const cornerSize = config.type === 'legendary' ? 25 : 15;
    cornerAccents = `
      <!-- Top-left corner -->
      <rect x="8" y="8" width="${cornerSize}" height="2" fill="${s.border}" opacity="0.9"/>
      <rect x="8" y="8" width="2" height="${cornerSize}" fill="${s.border}" opacity="0.9"/>
      <!-- Top-right corner -->
      <rect x="${192 - cornerSize}" y="8" width="${cornerSize}" height="2" fill="${s.border}" opacity="0.9"/>
      <rect x="190" y="8" width="2" height="${cornerSize}" fill="${s.border}" opacity="0.9"/>
      <!-- Bottom-left corner -->
      <rect x="8" y="${192 - cornerSize}" width="${cornerSize}" height="2" fill="${s.border}" opacity="0.9"/>
      <rect x="8" y="190" width="2" height="${cornerSize}" fill="${s.border}" opacity="0.9"/>
      <!-- Bottom-right corner -->
      <rect x="${192 - cornerSize}" y="${192 - cornerSize}" width="${cornerSize}" height="2" fill="${s.border}" opacity="0.9"/>
      <rect x="190" y="190" width="2" height="${cornerSize}" fill="${s.border}" opacity="0.9"/>
    `;
  }

  let stars = '';
  if (s.stars) {
    stars = `
      <!-- Stars for legendary -->
      <polygon points="30,15 33,23 41,23 35,28 38,36 30,31 22,36 25,28 19,23 27,23" fill="${s.border}" opacity="0.8"/>
      <polygon points="170,20 173,28 181,28 175,33 178,41 170,36 162,41 165,33 159,28 167,28" fill="${s.border}" opacity="0.8"/>
      <polygon points="25,170 28,178 36,178 30,183 33,191 25,186 17,191 20,183 14,178 22,178" fill="${s.border}" opacity="0.8"/>
      <polygon points="175,165 178,173 186,173 180,178 183,186 175,181 167,186 170,178 164,173 172,173" fill="${s.border}" opacity="0.8"/>
    `;
  }

  // Animation definitions
  let animationDefs = '';
  if (animationType === 'glow') {
    const glowDuration = Math.max(1, 3 - (animationSpeed / 5));
    animationDefs = `
      <style>
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 ${10 + animationSpeed * 2}px ${s.glow}); }
          50% { filter: drop-shadow(0 0 ${20 + animationSpeed * 4}px ${s.border}); }
        }
        .animated-glow { animation: glow ${glowDuration}s ease-in-out infinite; }
      </style>
    `;
  } else if (animationType === 'pulse') {
    const pulseDuration = Math.max(1, 3 - (animationSpeed / 5));
    animationDefs = `
      <style>
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        .animated-pulse { animation: pulse ${pulseDuration}s ease-in-out infinite; transform-origin: center; }
      </style>
    `;
  } else if (animationType === 'rotate') {
    const rotateDuration = Math.max(2, 6 - (animationSpeed / 2));
    animationDefs = `
      <style>
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animated-rotate { animation: rotate ${rotateDuration}s linear infinite; transform-origin: center; }
      </style>
    `;
  }

  // Convert border style to SVG stroke-dasharray
  let strokeDasharray = 'none';
  if (borderStyle === 'dashed') {
    strokeDasharray = '10,5';
  } else if (borderStyle === 'dotted') {
    strokeDasharray = '2,3';
  } else if (borderStyle === 'double') {
    // Double border will be simulated with two circles
  }

  const animationClass = animationType !== 'none' ? `animated-${animationType}` : '';

  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="${config.type === 'legendary' ? 4 : 2.5}" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        ${config.type === 'legendary' ? `
        <radialGradient id="legendaryGrad" cx="50%" cy="30%">
          <stop offset="0%" style="stop-color:#FFED4E;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#FFD700;stop-opacity:0" />
        </radialGradient>
        ` : ''}
        ${animationDefs}
      </defs>
      
      <!-- Outer glow background -->
      <circle cx="100" cy="100" r="96" fill="${s.background}" opacity="0.7"/>
      ${config.type === 'legendary' ? '<circle cx="100" cy="100" r="96" fill="url(#legendaryGrad)"/>' : ''}
      
      <!-- Main border -->
      <circle cx="100" cy="100" r="90" fill="none" stroke="${s.border}" stroke-width="${s.width}" 
              stroke-dasharray="${strokeDasharray}" filter="url(#glow)" class="${animationClass}"/>
      
      ${borderStyle === 'double' ? `
      <!-- Double border effect -->
      <circle cx="100" cy="100" r="${90 - s.width - 2}" fill="none" stroke="${s.border}" stroke-width="${s.width / 2}" 
              opacity="0.6" class="${animationClass}"/>
      ` : ''}
      
      <!-- Inner accent border -->
      <circle cx="100" cy="100" r="${85 - s.width}" fill="none" stroke="${s.innerBorder}" stroke-width="1" opacity="0.4"/>
      
      <!-- Decorative circle pattern -->
      <circle cx="100" cy="100" r="80" fill="none" stroke="${s.border}" stroke-width="0.5" opacity="0.2" stroke-dasharray="3,3"/>
      
      ${cornerAccents}
      ${stars}
      
      <!-- Rarity label -->
      <text x="100" y="185" font-family="Inter, sans-serif" font-size="11" font-weight="700" text-anchor="middle" fill="${s.border}" opacity="0.6">
        ${config.type.toUpperCase()}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Generate banner as SVG data URL
 * Supports custom CSS gradients
 */
export function generateBannerSVG(config: BannerConfig): string {
  // If custom gradient provided, use it directly
  if (config.gradient) {
    const svg = `
      <svg width="360" height="80" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .banner-rect { background: ${config.gradient}; }
          </style>
        </defs>
        <foreignObject width="360" height="80">
          <div xmlns="http://www.w3.org/1999/xhtml" style="width: 360px; height: 80px; background: ${config.gradient}; display: flex; align-items: center; padding: 0 20px;">
            <div>
              <div style="font-family: Inter, sans-serif; font-size: 18px; font-weight: 700; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); letter-spacing: 0.5px;">
                ${config.title || 'Banner'}
              </div>
              ${config.subtitle ? `
                <div style="font-family: Inter, sans-serif; font-size: 12px; color: rgba(255,255,255,0.8); text-shadow: 1px 1px 2px rgba(0,0,0,0.3); margin-top: 4px;">
                  ${config.subtitle}
                </div>
              ` : ''}
            </div>
          </div>
        </foreignObject>
      </svg>
    `;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }

  // Otherwise use rarity-based styles
  const rarityStyles: Record<string, any> = {
    legendary: {
      gradientColor1: '#FFD700',
      gradientColor2: '#FFA500',
      accentColor: '#FFED4E',
      textColor: '#1a1a1a',
      pattern: true,
      particles: true,
      lines: 3,
    },
    epic: {
      gradientColor1: '#A78BFA',
      gradientColor2: '#7C3AED',
      accentColor: '#E0E7FF',
      textColor: '#FFFFFF',
      pattern: true,
      particles: false,
      lines: 2,
    },
    rare: {
      gradientColor1: '#60A5FA',
      gradientColor2: '#1D4ED8',
      accentColor: '#93C5FD',
      textColor: '#FFFFFF',
      pattern: false,
      particles: false,
      lines: 1,
    },
    common: {
      gradientColor1: '#9CA3AF',
      gradientColor2: '#4B5563',
      accentColor: '#E5E7EB',
      textColor: '#FFFFFF',
      pattern: false,
      particles: false,
      lines: 0,
    },
  };

  const style = rarityStyles[config.type];

  let patterns = '';
  let particles = '';
  let accentLines = '';

  if (style.pattern) {
    patterns = `
      <pattern id="diagonal" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="20" stroke="${style.accentColor}" stroke-width="1" opacity="0.1"/>
      </pattern>
      <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
        <circle cx="15" cy="15" r="2" fill="${style.accentColor}" opacity="0.08"/>
      </pattern>
    `;
  }

  if (style.particles) {
    particles = `
      <circle cx="40" cy="30" r="3" fill="${style.accentColor}" opacity="0.6"/>
      <circle cx="85" cy="35" r="2" fill="${style.accentColor}" opacity="0.5"/>
      <circle cx="320" cy="45" r="2.5" fill="${style.accentColor}" opacity="0.55"/>
      <circle cx="150" cy="28" r="1.5" fill="${style.accentColor}" opacity="0.4"/>
      <circle cx="280" cy="50" r="2" fill="${style.accentColor}" opacity="0.45"/>
    `;
  }

  if (style.lines >= 1) {
    accentLines += `<line x1="0" y1="15" x2="360" y2="15" stroke="${style.accentColor}" stroke-width="1" opacity="0.4"/>`;
  }
  if (style.lines >= 2) {
    accentLines += `<line x1="0" y1="65" x2="360" y2="65" stroke="${style.accentColor}" stroke-width="0.5" opacity="0.3"/>`;
  }
  if (style.lines >= 3) {
    accentLines += `
      <line x1="0" y1="55" x2="360" y2="55" stroke="${style.accentColor}" stroke-width="0.8" opacity="0.35"/>
      <line x1="0" y1="75" x2="360" y2="75" stroke="${style.accentColor}" stroke-width="0.6" opacity="0.25"/>
    `;
  }

  const svg = `
    <svg width="360" height="80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bannerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${style.gradientColor1};stop-opacity:1" />
          <stop offset="50%" style="stop-color:${style.gradientColor2};stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:${style.gradientColor2};stop-opacity:1" />
        </linearGradient>
        <linearGradient id="depthGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:white;stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:black;stop-opacity:0.15" />
        </linearGradient>
        ${patterns}
      </defs>

      <rect width="360" height="80" fill="url(#bannerGrad)"/>
      ${style.pattern ? `<rect width="360" height="80" fill="url(#diagonal)" opacity="0.15"/>
      <rect width="360" height="80" fill="url(#dots)" opacity="0.1"/>` : ''}
      ${accentLines}
      ${particles}
      <rect width="360" height="80" fill="url(#depthGrad)"/>
      
      <text x="20" y="28" font-family="Inter, sans-serif" font-size="18" font-weight="700" fill="black" opacity="0.2">
        ${config.title || 'Banner'}
      </text>
      <text x="18" y="26" font-family="Inter, sans-serif" font-size="18" font-weight="700" fill="${style.textColor}" letter-spacing="0.5">
        ${config.title || 'Banner'}
      </text>
      
      ${config.subtitle ? `
        <text x="20" y="50" font-family="Inter, sans-serif" font-size="12" fill="black" opacity="0.15">
          ${config.subtitle}
        </text>
        <text x="18" y="48" font-family="Inter, sans-serif" font-size="12" fill="${style.accentColor}" opacity="0.8">
          ${config.subtitle}
        </text>
      ` : ''}
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Generate badge SVG
 */
export function generateBadgeSVG(config: { type: 'legendary' | 'epic' | 'rare' | 'common'; label: string }): string {
  const rarityStyles: Record<string, any> = {
    legendary: {
      bg: '#FFD700',
      border: '#FF8C00',
      accent: '#FFED4E',
      text: '#000',
      glow: 4,
      innerRings: true,
      pattern: true,
    },
    epic: {
      bg: '#A78BFA',
      border: '#7C3AED',
      accent: '#E0E7FF',
      text: '#FFF',
      glow: 3,
      innerRings: true,
      pattern: false,
    },
    rare: {
      bg: '#60A5FA',
      border: '#1D4ED8',
      accent: '#93C5FD',
      text: '#FFF',
      glow: 2,
      innerRings: false,
      pattern: false,
    },
    common: {
      bg: '#9CA3AF',
      border: '#4B5563',
      accent: '#E5E7EB',
      text: '#FFF',
      glow: 1,
      innerRings: false,
      pattern: false,
    },
  };

  const s = rarityStyles[config.type];

  let innerRings = '';
  if (s.innerRings) {
    innerRings = `
      <circle cx="80" cy="80" r="65" fill="none" stroke="${s.accent}" stroke-width="1" opacity="0.3"/>
      <circle cx="80" cy="80" r="50" fill="none" stroke="${s.border}" stroke-width="0.5" opacity="0.2"/>
    `;
  }

  let pattern = '';
  if (s.pattern) {
    pattern = `
      <defs>
        <pattern id="starPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <polygon points="20,5 25,20 40,20 28,28 33,43 20,35 7,43 12,28 0,20 15,20" fill="${s.accent}" opacity="0.1"/>
        </pattern>
      </defs>
    `;
  }

  const svg = `
    <svg width="160" height="160" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="badgeShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="${s.glow}" flood-opacity="0.4"/>
        </filter>
        <radialGradient id="badgeGrad" cx="45%" cy="45%">
          <stop offset="0%" style="stop-color:${s.accent};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:${s.bg};stop-opacity:0" />
        </radialGradient>
        ${pattern}
      </defs>
      
      <!-- Outer glow circle -->
      <circle cx="80" cy="80" r="75" fill="${s.bg}" opacity="0.15" filter="url(#badgeShadow)"/>
      
      <!-- Main badge star -->
      <g filter="url(#badgeShadow)">
        <polygon points="80,10 100,50 145,55 115,85 125,130 80,105 35,130 45,85 15,55 60,50" fill="${s.bg}" stroke="${s.border}" stroke-width="2.5"/>
        <polygon points="80,25 95,50 120,52 105,65 112,90 80,70 48,90 55,65 40,52 65,50" fill="${s.accent}" opacity="0.4"/>
      </g>
      
      ${innerRings}
      ${s.pattern ? `<rect width="160" height="160" fill="url(#starPattern)"/>` : ''}
      
      <!-- Radial gradient overlay -->
      <circle cx="80" cy="80" r="75" fill="url(#badgeGrad)"/>
      
      <!-- Label -->
      <text x="80" y="145" font-family="Inter, sans-serif" font-size="11" font-weight="700" text-anchor="middle" fill="${s.border}">
        ${config.label.toUpperCase()}
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
