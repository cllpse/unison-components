import { Platform, type StyleProp, type TextStyle } from "react-native"
import type { ColorClassPrefix, ColorFlag, FlagSet, SizeFlag } from "../maps"
import type { PointerEvents, PropertiesResult, TailwindGroup, TailwindGroupHoverFill } from "../types/baseProperties"
import type {
  FigmaFill,
  FigmaFillHover,
  FigmaFrameAlignment,
  FigmaFrameAutolayout,
  FigmaFrameCornerRadius,
  FigmaFrameCornerRadiusBottomLeft,
  FigmaFrameCornerRadiusBottomRight,
  FigmaFrameCornerRadiusTopLeft,
  FigmaFrameCornerRadiusTopRight,
  FigmaFrameEffectShadow,
  FigmaFrameGap,
  FigmaFrameHeight,
  FigmaFramePadding,
  FigmaFramePaddingBottom,
  FigmaFramePaddingHorizontal,
  FigmaFramePaddingLeft,
  FigmaFramePaddingRight,
  FigmaFramePaddingTop,
  FigmaFramePaddingVertical,
  FigmaFrameWidth,
  FigmaFrameWrap,
  FigmaStroke,
  FigmaStrokeHover,
  FigmaStrokeStyle,
  FigmaTypography,
  FigmaTypographyAlignment,
  FigmaTypographyDecoration,
  FigmaVectorHeight,
  FigmaVectorWidth,
} from "../types/figmaProperties"
import { readFlags } from "./readFlags"

// Every helper returns a shared, frozen object: token-derived flags are read through readFlags (one walk of the props
// per render) and their results cached per flag, so a render builds no strings and allocates nothing here once each
// combination has been seen.

const EMPTY: PropertiesResult = Object.freeze({ className: "" })

/** The result for a class name, cached so the same class always returns the same object. */
const RESULT_CACHE = new Map<string, PropertiesResult>()

const result = (className: string): PropertiesResult => {
  let r = RESULT_CACHE.get(className)

  if (r === undefined) {
    r = Object.freeze({ className })
    RESULT_CACHE.set(className, r)
  }

  return r
}

/** The result for several class fragments, skipping absent ones. */
const joinResult = (classNames: (string | undefined)[]): PropertiesResult => {
  const className = classNames.filter(Boolean).join(" ")

  return className === "" ? EMPTY : result(className)
}

// Alignment

const ALIGNMENT_FLAGS = [
  ["alignment-top-left", "start", "start"],
  ["alignment-top-center", "start", "center"],
  ["alignment-top-right", "start", "end"],
  ["alignment-left", "center", "start"],
  ["alignment-center", "center", "center"],
  ["alignment-right", "center", "end"],
  ["alignment-bottom-left", "end", "start"],
  ["alignment-bottom-center", "end", "center"],
  ["alignment-bottom-right", "end", "end"],
] as const

type Edge = "start" | "center" | "end"

const JUSTIFY: Record<Edge, string> = { start: "justify-start", center: "justify-center", end: "justify-end" }
const ITEMS: Record<Edge, string> = { start: "items-start", center: "items-center", end: "items-end" }

const FLEX_ROW = result("flex-row")
const FLEX_COL = result("flex-col")

const isHorizontal = (p: FigmaFrameAutolayout) => !!p["autolayout-horizontal"]

export const computeFrameAutolayout = (p: FigmaFrameAutolayout): PropertiesResult => {
  return isHorizontal(p) ? FLEX_ROW : FLEX_COL
}

// Per alignment flag, its result in a row (horizontal autolayout) and in a column.
const ALIGNMENT_RESULTS = ALIGNMENT_FLAGS.map(
  ([, vertical, horizontal]) =>
    [result(`${JUSTIFY[horizontal]} ${ITEMS[vertical]}`), result(`${JUSTIFY[vertical]} ${ITEMS[horizontal]}`)] as const,
)

