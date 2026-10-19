import { Platform, type StyleProp, type TextStyle } from "react-native"
import { COLORS } from "../constants/colors"
import { CONTAINERS, RADII, SHADOWS, TEXT_SIZES, UNITS, UNITS_TAILWIND } from "../constants/units"
import type {
  FigmaFill,
  FigmaFillHover,
  FigmaFrameAlignment,
  FigmaFrameAutolayout,
  FigmaFrameAutolayoutDirection,
  FigmaFrameBorderRadius,
  FigmaFrameCornerRadius,
  FigmaFrameCornerRadiusBottomLeft,
  FigmaFrameCornerRadiusBottomRight,
  FigmaFrameCornerRadiusTopLeft,
  FigmaFrameCornerRadiusTopRight,
  FigmaFrameEdgePosition,
  FigmaFrameEffectShadow,
  FigmaFrameGap,
  FigmaFrameHeight,
  FigmaFrameHorizontalPosition,
  FigmaFrameVerticalPosition,
  FigmaFrameWidth,
  FigmaIconWidth,
  FigmaPadding,
  FigmaPaddingBottom,
  FigmaPaddingHorizontal,
  FigmaPaddingLeft,
  FigmaPaddingRight,
  FigmaPaddingTop,
  FigmaPaddingVertical,
  FigmaPropertiesReturn,
  FigmaPropertiesReturnError,
  FigmaStroke,
  FigmaStrokeHover,
  FigmaStrokeStyle,
  FigmaTypography,
  FigmaTypographyAlignment,
  FigmaTypographyDecoration,
  FigmaVectorHeight,
  FigmaVectorWidth,
} from "../types/figmaProperties"
import type { ColorFlagKind } from "./computeColor"
import { extractColor } from "./extractColor"

const FRAME_HORIZONTAL_TO_EDGE: Record<FigmaFrameHorizontalPosition, FigmaFrameEdgePosition> = {
  left: "start",
  center: "center",
  right: "end",
}

const FRAME_VERTICAL_TO_EDGE: Record<FigmaFrameVerticalPosition, FigmaFrameEdgePosition> = {
  top: "start",
  center: "center",
  bottom: "end",
}

const FRAME_JUSTIFY: Record<FigmaFrameEdgePosition, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
}

const FRAME_ITEMS: Record<FigmaFrameEdgePosition, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
}

const resolveFrameAutolayout = (p: FigmaFrameAutolayout): FigmaFrameAutolayoutDirection => {
  if (p["autolayout-horizontal"]) return "horizontal"
  if (p["autolayout-vertical"]) return "vertical"

  return "vertical"
}

const resolveFrameAlignment = (
  p: FigmaFrameAlignment,
): {
  vertical: FigmaFrameVerticalPosition
  horizontal: FigmaFrameHorizontalPosition
} => {
  if (p["alignment-top-left"]) return { vertical: "top", horizontal: "left" }
  if (p["alignment-top-center"]) return { vertical: "top", horizontal: "center" }
  if (p["alignment-top-right"]) return { vertical: "top", horizontal: "right" }
  if (p["alignment-left"]) return { vertical: "center", horizontal: "left" }
  if (p["alignment-center"]) return { vertical: "center", horizontal: "center" }
  if (p["alignment-right"]) return { vertical: "center", horizontal: "right" }
  if (p["alignment-bottom-left"]) return { vertical: "bottom", horizontal: "left" }
  if (p["alignment-bottom-center"]) return { vertical: "bottom", horizontal: "center" }
  if (p["alignment-bottom-right"]) return { vertical: "bottom", horizontal: "right" }

  return { vertical: "top", horizontal: "left" }
}

export const computeFrameAutolayout = (p: FigmaFrameAutolayout): FigmaPropertiesReturn => {
  return { className: resolveFrameAutolayout(p) === "horizontal" ? "flex-row" : "flex-col" }
}

export const computeFrameAlignment = (p: FigmaFrameAlignment & FigmaFrameAutolayout): FigmaPropertiesReturn => {
  const { vertical, horizontal } = resolveFrameAlignment(p)
  const horizontalEdge = FRAME_HORIZONTAL_TO_EDGE[horizontal]
  const verticalEdge = FRAME_VERTICAL_TO_EDGE[vertical]

  if (resolveFrameAutolayout(p) === "horizontal") {
    return { className: `${FRAME_JUSTIFY[horizontalEdge]} ${FRAME_ITEMS[verticalEdge]}` }
  }

  return { className: `${FRAME_JUSTIFY[verticalEdge]} ${FRAME_ITEMS[horizontalEdge]}` }
}

