import { Platform, type StyleProp, type TextStyle } from "react-native"
import { COLORS } from "../constants/colors"
import { UNITS, UNITS_TAILWIND } from "../constants/units"
import type { StyleNative, StyleWeb } from "../types/ElementProperties"
import type {
  FigmaFill,
  FigmaFillHover,
  FigmaFrameAlignment,
  FigmaFrameBorderRadius,
  FigmaFrameCornerRadius,
  FigmaFrameCornerRadiusBottomLeft,
  FigmaFrameCornerRadiusBottomRight,
  FigmaFrameCornerRadiusTopLeft,
  FigmaFrameCornerRadiusTopRight,
  FigmaFrameEdgePosition,
  FigmaFrameEffectShadow,
  FigmaFrameFlow,
  FigmaFrameFlowDirection,
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
} from "../types/FigmaProperties"
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

const resolveFrameFlow = (p: FigmaFrameFlow): FigmaFrameFlowDirection => {
  if (p["flow-horizontal"]) return "horizontal"
  if (p["flow-vertical"]) return "vertical"

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

export const FrameComputeFlow = (p: FigmaFrameFlow): FigmaPropertiesReturn => {
  return { className: resolveFrameFlow(p) === "horizontal" ? "flex-row" : "flex-col" }
}

export const FrameComputeAlignment = (p: FigmaFrameAlignment & FigmaFrameFlow): FigmaPropertiesReturn => {
  const { vertical, horizontal } = resolveFrameAlignment(p)
  const horizontalEdge = FRAME_HORIZONTAL_TO_EDGE[horizontal]
  const verticalEdge = FRAME_VERTICAL_TO_EDGE[vertical]

  if (resolveFrameFlow(p) === "horizontal") {
    return { className: `${FRAME_JUSTIFY[horizontalEdge]} ${FRAME_ITEMS[verticalEdge]}` }
  }

  return { className: `${FRAME_JUSTIFY[verticalEdge]} ${FRAME_ITEMS[horizontalEdge]}` }
}

// React Native Web's `View` prepends a base reset (see
// react-native-web View `view$raw`) that forces `min-width: 0`, `min-height: 0`
// and `flex-shrink: 0` on every element. That breaks the flex model these frames
// assume: we rely on the browser-default `min-*: auto` so a fill frame won't
// shrink below its content, and on the default `flex-shrink` so children size
// predictably. We restore that model via the `style` prop (not className), since
// RNW dedupes style objects by property and they deterministically win over the
// reset's atomic classes — unlike Tailwind classes, whose win depends on CSS
// source order.
export const FrameComputeSizing = (p: FigmaFrameWidth & FigmaFrameHeight): FigmaPropertiesReturn => {
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

  const widthFill = exactWidth === "" && p["width-fill"]
  const heightFill = exactHeight === "" && p["height-fill"]

  const widthClass =
    exactWidth !== ""
      ? `w-${UNITS_TAILWIND[exactWidth as keyof typeof UNITS] ?? exactWidth}`
      : widthFill
        ? "w-full"
        : "w-fit"
  const heightClass =
    exactHeight !== ""
      ? `h-${UNITS_TAILWIND[exactHeight as keyof typeof UNITS] ?? exactHeight}`
      : heightFill
        ? "h-full"
        : "h-fit"

  // The View reset forces `min-*: 0` / `flex-shrink: 0`; we restore a sane model via
  // the `style` prop so it deterministically beats the reset's atomic classes.
  // (`flex-shrink`/`flex-grow` only act on the main axis and a frame can't know its
  // parent's direction, so the axis floors below carry the per-axis intent instead.)
  //
  // - Exact axes are pinned with matching `min-*`/`max-*` so flex can neither grow nor
  //   shrink them — the exact size holds even when that axis is the parent's main axis.
  // - Fill axes get `min-*: 0` so they can shrink past their own content (text
  //   truncates) and always yield space to fixed siblings, instead of overflowing them
  //   when the container is constrained from the outside (max-width / fixed width).
  // - Hug axes keep `min-*: auto` so they never shrink below their content.
  const styles: StyleNative & StyleWeb = {}

  if (exactWidth !== "" && exactWidth !== "full") {
    const value = UNITS[exactWidth as keyof typeof UNITS]
    styles.minWidth = value
    styles.maxWidth = value
  } else {
    styles.minWidth = widthFill ? 0 : "auto"
  }

  if (exactHeight !== "" && exactHeight !== "full") {
    const value = UNITS[exactHeight as keyof typeof UNITS]
    styles.minHeight = value
    styles.maxHeight = value
  } else {
    styles.minHeight = heightFill ? 0 : "auto"
  }

  if (widthFill && heightFill) {
    // Both axes fill → grow into the main axis, stretch across the cross axis.
    //
    // We intentionally emit `w-full` but NOT `h-full`. On whichever axis is the
    // parent's cross axis, filling is done by `align-self: stretch` — but stretch
    // only applies when the cross size is `auto`. An explicit `height: 100%` both
    // suppresses that stretch and, because percentage heights resolve against the
    // containing block, collapses to content height whenever an ancestor is
    // hug-sized (indefinite height) — so the frame fails to stretch. `w-full` is
    // safe because percentage widths resolve against the (near-always definite)
    // inline size, and it keeps fill siblings equal-width along a horizontal axis.
    return {
      className: `${widthClass} self-stretch`,
      styles: { ...styles, flexGrow: 1, flexShrink: 1 },
    }
  }

  if (!widthFill && !heightFill) {
    // Hug/exact on both axes → rigid box (equivalent to `flex-none`).

    return {
      className: `${widthClass} ${heightClass}`,
      styles: { ...styles, flexGrow: 0, flexShrink: 0 },
    }
  }

  // Exactly one axis fills: let the filling axis shrink so it yields space to fixed
  // siblings (instead of overflowing them). Any exact sibling axis is already pinned
  // above, so `flexShrink: 1` can't collapse it below its exact size.

  return {
    className: `${widthClass} ${heightClass}`,
    styles: { ...styles, flexGrow: 0, flexShrink: 1 },
  }
}

export const FrameComputeGap = (p: FigmaFrameGap): FigmaPropertiesReturnError => {
  let className = ""

  for (const key in UNITS) {
    if (p[`gap-${key}` as keyof FigmaFrameGap] || p[`gap-1px` as keyof FigmaFrameGap]) {
      const unit = (p[`gap-1px`] ? "1px" : key) as keyof typeof UNITS
      className = `gap-${UNITS_TAILWIND[unit] ?? unit}`

      break
    }
  }

  return { styles: {}, className }
}

const resolveUnitKey = <P extends object>(p: P, prefix: string): keyof typeof UNITS | undefined => {
  for (const key in UNITS) {
    if (p[`${prefix}${key}` as keyof P]) {
      return key as keyof typeof UNITS
    }
  }

  return undefined
}

export const FrameComputePadding = (p: FigmaPadding): FigmaPropertiesReturn => {
  const key = resolveUnitKey(p, "padding-")

  if (key === undefined) return { styles: {}, className: "" }

  return { styles: { padding: UNITS[key] }, className: `p-${UNITS_TAILWIND[key] ?? key}` }
}

export const FrameComputePaddingVertical = (p: FigmaPaddingVertical): FigmaPropertiesReturn => {
  const key = resolveUnitKey(p, "padding-vertical-")

  if (key === undefined) return { styles: {}, className: "" }

  const value = UNITS[key]

  return { styles: { paddingTop: value, paddingBottom: value }, className: `py-${UNITS_TAILWIND[key] ?? key}` }
}

export const FrameComputePaddingHorizontal = (p: FigmaPaddingHorizontal): FigmaPropertiesReturn => {
  const key = resolveUnitKey(p, "padding-horizontal-")

  if (key === undefined) return { styles: {}, className: "" }

  const value = UNITS[key]

  return { styles: { paddingLeft: value, paddingRight: value }, className: `px-${UNITS_TAILWIND[key] ?? key}` }
}

export const FrameComputePaddingLeft = (p: FigmaPaddingLeft): FigmaPropertiesReturn => {
  const key = resolveUnitKey(p, "padding-left-")

  if (key === undefined) return { styles: {}, className: "" }

  return { styles: { paddingLeft: UNITS[key] }, className: `pl-${UNITS_TAILWIND[key] ?? key}` }
}

export const FrameComputePaddingRight = (p: FigmaPaddingRight): FigmaPropertiesReturn => {
  const key = resolveUnitKey(p, "padding-right-")

  if (key === undefined) return { styles: {}, className: "" }

  return { styles: { paddingRight: UNITS[key] }, className: `pr-${UNITS_TAILWIND[key] ?? key}` }
}

export const FrameComputePaddingTop = (p: FigmaPaddingTop): FigmaPropertiesReturn => {
  const key = resolveUnitKey(p, "padding-top-")

  if (key === undefined) return { styles: {}, className: "" }

  return { styles: { paddingTop: UNITS[key] }, className: `pt-${UNITS_TAILWIND[key] ?? key}` }
}

export const FrameComputePaddingBottom = (p: FigmaPaddingBottom): FigmaPropertiesReturn => {
  const key = resolveUnitKey(p, "padding-bottom-")

  if (key === undefined) return { styles: {}, className: "" }

  return { styles: { paddingBottom: UNITS[key] }, className: `pb-${UNITS_TAILWIND[key] ?? key}` }
}

export const FrameComputeCornerRadiusTopLeft = (p: FigmaFrameCornerRadiusTopLeft): FigmaPropertiesReturn => {
  const key = resolveUnitKey(p, "corner-radius-top-left-")

  if (key === undefined) return { styles: {}, className: "" }

  return {
    styles: { borderTopLeftRadius: UNITS[key] },
    className: `rounded-tl-${UNITS_TAILWIND[key] ?? `[${UNITS[key]}px]`}`,
  }
}

export const FrameComputeCornerRadiusTopRight = (p: FigmaFrameCornerRadiusTopRight): FigmaPropertiesReturn => {
  const key = resolveUnitKey(p, "corner-radius-top-right-")

  if (key === undefined) return { styles: {}, className: "" }

  return {
    styles: { borderTopRightRadius: UNITS[key] },
    className: `rounded-tr-${UNITS_TAILWIND[key] ?? `[${UNITS[key]}px]`}`,
  }
}

export const FrameComputeCornerRadiusBottomLeft = (p: FigmaFrameCornerRadiusBottomLeft): FigmaPropertiesReturn => {
  const key = resolveUnitKey(p, "corner-radius-bottom-left-")

  if (key === undefined) return { styles: {}, className: "" }

  return {
    styles: { borderBottomLeftRadius: UNITS[key] },
    className: `rounded-bl-${UNITS_TAILWIND[key] ?? `[${UNITS[key]}px]`}`,
  }
}

export const FrameComputeCornerRadiusBottomRight = (p: FigmaFrameCornerRadiusBottomRight): FigmaPropertiesReturn => {
  const key = resolveUnitKey(p, "corner-radius-bottom-right-")

  if (key === undefined) return { styles: {}, className: "" }

  return {
    styles: { borderBottomRightRadius: UNITS[key] },
    className: `rounded-br-${UNITS_TAILWIND[key] ?? `[${UNITS[key]}px]`}`,
  }
}

export const FrameComputeCornerRadius = (
  p: FigmaFrameBorderRadius &
    FigmaFrameCornerRadius &
    FigmaFrameCornerRadiusTopLeft &
    FigmaFrameCornerRadiusTopRight &
    FigmaFrameCornerRadiusBottomLeft &
    FigmaFrameCornerRadiusBottomRight,
): FigmaPropertiesReturn => {
  const key = resolveUnitKey(p, "border-radius-") ?? resolveUnitKey(p, "corner-radius-")
  const topLeft = FrameComputeCornerRadiusTopLeft(p)
  const topRight = FrameComputeCornerRadiusTopRight(p)
  const bottomLeft = FrameComputeCornerRadiusBottomLeft(p)
  const bottomRight = FrameComputeCornerRadiusBottomRight(p)

  return {
    styles: {
      ...(key === undefined ? {} : { borderRadius: UNITS[key] }),
      ...topLeft.styles,
      ...topRight.styles,
      ...bottomLeft.styles,
      ...bottomRight.styles,
    },
    className: [
      key === undefined ? "" : `rounded-${UNITS_TAILWIND[key] ?? `[${UNITS[key]}px]`}`,
      topLeft.className,
      topRight.className,
      bottomLeft.className,
      bottomRight.className,
    ]
      .filter(Boolean)
      .join(" "),
  }
}

export const FrameComputeFill = (p: FigmaFill): FigmaPropertiesReturn => {
  return ComputeColor(p, "fill", "bg")
}

const STROKE_SOLID = "outline-1 outline -outline-offset-1"
const STROKE_DASHED = `${STROKE_SOLID} outline-dashed`

export const FrameComputeStroke = (p: FigmaStroke & FigmaStrokeStyle): FigmaPropertiesReturn => {
  const stroke = ComputeColor(p, "stroke", "outline")

  if (stroke.className === "") return stroke

  return { className: `${stroke.className} ${p["stroke-style-dashed"] ? STROKE_DASHED : STROKE_SOLID}` }
}

export const FrameComputeFillHover = (p: FigmaFillHover): FigmaPropertiesReturn => {
  return ComputeColor(p, "fill-hover", "hover:bg")
}

export const FrameComputeStrokeHover = (p: FigmaStrokeHover): FigmaPropertiesReturn => {
  return ComputeColor(p, "stroke-hover", "hover:outline")
}

export const FrameComputeEffectShadow = (p: FigmaFrameEffectShadow): FigmaPropertiesReturn => {
  if (p["effect-shadow-none"]) {
    return { className: "" }
  }

  // biome-ignore lint/suspicious/noExplicitAny: ...
  const fill = FrameComputeFill(p as any)

  if (fill.className === "bg-white") {
    if (p["effect-shadow-small"]) {
      return { className: `shadow-[0_4px_4px_0_color-mix(in_oklab,${COLORS.neutral[200]},transparent)]` }
    }

    if (p["effect-shadow-large"]) {
      return { className: `shadow-[0_4px_16px_0_color-mix(in_oklab,${COLORS.neutral[200]},transparent)]` }
    }
  }

  const colorName = fill.className?.replace("bg-", "")?.split("-")[0] as keyof typeof COLORS

  const palette = COLORS[colorName]
  const color = typeof palette === "object" && "100" in palette ? palette[100] : undefined

  if (color) {
    const shadowColor = `color-mix(in_oklab,${color},transparent)`

    if (p["effect-shadow-small"]) {
      return { className: `shadow-[0_4px_4px_0_${shadowColor}]` }
    }

    if (p["effect-shadow-large"]) {
      return { className: `shadow-[0_4px_16px_0_${shadowColor}]` }
    }
  }

  return { styles: { boxShadow: "none" }, className: "" }
}

export const TextComputeTypography = (p: FigmaTypography): FigmaPropertiesReturnError => {
  if (p["typography-timecode"]) {
    return {
      className: "font-['iAWriterDuo'] font-bold text-[64px] leading-[64px]",
    }
  }

  if (p["typography-display-wrap"]) {
    return {
      className:
        "font-['SharpGrotesk25'] not-italic font-medium text-[22px] leading-[30px] text-ellipsis overflow-y-hidden w-full",
    }
  }

  if (p["typography-header-wrap"]) {
    return {
      className: "font-['SharpGrotesk20'] not-italic font-medium text-[15px] leading-[25px]",
    }
  }

  if (p["typography-header-small-wrap"]) {
    return {
      className: "font-['SharpGrotesk20'] not-italic font-medium text-[14px] leading-[21px]",
    }
  }

  if (p["typography-body-wrap"]) {
    return {
      className: "font-['SharpGrotesk20'] not-italic font-normal text-[15px] leading-[25px]",
    }
  }

  if (p["typography-body-nowrap"]) {
    return {
      className:
        "font-['SharpGrotesk20'] not-italic font-normal text-[15px] leading-[25px] whitespace-nowrap text-ellipsis overflow-y-hidden",
    }
  }

  if (p["typography-body-small-wrap"]) {
    return {
      className: "font-['SharpGrotesk20'] not-italic font-normal text-[14px] leading-[25px]",
    }
  }

  if (p["typography-body-small-nowrap"]) {
    return {
      className:
        "font-['SharpGrotesk20'] not-italic font-normal text-[14px] leading-[25px] whitespace-nowrap text-ellipsis overflow-hidden",
    }
  }

  if (p["typography-label-wrap"]) {
    return {
      className: "font-['SharpGrotesk20'] not-italic font-medium text-[15px] leading-[25px]",
    }
  }

  if (p["typography-label-nowrap"]) {
    return {
      className:
        "font-['SharpGrotesk20'] not-italic font-medium text-[15px] leading-[25px] whitespace-nowrap text-ellipsis overflow-hidden",
    }
  }

  if (p["typography-label-small-wrap"]) {
    return {
      className: "font-['SharpGrotesk20'] not-italic font-medium text-[14px] leading-[21px]",
    }
  }

  if (p["typography-label-small-nowrap"]) {
    return {
      className:
        "font-['SharpGrotesk20'] not-italic font-medium text-[14px] leading-[21px] whitespace-nowrap text-ellipsis overflow-hidden",
    }
  }

  if (p["typography-mono-wrap"]) {
    return {
      className: "font-mono not-italic font-normal text-[15px] leading-[25px]",
    }
  }

  if (p["typography-mono-nowrap"]) {
    return {
      className:
        "font-mono not-italic font-normal text-[15px] leading-[25px] whitespace-nowrap text-ellipsis overflow-hidden",
    }
  }

  if (p["typography-mono-small-wrap"]) {
    return {
      className: "font-mono not-italic font-normal text-[14px] leading-[21px]",
    }
  }

  if (p["typography-mono-small-nowrap"]) {
    return {
      className:
        "font-mono not-italic font-normal text-[14px] leading-[21px] whitespace-nowrap text-ellipsis overflow-hidden",
    }
  }

  return { error: '<Text /> – missing "typography-" property' }
}

export const TextComputeFill = (p: FigmaFill): FigmaPropertiesReturnError => {
  const fill = ComputeColor(p, "fill", "text")

  if (fill.className !== "") {
    return fill
  }

  return { error: '<Text /> – missing "fill-" property' }
}

export const TextComputeFillHover = (p: FigmaFillHover): FigmaPropertiesReturn => {
  return ComputeColor(p, "fill-hover", "hover:text")
}

export const TextComputeTypographyAlignment = (p: FigmaTypographyAlignment): FigmaPropertiesReturn => {
  if (p["typography-align-left"]) return { styles: { textAlign: "left" }, className: "text-left" }
  if (p["typography-align-center"]) return { styles: { textAlign: "center" }, className: "text-center" }
  if (p["typography-align-right"]) return { styles: { textAlign: "right" }, className: "text-right" }

  return { styles: {}, className: "" }
}

export const TextComputeTypographyDecoration = (p: FigmaTypographyDecoration): FigmaPropertiesReturn => {
  if (p["typography-decoration-underline"]) {
    return { styles: { textDecorationLine: "underline" }, className: "underline" }
  }

  return { styles: {}, className: "" }
}

/**
 * @deprecated
 * @todo @cllpse: transition to wrapping in Frame and using Material Icons
 */
export const IconComputeWidth = (p: FigmaIconWidth): FigmaPropertiesReturnError => {
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

export const IconComputeFill = (p: FigmaFill): FigmaPropertiesReturn => {
  return ComputeColor(p, "fill", "text")
}

const ComputeColor = (
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

export const FontFeatureStyle: StyleProp<TextStyle> = Platform.select({
  ios: { fontVariant: ["stylistic-one"] },
  android: { fontFeatureSettings: '"ss01" 1' },
  default: {},
})