/**
 * Justify along the main axis and align items across it, so the same Figma alignment works in either direction.
 * Without an alignment flag, children sit at the top left.
 * @example computeFrameAlignment({ "autolayout-horizontal": true, "alignment-right": true }) // "justify-end items-center"
 */
export const computeFrameAlignment = (p: FigmaFrameAlignment & FigmaFrameAutolayout): PropertiesResult => {
  let index = 0

  for (let i = 0; i < ALIGNMENT_FLAGS.length; i++) {
    if (p[ALIGNMENT_FLAGS[i][0]]) {
      index = i
      break
    }
  }

  return ALIGNMENT_RESULTS[index][isHorizontal(p) ? 0 : 1]
}

// Sizing

type ExactSizeFlag = Extract<SizeFlag, { mode: "exact" }>
type SizeModeFlag = Extract<SizeFlag, { mode: "fill" | "hug" }>

// Cached per pair of width and height flags (each `null` when absent), so repeat renders only do two Map lookups.
const SIZING_CACHE = new Map<
  ExactSizeFlag | SizeModeFlag | null,
  Map<ExactSizeFlag | SizeModeFlag | null, PropertiesResult>
>()

// React Native Web's `View` prepends a base reset (see react-native-web View `view$raw`) that forces `min-width: 0`,
// `min-height: 0` and `flex-shrink: 0` on every element. That breaks the flex model these frames assume: we rely on
// the browser-default `min-*: auto` so a fill frame won't shrink below its content, and on the default `flex-shrink` so
// children size predictably. We restore that model with Tailwind classes, which beat the reset because consumers load
// Tailwind's utilities unlayered and after React Native Web's stylesheet (see AGENTS.md).
export const computeFrameSizing = (p: FigmaFrameWidth & FigmaFrameHeight): PropertiesResult => {
  const flags = readFlags(p)
  // An exact size wins over a mode set alongside it.
  const width = flags.width ?? flags["width-mode"] ?? null
  const height = flags.height ?? flags["height-mode"] ?? null

  let byHeight = SIZING_CACHE.get(width)

  if (byHeight === undefined) {
    byHeight = new Map()
    SIZING_CACHE.set(width, byHeight)
  }

  let sizing = byHeight.get(height)

  if (sizing === undefined) {
    sizing = result(sizingClassName(width, height))
    byHeight.set(height, sizing)
  }

  return sizing
}

const sizingClassName = (
  width: ExactSizeFlag | SizeModeFlag | null,
  height: ExactSizeFlag | SizeModeFlag | null,
): string => {
  const exactWidth = width?.mode === "exact" ? width.unit : ""
  const exactHeight = height?.mode === "exact" ? height.unit : ""
  const widthFill = width?.mode === "fill"
  const heightFill = height?.mode === "fill"

  const widthClass = exactWidth !== "" ? `w-${exactWidth}` : widthFill ? "w-full" : "w-fit"
  const heightClass = exactHeight !== "" ? `h-${exactHeight}` : heightFill ? "h-full" : "h-fit"

  // `full` is 100% of the parent, so like fill it has to yield to siblings: pinned with `shrink-0`, a full frame beside
  // a fixed sibling overflows the parent by that sibling's width.
  const widthYields = widthFill || exactWidth === "full"
  const heightYields = heightFill || exactHeight === "full"

  // `flex-shrink`/`flex-grow` only act on the main axis and a frame can't know its parent's direction, so the axis
  // floors below carry the per-axis intent instead.
  //
  // - Exact axes are pinned with matching `min-*`/`max-*` so flex can neither grow nor shrink them — the exact size
  //   holds even when that axis is the parent's main axis.
  // - Fill and full axes get `min-*: 0` so they can shrink past their own content (text truncates) and always yield space to
  //   fixed siblings, instead of overflowing them when the container is constrained from the outside (max-width /
  //   fixed width).
  // - Hug axes keep `min-*: auto` so they never shrink below their content.
  const widthFloor =
    exactWidth !== "" && exactWidth !== "full"
      ? `min-w-${exactWidth} max-w-${exactWidth}`
      : widthYields
        ? "min-w-0"
        : "min-w-[auto]"
  const heightFloor =
    exactHeight !== "" && exactHeight !== "full"
      ? `min-h-${exactHeight} max-h-${exactHeight}`
      : heightYields
        ? "min-h-0"
        : "min-h-[auto]"

  if (widthFill && heightFill) {
    // Both axes fill → grow into the main axis, stretch across the cross axis.
    //
    // We intentionally emit `w-full` but NOT `h-full`. On whichever axis is the parent's cross axis, filling is done
    // by `align-self: stretch` — but stretch only applies when the cross size is `auto`. An explicit `height: 100%`
    // both suppresses that stretch and, because percentage heights resolve against the containing block, collapses to
    // content height whenever an ancestor is hug-sized (indefinite height) — so the frame fails to stretch. `w-full`
    // is safe because percentage widths resolve against the (near-always definite) inline size, and it keeps fill
    // siblings equal-width along a horizontal axis.
    return `${widthClass} self-stretch ${widthFloor} ${heightFloor} grow shrink`
  }

  if (!widthYields && !heightYields) {
    // Hug/exact on both axes → rigid box (equivalent to `flex-none`).
    return `${widthClass} ${heightClass} ${widthFloor} ${heightFloor} grow-0 shrink-0`
  }

  // At least one axis fills or is full: let it shrink so it yields space to fixed siblings (instead of overflowing
  // them). Any exact sibling axis is already pinned above, so `shrink` can't collapse it below its exact size.
  return `${widthClass} ${heightClass} ${widthFloor} ${heightFloor} grow-0 shrink`
}