// React Native Web's `View` prepends a base reset (see react-native-web View `view$raw`) that forces `min-width: 0`,
// `min-height: 0` and `flex-shrink: 0` on every element. That breaks the flex model these frames assume: we rely on
// the browser-default `min-*: auto` so a fill frame won't shrink below its content, and on the default `flex-shrink` so
// children size predictably. We restore that model with Tailwind classes, which beat the reset because consumers load
// Tailwind's utilities unlayered and after React Native Web's stylesheet (see AGENTS.md).
export const computeFrameSizing = (p: FigmaFrameWidth & FigmaFrameHeight): FigmaPropertiesReturn => {
  let exactWidth = ""
  let exactHeight = ""

  for (const key in UNITS) {
    if (p[`width-${key}` as keyof FigmaFrameWidth]) {
      exactWidth = key
    }

    if (p[`height-${key}` as keyof FigmaFrameHeight]) {
      exactHeight = key
    }
  }

  // A container width (`width-md`) is exact too; its Tailwind suffix is its name (`w-md`).
  for (const key in CONTAINERS) {
    if (p[`width-${key}` as keyof FigmaFrameWidth]) {
      exactWidth = key
    }
  }

  const widthFill = exactWidth === "" && p["width-fill"]
  const heightFill = exactHeight === "" && p["height-fill"]
  const widthUnit = UNITS_TAILWIND[exactWidth as keyof typeof UNITS] ?? exactWidth
  const heightUnit = UNITS_TAILWIND[exactHeight as keyof typeof UNITS] ?? exactHeight

  const widthClass = exactWidth !== "" ? `w-${widthUnit}` : widthFill ? "w-full" : "w-fit"
  const heightClass = exactHeight !== "" ? `h-${heightUnit}` : heightFill ? "h-full" : "h-fit"

  // `flex-shrink`/`flex-grow` only act on the main axis and a frame can't know its parent's direction, so the axis
  // floors below carry the per-axis intent instead.
  //
  // - Exact axes are pinned with matching `min-*`/`max-*` so flex can neither grow nor shrink them — the exact size
  //   holds even when that axis is the parent's main axis.
  // - Fill axes get `min-*: 0` so they can shrink past their own content (text truncates) and always yield space to
  //   fixed siblings, instead of overflowing them when the container is constrained from the outside (max-width /
  //   fixed width).
  // - Hug axes keep `min-*: auto` so they never shrink below their content.
  const widthFloor =
    exactWidth !== "" && exactWidth !== "full"
      ? `min-w-${widthUnit} max-w-${widthUnit}`
      : widthFill
        ? "min-w-0"
        : "min-w-[auto]"
  const heightFloor =
    exactHeight !== "" && exactHeight !== "full"
      ? `min-h-${heightUnit} max-h-${heightUnit}`
      : heightFill
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
    return {
      styles: {},
      className: `${widthClass} self-stretch ${widthFloor} ${heightFloor} grow shrink`,
    }
  }

  if (!widthFill && !heightFill) {
    // Hug/exact on both axes → rigid box (equivalent to `flex-none`).
    return {
      styles: {},
      className: `${widthClass} ${heightClass} ${widthFloor} ${heightFloor} grow-0 shrink-0`,
    }
  }

  // Exactly one axis fills: let the filling axis shrink so it yields space to fixed siblings (instead of overflowing
  // them). Any exact sibling axis is already pinned above, so `shrink` can't collapse it below its exact size.
  return {
    styles: {},
    className: `${widthClass} ${heightClass} ${widthFloor} ${heightFloor} grow-0 shrink`,
  }
}

const resolveUnitKey = <P extends object>(p: P, prefix: string): keyof typeof UNITS | undefined => {
  for (const key in UNITS) {
    if (p[`${prefix}${key}` as keyof P]) {
      return key as keyof typeof UNITS
    }
  }

  return undefined
}

