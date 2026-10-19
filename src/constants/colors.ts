// The library's colors, read from the tokens (dist/tokens.ts, generated from dist/tokens.json): the colors collection's
// `fill-<hue>-<shade>` variables become palettes and `fill-<name>` ones plain colors, with their Light mode values.
// The Dark values reach only the generated tailwind.css. `currentcolor` and `transparent` are CSS keywords, not tokens.
import { TOKENS } from "../../dist/tokens"

type ColorToken = keyof typeof TOKENS.colors.Light

type Hue = { [Name in ColorToken]: Name extends `fill-${infer Hue}-${string}` ? Hue : never }[ColorToken]

type Shade<H extends Hue> = {
  [Name in ColorToken]: Name extends `fill-${H}-${infer Shade}` ? Shade : never
}[ColorToken]

type Plain = {
  [Name in ColorToken]: Name extends `fill-${infer Plain}`
    ? Plain extends `${string}-${string}`
      ? never
      : Plain
    : never
}[ColorToken]

type Colors = { currentcolor: "currentColor"; transparent: "transparent" } & {
  [Name in Plain]: (typeof TOKENS.colors.Light)[`fill-${Name}`]
} & {
  [H in Hue]: { [S in Shade<H>]: (typeof TOKENS.colors.Light)[`fill-${H}-${S}` & ColorToken] }
}

/** `{ currentcolor, transparent, white: "#FFFFFF", …, red: { 50: "#FEF2F2", … }, … }` */
export const COLORS = (() => {
  const colors: Record<string, string | Record<string, string>> = {
    currentcolor: "currentColor",
    transparent: "transparent",
  }

  for (const [name, hex] of Object.entries(TOKENS.colors.Light)) {
    const [, hue, shade] = name.match(/^fill-([a-z]+)-(\d+)$/) ?? []

    if (hue) {
      const palette = (colors[hue] ?? {}) as Record<string, string>

      palette[shade] = hex
      colors[hue] = palette
    } else {
      colors[name.replace(/^fill-/, "")] = hex
    }
  }

  return colors as Colors
})()

export type ColorName = keyof typeof COLORS

type PaletteColorName = { [Name in ColorName]: (typeof COLORS)[Name] extends string ? never : Name }[ColorName]

export type ColorShade = { [Name in PaletteColorName]: keyof (typeof COLORS)[Name] }[PaletteColorName]

export type ColorNameAndShade = {
  [Name in ColorName]: (typeof COLORS)[Name] extends string
    ? Name
    : `${Name & string}-${keyof (typeof COLORS)[Name] & string}`
}[ColorName]
