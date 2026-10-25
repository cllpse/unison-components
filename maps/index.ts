import {
  ANIMATIONS,
  COLORS,
  CONTAINERS,
  type ColorName,
  type ColorNameAndShade,
  type ColorShade,
  EASINGS,
  type PaletteColorName,
  RADIUS,
  SHADOWS,
  SPACING,
  SPACING_TAILWIND,
  TEXT_SIZES,
  TRANSITION_DELAYS,
  TRANSITION_DURATIONS,
  TRANSITION_PROPERTIES,
} from "../dist/design-tokens"

// Every token-derived flag, keyed by its full name (`padding-4`, `fill-red-500`), built once at module load from the
// token scales in dist/design-tokens.ts. Components look up the flags a props object actually sets instead of probing every
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

/**
 * Per state, the Tailwind variant that matches it on web and on iOS and Android (Uniwind): in front of the class for
 * the element's own state (`active:bg-red-500`), after `group-` for its group's (`group-active:bg-red-500`). Uniwind
 * has no hover and can't read `:focus-visible`, but focus there only comes from a keyboard or a TV remote, which is
 * what focus-visible means on web. It can't read `aria-` attributes either, so disabled and selected match the `data-`
 * attributes a Frame mirrors them to.
 */
export const STATE_VARIANTS = {
  hover: { web: "hover", native: "hover" },
  active: { web: "active", native: "active" },
  "focus-visible": { web: "focus-visible", native: "focus" },
  disabled: { web: "data-[disabled=true]", native: "data-[disabled=true]" },
  selected: { web: "data-[selected=true]", native: "data-[selected=true]" },
} as const

/**
 * The color flags each component takes, per property: the Tailwind class prefix it paints with, the states of its own
 * it changes color in (after the property: `fill-active-red-500`) and the states of its nearest `group` frame (in
 * front, as in Tailwind: `group-hover-fill-red-500`). A Text has no press, focus or disabled state of its own and a
 * Vector no hover, so both only follow their group beyond that.
 */
export const COLOR_COMPONENTS = {
  Frame: {
    fill: {
      prefix: "bg",
      states: ["hover", "active", "focus-visible", "disabled", "selected"],
      groupStates: ["hover", "active", "focus-visible"],
    },
    stroke: { prefix: "outline", states: ["hover", "focus-visible"], groupStates: ["hover"] },
  },
  Text: { fill: { prefix: "text", states: ["hover"], groupStates: ["hover", "active", "focus-visible"] } },
  Vector: { fill: { prefix: "text", states: [], groupStates: ["hover", "active", "focus-visible"] } },
} as const satisfies Record<string, Record<string, ColorConfig>>

type ColorConfig = Readonly<{ prefix: string; states: readonly State[]; groupStates: readonly State[] }>

const colorConfigs = (component: ColorComponent) =>
  Object.entries(COLOR_COMPONENTS[component]) as [ColorProperty, ColorConfig][]

/**
 * A component's state color groups, each with the Tailwind class prefix it paints with on a platform.
 * @example colorStateClassPrefixes("Frame", "native") // [["fill-hover", "hover:bg"], …, ["fill-focus-visible", "focus:bg"], …]
 */
export const colorStateClassPrefixes = (
  component: ColorComponent,
  platform: keyof (typeof STATE_VARIANTS)[State],
): (readonly [ColorGroup, string])[] =>
  colorConfigs(component).flatMap(([property, { prefix, states, groupStates }]) => [
    ...states.map(
      (state) => [`${property}-${state}` as ColorGroup, `${STATE_VARIANTS[state][platform]}:${prefix}`] as const,
    ),
    ...groupStates.map(
      (state) =>
        [`group-${state}-${property}` as ColorGroup, `group-${STATE_VARIANTS[state][platform]}:${prefix}`] as const,
    ),
  ])

/** Groups of color flags, from every component's properties and states; a flag is `<group>-<color>` (`fill-white`, `group-hover-fill-red-500`). */
export const COLOR_GROUPS: readonly ColorGroup[] = [
  ...new Set(
    (Object.keys(COLOR_COMPONENTS) as ColorComponent[]).flatMap((component) => [
      ...colorConfigs(component).map(([property]) => property),
      ...colorStateClassPrefixes(component, "web").map(([group]) => group),
    ]),
  ),
]

/** Per color group, the Tailwind class prefixes its flags produce across components and platforms, for the safelist. */
const COLOR_CLASS_PREFIXES = new Map<ColorGroup, Set<string>>()