// `gap-` sets both directions; `gap-horizontal-` (between items in a row) and `gap-vertical-` (between rows) override
// one direction each.
export const computeFrameGap = (p: FigmaFrameGap): FigmaPropertiesReturnError => {
  const both = resolveUnitKey(p, "gap-")
  const horizontal = resolveUnitKey(p, "gap-horizontal-")
  const vertical = resolveUnitKey(p, "gap-vertical-")

  const classes = [
    both === undefined ? "" : `gap-${UNITS_TAILWIND[both] ?? both}`,
    horizontal === undefined ? "" : `gap-x-${UNITS_TAILWIND[horizontal] ?? horizontal}`,
    vertical === undefined ? "" : `gap-y-${UNITS_TAILWIND[vertical] ?? vertical}`,
  ]

  return { styles: {}, className: classes.filter(Boolean).join(" ") }
}

const resolveRadiusKey = <P extends object>(p: P, prefix: string): keyof typeof RADII | undefined => {
  for (const key in RADII) {
    if (p[`${prefix}${key}` as keyof P]) {
      return key as keyof typeof RADII
    }
  }

  return undefined
}

export const computeFramePadding = (p: FigmaPadding): FigmaPropertiesReturn => {
  const key = resolveUnitKey(p, "padding-")

  if (key === undefined) return { styles: {}, className: "" }

  return { styles: {}, className: `p-${UNITS_TAILWIND[key] ?? key}` }
}

export const computeFramePaddingVertical = (p: FigmaPaddingVertical): FigmaPropertiesReturn => {
  const key = resolveUnitKey(p, "padding-vertical-")

  if (key === undefined) return { styles: {}, className: "" }

  return {
    styles: {},
    className: `py-${UNITS_TAILWIND[key] ?? key}`,
  }
}

export const computeFramePaddingHorizontal = (p: FigmaPaddingHorizontal): FigmaPropertiesReturn => {
  const key = resolveUnitKey(p, "padding-horizontal-")

  if (key === undefined) return { styles: {}, className: "" }

  return {
    styles: {},
    className: `px-${UNITS_TAILWIND[key] ?? key}`,
  }
}

export const computeFramePaddingLeft = (p: FigmaPaddingLeft): FigmaPropertiesReturn => {
  const key = resolveUnitKey(p, "padding-left-")

  if (key === undefined) return { styles: {}, className: "" }

  return { styles: {}, className: `pl-${UNITS_TAILWIND[key] ?? key}` }
}

export const computeFramePaddingRight = (p: FigmaPaddingRight): FigmaPropertiesReturn => {
  const key = resolveUnitKey(p, "padding-right-")

  if (key === undefined) return { styles: {}, className: "" }

  return { styles: {}, className: `pr-${UNITS_TAILWIND[key] ?? key}` }
}

export const computeFramePaddingTop = (p: FigmaPaddingTop): FigmaPropertiesReturn => {
  const key = resolveUnitKey(p, "padding-top-")

  if (key === undefined) return { styles: {}, className: "" }

  return { styles: {}, className: `pt-${UNITS_TAILWIND[key] ?? key}` }
}

export const computeFramePaddingBottom = (p: FigmaPaddingBottom): FigmaPropertiesReturn => {
  const key = resolveUnitKey(p, "padding-bottom-")

  if (key === undefined) return { styles: {}, className: "" }

  return { styles: {}, className: `pb-${UNITS_TAILWIND[key] ?? key}` }
}

export const computeFrameCornerRadiusTopLeft = (p: FigmaFrameCornerRadiusTopLeft): FigmaPropertiesReturn => {
  const key = resolveRadiusKey(p, "corner-radius-top-left-")

  if (key === undefined) return { styles: {}, className: "" }

  return { styles: {}, className: `rounded-tl-${key}` }
}

export const computeFrameCornerRadiusTopRight = (p: FigmaFrameCornerRadiusTopRight): FigmaPropertiesReturn => {
  const key = resolveRadiusKey(p, "corner-radius-top-right-")

  if (key === undefined) return { styles: {}, className: "" }

  return { styles: {}, className: `rounded-tr-${key}` }
}

export const computeFrameCornerRadiusBottomLeft = (p: FigmaFrameCornerRadiusBottomLeft): FigmaPropertiesReturn => {
  const key = resolveRadiusKey(p, "corner-radius-bottom-left-")

  if (key === undefined) return { styles: {}, className: "" }

  return { styles: {}, className: `rounded-bl-${key}` }
}

