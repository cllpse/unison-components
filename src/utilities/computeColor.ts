import type { COLORS, ColorName } from "../constants/colors"

export type ColorFlagKind = "fill" | "fill-hover" | "stroke" | "stroke-hover"

export type ColorFlagProps = Readonly<Record<string, true>>

type Palette = typeof COLORS
type PaletteColorName = { [K in ColorName]: Palette[K] extends string ? never : K }[ColorName]
type PlainColorName = Exclude<ColorName, PaletteColorName>

// Memoized on first use, so repeat calls are lookups that never build strings or allocate.
const CACHE: Record<ColorFlagKind, Partial<Record<ColorName, Record<PropertyKey, ColorFlagProps>>>> = {
  fill: {},
  "fill-hover": {},
  stroke: {},
  "stroke-hover": {},
}

type ComputeColor = {
  (kind: ColorFlagKind, color: PlainColorName): ColorFlagProps
  <C extends PaletteColorName>(kind: ColorFlagKind, color: C, shade: keyof Palette[C]): ColorFlagProps
}

/**
 * Compute the flag property for a color. Returns a shared, frozen object.
 * @example computeColor("fill", "red", "500") // { "fill-red-500": true }
 * @example computeColor("stroke-hover", "white") // { "stroke-hover-white": true }
 */
export const computeColor: ComputeColor = (kind: ColorFlagKind, color: ColorName, shade?: PropertyKey) => {
  let byShade = CACHE[kind][color]

  if (byShade === undefined) {
    byShade = {}
    CACHE[kind][color] = byShade
  }

  const key = shade ?? ""
  let flag = byShade[key]

  if (flag === undefined) {
    flag = Object.freeze({
      [shade === undefined ? `${kind}-${color}` : `${kind}-${color}-${String(shade)}`]: true as const,
    })
    byShade[key] = flag
  }

  return flag
}