// Spacing and radius: one flag, one class

const classResult = (flags: FlagSet, group: keyof FlagSet): PropertiesResult => {
  const flag = flags[group]

  return flag !== undefined && "className" in flag ? result(flag.className) : EMPTY
}

// `gap-` sets both directions; `gap-horizontal-` (between items in a row) and `gap-vertical-` (between rows) override
// one direction each.
export const computeFrameGap = (p: FigmaFrameGap): PropertiesResult => {
  const flags = readFlags(p)
  const classNames = [flags.gap, flags["gap-horizontal"], flags["gap-vertical"]]

  return joinResult(classNames.map((flag) => flag?.className))
}

export const computeFramePadding = (p: FigmaFramePadding): PropertiesResult => classResult(readFlags(p), "padding")

export const computeFramePaddingVertical = (p: FigmaFramePaddingVertical): PropertiesResult =>
  classResult(readFlags(p), "padding-vertical")

export const computeFramePaddingHorizontal = (p: FigmaFramePaddingHorizontal): PropertiesResult =>
  classResult(readFlags(p), "padding-horizontal")

export const computeFramePaddingLeft = (p: FigmaFramePaddingLeft): PropertiesResult =>
  classResult(readFlags(p), "padding-left")

export const computeFramePaddingRight = (p: FigmaFramePaddingRight): PropertiesResult =>
  classResult(readFlags(p), "padding-right")

export const computeFramePaddingTop = (p: FigmaFramePaddingTop): PropertiesResult =>
  classResult(readFlags(p), "padding-top")

export const computeFramePaddingBottom = (p: FigmaFramePaddingBottom): PropertiesResult =>
  classResult(readFlags(p), "padding-bottom")

export const computeFrameCornerRadiusTopLeft = (p: FigmaFrameCornerRadiusTopLeft): PropertiesResult =>
  classResult(readFlags(p), "corner-radius-top-left")

export const computeFrameCornerRadiusTopRight = (p: FigmaFrameCornerRadiusTopRight): PropertiesResult =>
  classResult(readFlags(p), "corner-radius-top-right")

export const computeFrameCornerRadiusBottomLeft = (p: FigmaFrameCornerRadiusBottomLeft): PropertiesResult =>
  classResult(readFlags(p), "corner-radius-bottom-left")

export const computeFrameCornerRadiusBottomRight = (p: FigmaFrameCornerRadiusBottomRight): PropertiesResult =>
  classResult(readFlags(p), "corner-radius-bottom-right")

