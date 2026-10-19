import {
  COLORS,
  CONTAINERS,
  type ColorName,
  type ColorNameAndShade,
  type ColorShade,
  type PaletteColorName,
  RADIUS,
  SHADOWS,
  SPACING,
  SPACING_TAILWIND,
  TEXT_SIZES,
} from "../../dist/tokens"

// Every token-derived flag, keyed by its full name (`padding-4`, `fill-red-500`), built once at module load from the
// token scales in dist/tokens.ts. Components look up the flags a props object actually sets instead of probing every
// scale key per group, which kept a Frame render at ~25µs (about 500 string builds and misses); see readFlags. The same
// table gives the class names each flag can produce, which the Tailwind safelists are built from.

/** Groups of spacing flags, as [group, Tailwind class prefix]; a flag is `<group>-<spacing key>` (`padding-4`). */
export const SPACING_GROUPS = [
  ["padding", "p"],
  ["padding-vertical", "py"],
  ["padding-horizontal", "px"],
  ["padding-left", "pl"],
  ["padding-right", "pr"],
  ["padding-top", "pt"],
  ["padding-bottom", "pb"],
  ["gap", "gap"],
  ["gap-horizontal", "gap-x"],
  ["gap-vertical", "gap-y"],
] as const

/** Groups of radius flags, as [group, Tailwind class prefix]; a flag is `<group>-<radius key>` (`corner-radius-lg`). */
export const RADIUS_GROUPS = [
  ["corner-radius", "rounded"],
  ["corner-radius-top-left", "rounded-tl"],
  ["corner-radius-top-right", "rounded-tr"],
  ["corner-radius-bottom-left", "rounded-bl"],
  ["corner-radius-bottom-right", "rounded-br"],
] as const

/** Groups of color flags; a flag is `<group>-<color>` (`fill-white`, `stroke-hover-red-500`). */
export const COLOR_GROUPS = ["fill", "fill-hover", "stroke", "stroke-hover"] as const

/** Per color group, the Tailwind class prefixes its flags produce across components (Frame, Text and Icon). */
const COLOR_CLASS_PREFIXES: Record<ColorGroup, readonly ColorClassPrefix[]> = {
  fill: ["bg", "text"],
  "fill-hover": ["hover:bg", "hover:text", "group-hover:text"],
  stroke: ["outline"],
  "stroke-hover": ["hover:outline"],
}

/** Figma's sizing modes, which `width-` and `height-` take besides the spacing scale (`width-fill`). */
export const SIZE_MODES = ["fill", "hug"] as const

/**
 * Flags that don't come from a token, by group: read directly off the props by name rather than through the table,
 * and listed so they get types and aren't reported unknown.
 */
export const NAMED_FLAGS = {
  autolayout: ["autolayout-horizontal", "autolayout-vertical"],
  alignment: [
    "alignment-top-left",
    "alignment-top-center",
    "alignment-top-right",
    "alignment-left",
    "alignment-center",
    "alignment-right",
    "alignment-bottom-left",
    "alignment-bottom-center",
    "alignment-bottom-right",
  ],
  "effect-shadow": ["effect-shadow-none"],
  "stroke-style": ["stroke-style-dashed", "stroke-style-solid"],
  "typography-align": ["typography-align-left", "typography-align-center", "typography-align-right"],
  "typography-decoration": ["typography-decoration-underline"],
  "pointer-events": ["pointer-events-none", "pointer-events-auto"],
} as const

export type SpacingGroup = (typeof SPACING_GROUPS)[number][0]
export type RadiusGroup = (typeof RADIUS_GROUPS)[number][0]
export type ColorGroup = (typeof COLOR_GROUPS)[number]
export type SizeMode = (typeof SIZE_MODES)[number]
export type NamedFlagGroup = keyof typeof NAMED_FLAGS
export type NamedFlagName<Group extends NamedFlagGroup = NamedFlagGroup> = (typeof NAMED_FLAGS)[Group][number]
export type ColorClassPrefix =
  | "bg"
  | "text"
  | "outline"
  | "hover:bg"
  | "hover:text"
  | "hover:outline"
  | "group-hover:text"

/** A flag that maps to one Tailwind class: spacing, radius, shadow and text size flags. */
export type ClassFlag = Readonly<{
  group: SpacingGroup | RadiusGroup | "effect-shadow" | "typography"
  className: string
}>

/**
 * A `width-` or `height-` flag. `exact` sizes carry their Tailwind suffix (`0.5`, `md`, `full`); `fill` and `hug` are
 * Figma's sizing modes and form their own group, so an exact size still wins over a mode set alongside it.
 */