export const computeFrameCornerRadiusBottomRight = (p: FigmaFrameCornerRadiusBottomRight): FigmaPropertiesReturn => {
  const key = resolveRadiusKey(p, "corner-radius-bottom-right-")

  if (key === undefined) return { styles: {}, className: "" }

  return { styles: {}, className: `rounded-br-${key}` }
}

export const computeFrameCornerRadius = (
  p: FigmaFrameBorderRadius &
    FigmaFrameCornerRadius &
    FigmaFrameCornerRadiusTopLeft &
    FigmaFrameCornerRadiusTopRight &
    FigmaFrameCornerRadiusBottomLeft &
    FigmaFrameCornerRadiusBottomRight,
): FigmaPropertiesReturn => {
  const key = resolveRadiusKey(p, "border-radius-") ?? resolveRadiusKey(p, "corner-radius-")
  const topLeft = computeFrameCornerRadiusTopLeft(p)
  const topRight = computeFrameCornerRadiusTopRight(p)
  const bottomLeft = computeFrameCornerRadiusBottomLeft(p)
  const bottomRight = computeFrameCornerRadiusBottomRight(p)

  return {
    styles: {},
    className: [
      key === undefined ? "" : `rounded-${key}`,
      topLeft.className,
      topRight.className,
      bottomLeft.className,
      bottomRight.className,
    ]
      .filter(Boolean)
      .join(" "),
  }
}

export const computeFrameFill = (p: FigmaFill): FigmaPropertiesReturn => {
  return computeColorClassName(p, "fill", "bg")
}

const STROKE_SOLID = "outline-1 outline -outline-offset-1"
const STROKE_DASHED = `${STROKE_SOLID} outline-dashed`

export const computeFrameStroke = (p: FigmaStroke & FigmaStrokeStyle): FigmaPropertiesReturn => {
  const stroke = computeColorClassName(p, "stroke", "outline")

  if (stroke.className === "") return stroke

  return { className: `${stroke.className} ${p["stroke-style-dashed"] ? STROKE_DASHED : STROKE_SOLID}` }
}

export const computeFrameFillHover = (p: FigmaFillHover): FigmaPropertiesReturn => {
  return computeColorClassName(p, "fill-hover", "hover:bg")
}

export const computeFrameStrokeHover = (p: FigmaStrokeHover): FigmaPropertiesReturn => {
  return computeColorClassName(p, "stroke-hover", "hover:outline")
}

const SHADOW_CLASSES = Object.fromEntries(SHADOWS.map((name) => [name, `shadow-${name}`])) as Record<
  (typeof SHADOWS)[number],
  string
>

export const computeFrameEffectShadow = (p: FigmaFrameEffectShadow): FigmaPropertiesReturn => {
  if (p["effect-shadow-none"]) {
    return { className: "" }
  }

  for (const name of SHADOWS) {
    if (p[`effect-shadow-${name}`]) return { className: SHADOW_CLASSES[name] }
  }

  return { styles: { boxShadow: "none" }, className: "" }
}

const TEXT_SIZE_CLASSES = Object.fromEntries(TEXT_SIZES.map((name) => [name, `text-${name}`])) as Record<
  (typeof TEXT_SIZES)[number],
  string
>

export const computeTextTypography = (p: FigmaTypography): FigmaPropertiesReturnError => {
  for (const name of TEXT_SIZES) {
    if (p[`typography-${name}`]) return { className: TEXT_SIZE_CLASSES[name] }
  }

  return { error: '<Text /> – missing "typography-" property' }
}

export const computeTextFill = (p: FigmaFill): FigmaPropertiesReturnError => {
  const fill = computeColorClassName(p, "fill", "text")

  if (fill.className !== "") {
    return fill
  }

  return { error: '<Text /> – missing "fill-" property' }
}

export const computeTextFillHover = (p: FigmaFillHover): FigmaPropertiesReturn => {
  return computeColorClassName(p, "fill-hover", "hover:text")
}

export const computeTextTypographyAlignment = (p: FigmaTypographyAlignment): FigmaPropertiesReturn => {
  if (p["typography-align-left"]) return { styles: { textAlign: "left" }, className: "text-left" }
  if (p["typography-align-center"]) return { styles: { textAlign: "center" }, className: "text-center" }
  if (p["typography-align-right"]) return { styles: { textAlign: "right" }, className: "text-right" }

  return { styles: {}, className: "" }
}