export const computeFrameCornerRadius = (
  p: FigmaFrameCornerRadius &
    FigmaFrameCornerRadiusTopLeft &
    FigmaFrameCornerRadiusTopRight &
    FigmaFrameCornerRadiusBottomLeft &
    FigmaFrameCornerRadiusBottomRight,
): PropertiesResult => {
  const flags = readFlags(p)
  const classNames = [
    flags["corner-radius"],
    flags["corner-radius-top-left"],
    flags["corner-radius-top-right"],
    flags["corner-radius-bottom-left"],
    flags["corner-radius-bottom-right"],
  ]

  return joinResult(classNames.map((flag) => flag?.className))
}

// Colors

// Cached per Tailwind class prefix and flag, so a color's class is built once.
const COLOR_RESULT_CACHE = new Map<ColorClassPrefix, Map<ColorFlag, PropertiesResult>>()

const colorResult = (flag: ColorFlag | undefined, prefix: ColorClassPrefix): PropertiesResult => {
  if (flag === undefined) return EMPTY

  let byFlag = COLOR_RESULT_CACHE.get(prefix)

  if (byFlag === undefined) {
    byFlag = new Map()
    COLOR_RESULT_CACHE.set(prefix, byFlag)
  }

  let r = byFlag.get(flag)

  if (r === undefined) {
    r = result(`${prefix}-${flag.name}`)
    byFlag.set(flag, r)
  }

  return r
}

export const computeFrameFill = (p: FigmaFill): PropertiesResult => colorResult(readFlags(p).fill, "bg")

const STROKE_SOLID = "outline-1 outline -outline-offset-1"
const STROKE_DASHED = `${STROKE_SOLID} outline-dashed`

// Per stroke color result, the full stroke result for a solid and a dashed line.
const STROKE_CACHE = new Map<PropertiesResult, readonly [PropertiesResult, PropertiesResult]>()

export const computeFrameStroke = (p: FigmaStroke & FigmaStrokeStyle): PropertiesResult => {
  const stroke = colorResult(readFlags(p).stroke, "outline")

  if (stroke === EMPTY) return EMPTY

  let styles = STROKE_CACHE.get(stroke)

  if (styles === undefined) {
    styles = [result(`${stroke.className} ${STROKE_SOLID}`), result(`${stroke.className} ${STROKE_DASHED}`)]
    STROKE_CACHE.set(stroke, styles)
  }

  return styles[p["stroke-style-dashed"] ? 1 : 0]
}

export const computeFrameFillHover = (p: FigmaFillHover): PropertiesResult =>
  colorResult(readFlags(p)["fill-hover"], "hover:bg")

export const computeFrameStrokeHover = (p: FigmaStrokeHover): PropertiesResult =>
  colorResult(readFlags(p)["stroke-hover"], "hover:outline")

// Pointer events

const POINTER_EVENTS_NONE = result("pointer-events-none")
const POINTER_EVENTS_AUTO = result("pointer-events-auto")

export const computeElementPointerEvents = (p: PointerEvents): PropertiesResult => {
  if (p["pointer-events-none"]) return POINTER_EVENTS_NONE
  if (p["pointer-events-auto"]) return POINTER_EVENTS_AUTO

  return EMPTY
}

// Wrap and group

const FLEX_WRAP = result("flex-wrap")
const GROUP = result("group")

export const computeFrameWrap = (p: FigmaFrameWrap): PropertiesResult => (p.wrap ? FLEX_WRAP : EMPTY)

export const computeElementTailwindGroup = (p: TailwindGroup): PropertiesResult => (p["tailwind-group"] ? GROUP : EMPTY)

// Shadow

const NO_SHADOW: PropertiesResult = Object.freeze({ styles: Object.freeze({ boxShadow: "none" }), className: "" })

export const computeFrameEffectShadow = (p: FigmaFrameEffectShadow): PropertiesResult => {
  if (p["effect-shadow-none"]) return EMPTY

  const shadow = classResult(readFlags(p), "effect-shadow")

  return shadow === EMPTY ? NO_SHADOW : shadow
}