export type SizeFlag = Readonly<
  | { group: "width" | "height"; mode: "exact"; unit: string; container: boolean }
  | { group: "width-mode" | "height-mode"; mode: SizeMode }
>

export type ColorFlag = Readonly<{
  group: ColorGroup
  /** The flag's name after its group prefix, which is also the Tailwind color name: `white`, `red-500`. */
  name: ColorNameAndShade
  color: ColorName
  shade?: ColorShade
  /** The color's value: hex, or a CSS keyword for `currentcolor` and `transparent`. */
  value: string
}>

export type NamedFlag = Readonly<{ group: "other" }>

export type Flag = ClassFlag | SizeFlag | ColorFlag | NamedFlag

/** The flags a props object sets, one per group (see readFlags). */
export type FlagSet = { [Group in SpacingGroup | RadiusGroup | "effect-shadow" | "typography"]?: ClassFlag } & {
  width?: Extract<SizeFlag, { mode: "exact" }>
  height?: Extract<SizeFlag, { mode: "exact" }>
  "width-mode"?: Extract<SizeFlag, { mode: SizeMode }>
  "height-mode"?: Extract<SizeFlag, { mode: SizeMode }>
} & { [Group in ColorGroup]?: ColorFlag }

const table = new Map<string, Flag>()

const add = (name: string, flag: Flag) => table.set(name, Object.freeze(flag))

for (const [group, prefix] of SPACING_GROUPS) {
  for (const key of Object.keys(SPACING) as (keyof typeof SPACING)[]) {
    add(`${group}-${key}`, { group, className: `${prefix}-${SPACING_TAILWIND[key] ?? key}` })
  }
}

for (const [group, prefix] of RADIUS_GROUPS) {
  for (const key of Object.keys(RADIUS)) {
    add(`${group}-${key}`, { group, className: `${prefix}-${key}` })
  }
}

for (const name of SHADOWS) add(`effect-shadow-${name}`, { group: "effect-shadow", className: `shadow-${name}` })

for (const size of TEXT_SIZES) add(`typography-${size}`, { group: "typography", className: `text-${size}` })

for (const axis of ["width", "height"] as const) {
  for (const key of Object.keys(SPACING) as (keyof typeof SPACING)[]) {
    add(`${axis}-${key}`, { group: axis, mode: "exact", unit: SPACING_TAILWIND[key] ?? key, container: false })
  }

  for (const mode of SIZE_MODES) add(`${axis}-${mode}`, { group: `${axis}-mode`, mode })
}

// A container width (`width-md`) is exact too; its Tailwind suffix is its name (`w-md`).
for (const key of Object.keys(CONTAINERS))
  add(`width-${key}`, { group: "width", mode: "exact", unit: key, container: true })

for (const [color, value] of Object.entries(COLORS) as [ColorName, string | Record<string, string>][]) {
  for (const group of COLOR_GROUPS) {
    if (typeof value === "string") {
      add(`${group}-${color}`, { group, name: color as ColorNameAndShade, color, value })
      continue
    }

    for (const [shade, hex] of Object.entries(value)) {
      const name = `${color as PaletteColorName}-${shade}` as ColorNameAndShade

      add(`${group}-${name}`, { group, name, color, shade: shade as ColorShade, value: hex })
    }
  }
}

for (const name of Object.values(NAMED_FLAGS).flat()) add(name, { group: "other" })

/**
 * Every flag by its full name.
 * @example FLAGS.get("padding-horizontal-4") // { group: "padding-horizontal", className: "px-4" }
 */
export const FLAGS: ReadonlyMap<string, Flag> = table

/**
 * The first segments of every flag name (`fill`, `padding`, `corner`, …): a prop starting with one of them that isn't
 * in FLAGS is a misspelled flag (see readFlags).
 */
export const FLAG_PREFIXES: ReadonlySet<string> = new Set([...table.keys()].map((name) => name.split("-")[0]))

/**
 * The Tailwind classes a flag can produce in any component, for the safelist in scripts/generateTailwind.ts.
 * Classes that don't depend on a token (`w-fit`, `flex-row`) are literals in src/ and found by Tailwind's own scan.
 * @example flagClasses(FLAGS.get("width-4")) // ["w-4", "min-w-4", "max-w-4"]
 */
export const flagClasses = (flag: Flag): string[] => {
  if ("className" in flag) return [flag.className]
  if ("name" in flag) return COLOR_CLASS_PREFIXES[flag.group].map((prefix) => `${prefix}-${flag.name}`)

  if (flag.group === "width" || flag.group === "height") {
    const axis = flag.group === "width" ? "w" : "h"

    return [`${axis}-${flag.unit}`, `min-${axis}-${flag.unit}`, `max-${axis}-${flag.unit}`]
  }

  return []
}
