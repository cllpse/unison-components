// The library's units, read from the tokens (dist/tokens.ts, generated from dist/tokens.json): spacing, radius and
// container widths from the units collection, shadow names from the shadows collection and text sizes from the typography collection. Only
// UNITS_FIGMA's `fill` and `hug` aren't tokens: they're Figma's sizing modes.
import { TOKENS } from "../../dist/tokens"

type UnitToken = keyof typeof TOKENS.units.Default
type SpacingKey = { [Name in UnitToken]: Name extends `spacing-${infer Key}` ? Key : never }[UnitToken]
type RadiusKey = { [Name in UnitToken]: Name extends `radius-${infer Key}` ? Key : never }[UnitToken]
type ContainerKey = { [Name in UnitToken]: Name extends `container-${infer Key}` ? Key : never }[UnitToken]

type ShadowToken = keyof typeof TOKENS.shadows.Default
type ShadowName = {
  [Name in ShadowToken]: Name extends `shadow-${infer Shadow}-${number}-${string}` ? Shadow : never
}[ShadowToken]

type TypographyToken = keyof typeof TOKENS.typography.Default
type TextSize = { [Name in TypographyToken]: Name extends `font-size-${infer Size}` ? Size : never }[TypographyToken]

/** The tokens' names after `prefix`, in the tokens' order, each with its value. */
const scale = (tokens: Record<string, unknown>, prefix: string) =>
  Object.fromEntries(
    Object.entries(tokens)
      .filter(([name]) => name.startsWith(prefix))
      .map(([name, value]) => [name.slice(prefix.length), value]),
  )

/**
 * The spacing scale, as [key, pixel value]. Keys are the tokens' (`spacing-0p5` gives `0p5`); see UNITS_TAILWIND for
 * the Tailwind class suffix.
 * @example UNITS["4"] // 16
 */
export const UNITS = scale(TOKENS.units.Default, "spacing-") as {
  [Key in SpacingKey]: (typeof TOKENS.units.Default)[`spacing-${Key}`]
}

/**
 * Tailwind spacing suffixes for keys that differ from their key: fractional keys spell the dot as `p`, which a Tailwind
 * class can't use.
 * @example `p-${UNITS_TAILWIND[key] ?? key}` // "1p5" → "p-1.5", "4" → "p-4"
 */
export const UNITS_TAILWIND: Partial<Record<SpacingKey, string>> = Object.fromEntries(
  Object.keys(UNITS)
    .filter((key) => /^\d+p\d+$/.test(key))
    .map((key) => [key, key.replace("p", ".")]),
)

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
 * The corner radius scale, as [Tailwind suffix, pixel value]. Radius has its own names (`rounded-lg`, not
 * `rounded-2`), so it doesn't share the spacing keys.
 * @example `rounded-${key}` // "lg" → "rounded-lg" (8px)
 */
export const RADII = scale(TOKENS.units.Default, "radius-") as {
  [Key in RadiusKey]: (typeof TOKENS.units.Default)[`radius-${Key}`]
}

/**
 * Tailwind's container scale for widths, as [Tailwind suffix, pixel value]: fixed sizes (16rem to 80rem at a 16px
 * root), not percentages.
 * @example `w-${key}` // "md" → "w-md" (448px)
 */
export const CONTAINERS = scale(TOKENS.units.Default, "container-") as {
  [Key in ContainerKey]: (typeof TOKENS.units.Default)[`container-${Key}`]
}

/**
 * The shadow names (`shadow-md`), in the tokens' order.
 */
export const SHADOWS = [
  ...new Set(Object.keys(TOKENS.shadows.Default).map((name) => name.split("-")[1])),
] as ShadowName[]

/**
 * The text sizes (`text-sm`), each with its own line height, in the tokens' order.
 */
export const TEXT_SIZES = Object.keys(scale(TOKENS.typography.Default, "font-size-")) as TextSize[]