// Text

export const computeTextTypography = (p: FigmaTypography): PropertiesResult => classResult(readFlags(p), "typography")

export const computeTextFill = (p: FigmaFill): PropertiesResult => colorResult(readFlags(p).fill, "text")

export const computeTextFillHover = (p: FigmaFillHover): PropertiesResult =>
  colorResult(readFlags(p)["fill-hover"], "hover:text")

/** The text's `fill-hover-` color on its group's hover too: `hover:text-red-500` also gives `group-hover:text-red-500`. */
export const computeTextTailwindGroupHoverFill = (p: FigmaFillHover & TailwindGroupHoverFill): PropertiesResult =>
  p["tailwind-group-hover-fill"] ? colorResult(readFlags(p)["fill-hover"], "group-hover:text") : EMPTY

const ALIGN_LEFT = Object.freeze({ styles: Object.freeze({ textAlign: "left" as const }), className: "text-left" })
const ALIGN_CENTER = Object.freeze({
  styles: Object.freeze({ textAlign: "center" as const }),
  className: "text-center",
})
const ALIGN_RIGHT = Object.freeze({ styles: Object.freeze({ textAlign: "right" as const }), className: "text-right" })

export const computeTextTypographyAlignment = (p: FigmaTypographyAlignment): PropertiesResult => {
  if (p["typography-align-left"]) return ALIGN_LEFT
  if (p["typography-align-center"]) return ALIGN_CENTER
  if (p["typography-align-right"]) return ALIGN_RIGHT

  return EMPTY
}

const UNDERLINE = Object.freeze({
  styles: Object.freeze({ textDecorationLine: "underline" as const }),
  className: "underline",
})

export const computeTextTypographyDecoration = (p: FigmaTypographyDecoration): PropertiesResult => {
  if (p["typography-decoration-underline"]) return UNDERLINE

  return EMPTY
}

// Vector

/**
 * Resolve a vector's fill flag to a color value, since SVG paths take a paint value rather than a Tailwind class.
 * Without a fill flag the path inherits `currentColor`, so a parent's text color tints it.
 * @example computeVectorFill({ "fill-red-500": true }) // "#FB2C36"
 */
export const computeVectorFill = (p: FigmaFill): string => readFlags(p).fill?.value ?? "currentColor"

// Cached per pair of width and height flags, so repeat renders of the same vector never allocate.
const VECTOR_SIZE_CACHE = new Map<ExactSizeFlag, Map<ExactSizeFlag, PropertiesResult>>()

/**
 * Size a vector to its `width-` and `height-` flags. The box is pinned and never grows or shrinks,
 * matching how Figma keeps a vector at its own bounds inside auto layout; the viewBox scales to fit it. Returns a
 * shared, frozen object.
 * @example computeVectorSize({ "width-6": true, "height-6": true }) // { className: "w-6 h-6 min-w-6 … shrink-0" }
 */
export const computeVectorSize = (p: FigmaVectorWidth & FigmaVectorHeight): PropertiesResult => {
  const { width, height } = readFlags(p)

  // Vectors take the spacing scale only, not Frame's container widths. Without both sizes, the box gets no size class.
  if (width === undefined || width.container || height === undefined) return EMPTY

  let byHeight = VECTOR_SIZE_CACHE.get(width)

  if (byHeight === undefined) {
    byHeight = new Map()
    VECTOR_SIZE_CACHE.set(width, byHeight)
  }

  let size = byHeight.get(height)

  if (size === undefined) {
    const w = width.unit
    const h = height.unit

    size = result(`w-${w} h-${h} min-w-${w} min-h-${h} max-w-${w} max-h-${h} grow-0 shrink-0`)
    byHeight.set(height, size)
  }

  return size
}

export const FONT_FEATURE_STYLE: StyleProp<TextStyle> = Platform.select({
  ios: { fontVariant: ["stylistic-one"] },
  android: { fontFeatureSettings: '"ss01" 1' },
  default: {},
})
