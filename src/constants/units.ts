/**
 * A map of [tailwind unit, pixel value] representing a subset of supported tailwind units.
 */
export const UNITS = {
  /**
   * 0, 0rem, 0px
   */
  0: 0,

  /**
   * 1px
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
   * 0, 0.25rem, 4px
   */
  1: 4,

  /**
   * 1p5, 0.375rem, 6px
   */
  "1p5": 6,

  /**
   * 0, 0.5rem, 8px
   */
  2: 8,

  /**
   * 0, 0.75rem, 12px
   */
  3: 12,

  /**
   * 0, 1rem, 16px
   */
  4: 16,

  /**
   * 0, 1.25rem, 20px
   */
  5: 20,

  /**
   * 0, 1.5rem, 24px
   */
  6: 24,

  /**
   * 0, 1.75rem, 28px
   */
  7: 28,

  /**
   * 0, 2rem, 32px
   */
  8: 32,

  /**
   * 0, 2.5rem, 40px
   */
  10: 40,

  /**
   * 0, 2.75rem, 44px
   */
  11: 44,

  /**
   * 0, 3rem, 48px
   */
  12: 48,

  /**
   * 0, 3.5rem, 56px
   */
  14: 56,

  /**
   * 0, 4rem, 64px
   */
  16: 64,

  /**
   * 0, 5rem, 80px
   */
  20: 80,

  /**
   * 0, 6rem, 96px
   */
  24: 96,

  /**
   * 0, 7rem, 112px
   */
  28: 112,

  /**
   * 999px
   */
  full: 999,
} as const

/**
 * Tailwind suffixes for keys that are not on the default scale.
 * Spacing: `UNITS_TAILWIND[key] ?? key`
 * Radius: `UNITS_TAILWIND[key] ?? `[${UNITS[key]}px]``
 */
export const UNITS_TAILWIND: Partial<Record<keyof typeof UNITS, string>> = {
  "1px": "[1px]",
  "05": "[2px]",
  "0p5": "[2px]",
  "1p5": "[6px]",
  full: "full",
}