export const computeTextTypographyDecoration = (p: FigmaTypographyDecoration): FigmaPropertiesReturn => {
  if (p["typography-decoration-underline"]) {
    return { styles: { textDecorationLine: "underline" }, className: "underline" }
  }

  return { styles: {}, className: "" }
}

/**
 * @deprecated
 * @todo @cllpse: transition to wrapping in Frame and using Material Icons
 */
export const computeIconWidth = (p: FigmaIconWidth): FigmaPropertiesReturnError => {
  if (p["width-small"]) {
    return { styles: { width: UNITS[2], height: UNITS[2] }, className: "w-6 h-6 shrink-0" }
  }

  if (p["width-medium"]) {
    return { styles: { width: UNITS[4], height: UNITS[4] }, className: "w-9 h-9 shrink-0" }
  }

  if (p["width-large"]) {
    return { styles: { width: UNITS[8], height: UNITS[8] }, className: "w-16 h-16 shrink-0" }
  }

  if (p["width-huge"]) {
    return { styles: { width: UNITS[12], height: UNITS[12] }, className: "w-[120px] h-[120px] shrink-0" }
  }

  return { error: '<Icon /> – missing "width-" property' }
}

export const computeIconFill = (p: FigmaFill): FigmaPropertiesReturn => {
  return computeColorClassName(p, "fill", "text")
}

/**
 * Resolve a vector's fill flag to a color value, since SVG paths take a paint value rather than a Tailwind class.
 * Without a fill flag the path inherits `currentColor`, so a parent's text color tints it.
 * @example computeVectorFill({ "fill-red-500": true }) // { styles: { color: "#FB2C36" }, className: "" }
 */
export const computeVectorFill = (p: FigmaFill): FigmaPropertiesReturn => {
  const flag = extractColor("fill", p)

  if (flag === undefined) return { styles: { color: COLORS.currentcolor }, className: "" }

  const palette = COLORS[flag.color]
  const color = typeof palette === "string" ? palette : palette[flag.shade as keyof typeof palette]

  return { styles: { color }, className: "" }
}

// Memoized per width and height key, so repeat renders of the same vector never allocate.
const VECTOR_SIZE_CACHE = new Map<string, FigmaPropertiesReturn>()

/**
 * Size a vector to its `width-` and `height-` flags; both are required. The box is pinned and never grows or shrinks,
 * matching how Figma keeps a vector at its own bounds inside auto layout; the viewBox scales to fit it. Returns a
 * shared, frozen object.
 * @example computeVectorSize({ "width-6": true, "height-6": true }) // { styles: {}, className: "w-6 h-6 min-w-6 … shrink-0" }
 */
export const computeVectorSize = (p: FigmaVectorWidth & FigmaVectorHeight): FigmaPropertiesReturnError => {
  const widthKey = resolveUnitKey(p, "width-")
  const heightKey = resolveUnitKey(p, "height-")

  if (widthKey === undefined) return { error: '<Vector /> – missing "width-" property' }

  if (heightKey === undefined) return { error: '<Vector /> – missing "height-" property' }

  const cacheKey = `${widthKey} ${heightKey}`
  let size = VECTOR_SIZE_CACHE.get(cacheKey)

  if (size === undefined) {
    const width = String(UNITS_TAILWIND[widthKey] ?? widthKey)
    const height = String(UNITS_TAILWIND[heightKey] ?? heightKey)

    size = Object.freeze({
      styles: Object.freeze({}),
      className: `w-${width} h-${height} min-w-${width} min-h-${height} max-w-${width} max-h-${height} grow-0 shrink-0`,
    })
    VECTOR_SIZE_CACHE.set(cacheKey, size)
  }

  return size
}

const computeColorClassName = (
  p: object,
  kind: ColorFlagKind,
  property: "bg" | "text" | "outline" | "hover:bg" | "hover:text" | "hover:outline",
): FigmaPropertiesReturn => {
  const flag = extractColor(kind, p)

  if (flag === undefined) return { className: "" }

  return {
    className: flag.shade === undefined ? `${property}-${flag.color}` : `${property}-${flag.color}-${flag.shade}`,
  }
}

export const FONT_FEATURE_STYLE: StyleProp<TextStyle> = Platform.select({
  ios: { fontVariant: ["stylistic-one"] },
  android: { fontFeatureSettings: '"ss01" 1' },
  default: {},
})
