import { COLORS, type ColorName, type ColorShade } from "../constants/colors"
import type { ColorFlagKind } from "./computeColor"

export type ExtractedColor = Readonly<{
  color: ColorName
  shade?: ColorShade
}>

// Memoized per property name; `null` marks names that are not a color flag of that kind (e.g. "width-fill"), so
// every name is parsed at most once.
const CACHE: Record<ColorFlagKind, Map<string, ExtractedColor | null>> = {
  fill: new Map(),
  "fill-hover": new Map(),
  stroke: new Map(),
  "stroke-hover": new Map(),
}

const parse = (kind: ColorFlagKind, key: string): ExtractedColor | null => {
  if (!key.startsWith(kind) || key.charCodeAt(kind.length) !== 45 /* "-" */) return null

  const [color, shade, ...rest] = key.slice(kind.length + 1).split("-")
  if (rest.length > 0 || !Object.hasOwn(COLORS, color)) return null

  const palette = COLORS[color as ColorName]

  if (typeof palette === "string") {
    return shade === undefined ? Object.freeze({ color: color as ColorName }) : null
  }

  if (shade === undefined || !Object.hasOwn(palette, shade)) return null

  return Object.freeze({
    color: color as ColorName,
    shade: shade as ColorShade,
  })
}

/**
 * Extract the first enabled color flag of a given kind from a props object. Returns a shared, frozen object.
 * @example extractColor("fill", { "fill-red-500": true }) // { color: "red", shade: "500" }
 * @example extractColor("fill", { "fill-hover-red-500": true }) // undefined
 */
export const extractColor = (kind: ColorFlagKind, flags: object): ExtractedColor | undefined => {
  const cache = CACHE[kind]

  for (const key in flags) {
    if ((flags as Record<string, unknown>)[key] !== true) continue

    let color = cache.get(key)

    if (color === undefined) {
      color = parse(kind, key)
      cache.set(key, color)
    }

    if (color !== null) return color
  }

  return undefined
}
