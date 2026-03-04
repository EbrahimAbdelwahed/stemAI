export const designTokens = {
  // Spacing scale (based on 8px grid)
  spacing: {
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem',  // 8px
    3: '0.75rem', // 12px
    4: '1rem',    // 16px
    5: '1.25rem', // 20px
    6: '1.5rem',  // 24px
    8: '2rem',    // 32px
    10: '2.5rem', // 40px
    12: '3rem',   // 48px
    16: '4rem',   // 64px
    20: '5rem',   // 80px
    24: '6rem',   // 96px
  },

  // Typography scale
  typography: {
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
    },
  },

  // Color semantic tokens
  colors: {
    primary: {
      50: 'hsl(213, 100%, 97%)',
      100: 'hsl(213, 100%, 94%)',
      500: 'hsl(213, 94%, 68%)',
      600: 'hsl(213, 94%, 60%)',
      700: 'hsl(213, 84%, 52%)',
      900: 'hsl(213, 94%, 20%)',
    },
    success: {
      500: 'hsl(142, 76%, 36%)',
      600: 'hsl(142, 76%, 30%)',
    },
    warning: {
      500: 'hsl(38, 92%, 50%)',
      600: 'hsl(38, 92%, 45%)',
    },
    error: {
      500: 'hsl(0, 84%, 60%)',
      600: 'hsl(0, 84%, 54%)',
    },
  },

  // Border radius scale
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },

  // Box shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    glow: '0 0 20px rgb(59 130 246 / 0.15)',
    glowHover: '0 0 30px rgb(59 130 246 / 0.25)',
  },

  // Animation durations and easings
  animation: {
    durations: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
    },
    easings: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },
  },

  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const;

// Type helpers for TypeScript
export type SpacingToken = keyof typeof designTokens.spacing;
export type FontSizeToken = keyof typeof designTokens.typography.fontSizes;
export type ColorToken = keyof typeof designTokens.colors;
export type BorderRadiusToken = keyof typeof designTokens.borderRadius;
export type ShadowToken = keyof typeof designTokens.shadows; 