for (const component of Object.keys(COLOR_COMPONENTS) as ColorComponent[]) {
  const prefixes = [
    ...colorConfigs(component).map(([property, { prefix }]) => [property, prefix] as const),
    ...colorStateClassPrefixes(component, "web"),
    ...colorStateClassPrefixes(component, "native"),
  ]

  for (const [group, prefix] of prefixes) {
    const classPrefixes = COLOR_CLASS_PREFIXES.get(group) ?? new Set()

    classPrefixes.add(prefix)
    COLOR_CLASS_PREFIXES.set(group, classPrefixes)
  }
}

/**
 * Groups of motion flags from dist/motion-tokens.css, as [group, Tailwind class prefix, scale]; a flag is `<group>-<key>`
 * (`transition-colors`, `transition-duration-150`, `transition-easing-out`, `animate-spin`). `animate-` loops only run
 * when motion is allowed.
 */
export const MOTION_GROUPS = [
  ["transition", "transition", TRANSITION_PROPERTIES],
  ["transition-duration", "duration", TRANSITION_DURATIONS],
  ["transition-delay", "delay", TRANSITION_DELAYS],
  ["transition-easing", "ease", EASINGS],
  ["animate", "motion-safe:animate", ANIMATIONS],
] as const

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
  "typography-settings": ["typography-settings-truncate"],
  "pointer-events": ["pointer-events-none", "pointer-events-auto"],
  group: ["group"],
} as const

export type SpacingGroup = (typeof SPACING_GROUPS)[number][0]
export type RadiusGroup = (typeof RADIUS_GROUPS)[number][0]
export type State = keyof typeof STATE_VARIANTS
export type ColorComponent = keyof typeof COLOR_COMPONENTS
export type ColorProperty<Component extends ColorComponent = ColorComponent> = {
  [C in Component]: keyof (typeof COLOR_COMPONENTS)[C]
}[Component]
/** The states of its own a component's color property changes in (`"hover" | "active" | …` for a Frame's fill). */
export type ColorState<
  Component extends ColorComponent,
  Property extends ColorProperty<Component>,
> = (typeof COLOR_COMPONENTS)[Component][Property] extends { states: readonly (infer S)[] } ? S : never
/** The states of its group a component's color property follows. */
export type GroupState<
  Component extends ColorComponent,
  Property extends ColorProperty<Component>,
> = (typeof COLOR_COMPONENTS)[Component][Property] extends { groupStates: readonly (infer S)[] } ? S : never
export type ColorGroup = {
  [Component in ColorComponent]: {
    [Property in ColorProperty<Component>]:
      | Property
      | `${Property & string}-${ColorState<Component, Property> & string}`
      | `group-${GroupState<Component, Property> & string}-${Property & string}`
  }[ColorProperty<Component>]
}[ColorComponent]
export type MotionGroup = (typeof MOTION_GROUPS)[number][0]
export type SizeMode = (typeof SIZE_MODES)[number]
export type NamedFlagGroup = keyof typeof NAMED_FLAGS
export type NamedFlagName<Group extends NamedFlagGroup = NamedFlagGroup> = (typeof NAMED_FLAGS)[Group][number]

/** A flag that maps to one Tailwind class: spacing, radius, shadow, text size and motion flags. */
export type ClassFlag = Readonly<{
  group: SpacingGroup | RadiusGroup | MotionGroup | "effect-shadow" | "typography"
  className: string
  /** The flag's name after its group prefix, for motion flags: the key of its scale (`colors`, `150`, `out`). */
  key?: string
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
export type FlagSet = {
  [Group in SpacingGroup | RadiusGroup | MotionGroup | "effect-shadow" | "typography"]?: ClassFlag
} & {
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

for (const [group, prefix, scale] of MOTION_GROUPS) {
  for (const key of Object.keys(scale)) add(`${group}-${key}`, { group, className: `${prefix}-${key}`, key })
}

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
 * Classes that don't depend on a token (`w-fit`, `flex-row`) are literals in src/ and utilities/ and found by Tailwind's own scan.
 * @example flagClasses(FLAGS.get("width-4")) // ["w-4", "min-w-4", "max-w-4"]
 */
export const flagClasses = (flag: Flag): string[] => {
  if ("className" in flag) return [flag.className]
  if ("name" in flag) return [...(COLOR_CLASS_PREFIXES.get(flag.group) ?? [])].map((prefix) => `${prefix}-${flag.name}`)

  if (flag.group === "width" || flag.group === "height") {
    const axis = flag.group === "width" ? "w" : "h"

    return [`${axis}-${flag.unit}`, `min-${axis}-${flag.unit}`, `max-${axis}-${flag.unit}`]
  }

  return []
}
