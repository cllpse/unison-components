/**
 * A map of [tailwind unit, pixel value] representing a subset of supported tailwind units.
 */
export const UNITS = {
  /**
   * 0, 0rem, 0px
   */
  0: 0,

  /**
   * px, 1px
   */
  px: 1,

  /**
   * 1px
   * @deprecated Use `px` instead.
   */
  "1px": 1,

  /**
   * 05, 0.125rem, 2px
   * @deprecated Use `0p5` instead.
   */
  "05": 2,

  /**
   * 0p5, 0.125rem, 2px
   */
  "0p5": 2,

  /**
   * 1, 0.25rem, 4px
   */
  1: 4,

  /**
   * 1p5, 0.375rem, 6px
   */
  "1p5": 6,

  /**
   * 2, 0.5rem, 8px
   */
  2: 8,

  /**
   * 2p5, 0.625rem, 10px
   */
  "2p5": 10,

  /**
   * 3, 0.75rem, 12px
   */
  3: 12,

  /**
   * 3p5, 0.875rem, 14px
   */
  "3p5": 14,

  /**
   * 4, 1rem, 16px
   */
  4: 16,

  /**
   * 5, 1.25rem, 20px
   */
  5: 20,

  /**
   * 6, 1.5rem, 24px
   */
  6: 24,

  /**
   * 7, 1.75rem, 28px
   */
  7: 28,

  /**
   * 8, 2rem, 32px
   */
  8: 32,

  /**
   * 9, 2.25rem, 36px
   */
  9: 36,

  /**
   * 10, 2.5rem, 40px
   */
  10: 40,

  /**
   * 11, 2.75rem, 44px
   */
  11: 44,

  /**
   * 12, 3rem, 48px
   */
  12: 48,

  /**
   * 14, 3.5rem, 56px
   */
  14: 56,

  /**
   * 16, 4rem, 64px
   */
  16: 64,

  /**
   * 20, 5rem, 80px
   */
  20: 80,

  /**
   * 24, 6rem, 96px
   */
  24: 96,

  /**
   * 28, 7rem, 112px
   */
  28: 112,

  /**
   * 32, 8rem, 128px
   */
  32: 128,

  /**
   * 36, 9rem, 144px
   */
  36: 144,

  /**
   * 40, 10rem, 160px
   */
  40: 160,

  /**
   * 44, 11rem, 176px
   */
  44: 176,

  /**
   * 48, 12rem, 192px
   */
  48: 192,

  /**
   * 52, 13rem, 208px
   */
  52: 208,

  /**
   * 56, 14rem, 224px
   */
  56: 224,

  /**
   * 60, 15rem, 240px
   */
  60: 240,

  /**
   * 64, 16rem, 256px
   */
  64: 256,

  /**
   * 72, 18rem, 288px
   */
  72: 288,

  /**
   * 80, 20rem, 320px
   */
  80: 320,

  /**
   * 96, 24rem, 384px
   */
  96: 384,

  /**
   * 999px
   */
  full: 999,
} as const

/**
 * Tailwind spacing suffixes for keys that differ from their key: fractional keys spell the dot as `p`, which a Tailwind
 * class can't use, and deprecated keys point at their replacement.
 * @example `p-${UNITS_TAILWIND[key] ?? key}` // "1p5" → "p-1.5", "4" → "p-4"
 */
export const UNITS_TAILWIND: Partial<Record<keyof typeof UNITS, string>> = {
  "1px": "px",
  "05": "0.5",
  "0p5": "0.5",
  "1p5": "1.5",
  "2p5": "2.5",
  "3p5": "3.5",
}

export const UNITS_FIGMA = {
  /**
   * Represents a fill dimension (width or height) that should fill the available space.
   */
  fill: "fill",

  /**
   * Represents a hug dimension (width or height) that should hug the content.
   */
  hug: "hug",
} as const

/**
 * Tailwind's default border radius scale, as [Tailwind suffix, pixel value]. Radius has its own names in Tailwind
 * (`rounded-lg`, not `rounded-2`), so it doesn't share the spacing keys.
 * @example `rounded-${key}` // "lg" → "rounded-lg" (8px)
 */
export const RADII = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  "2xl": 16,
  "3xl": 24,
  "4xl": 32,
  full: 999,
} as const

/**
 * Tailwind's default box shadow scale. The names are the Tailwind suffixes (`shadow-md`).
 */
export const SHADOWS = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"] as const

/**
 * Tailwind's default text sizes, each with its own line height. The names are the Tailwind suffixes (`text-sm`).
 */
export const TEXT_SIZES = [
  "xs",
  "sm",
  "base",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "5xl",
  "6xl",
  "7xl",
  "8xl",
  "9xl",
] as const
