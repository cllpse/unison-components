// The Figma variables in dist/tokens.json, keyed by collection, then mode, each mode holding the tokens in
// the format of Figma's own export. Exposed as values keyed by collection, mode where there's more than one, and Figma's
// variable name: `VARIABLES.color.dark["fill-neutral-50"]`, `VARIABLES.units["spacing-4"]`. The file is
// read-only.
import tokens from "../../dist/tokens.json"

const light = tokens.colors.Light
const dark = tokens.colors.Dark
const units = tokens.units.Default
const typography = tokens.typography.Default
const shadows = tokens.shadows.Default

type Token = { $type: string; $value: unknown }
type Color = { $value: { alpha: number; hex: string } }

/** Figma's variable names in an export: groups (none in this file) joined by `/`, `$`-prefixed keys skipped. */
type Names<Tokens> = {
  [Key in keyof Tokens & string]: Key extends `$${string}`
    ? never
    : Tokens[Key] extends { $value: unknown }
      ? Key
      : `${Key}/${Names<Tokens[Key]>}`
}[keyof Tokens & string]

export type ColorVariableName = Names<typeof light>
export type UnitVariableName = Names<typeof units>
export type TypographyVariableName = Names<typeof typography>
export type ShadowVariableName = Names<typeof shadows>

// Figma's `hex` leaves out the alpha, so translucent colors get it appended (`#11111180`).
const resolveValue = (token: Token): unknown => {
  if (token.$type !== "color") return token.$value
  const { alpha, hex } = (token as Color).$value
  return alpha < 1
    ? `${hex}${Math.round(alpha * 255)
        .toString(16)
        .padStart(2, "0")
        .toUpperCase()}`
    : hex
}

const resolve = <Value>(group: object, path = "", values: Record<string, Value> = {}) => {
  for (const [key, node] of Object.entries(group)) {
    if (key.startsWith("$")) continue
    const name = `${path}${key}`
    if ("$value" in node) values[name] = resolveValue(node) as Value
    else resolve(node, `${name}/`, values)
  }
  return values
}

export const VARIABLES = {
  color: {
    light: resolve<string>(light) as Record<ColorVariableName, string>,
    dark: resolve<string>(dark) as Record<ColorVariableName, string>,
  },
  units: resolve<number>(units) as Record<UnitVariableName, number>,
  typography: resolve<number>(typography) as Record<TypographyVariableName, number>,
  // Offsets, blur and spread are numbers, colors are hex.
  shadows: resolve<number | string>(shadows) as Record<ShadowVariableName, number | string>,
}

export type VariableMode = keyof typeof VARIABLES.color
