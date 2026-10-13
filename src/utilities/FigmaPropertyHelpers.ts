import { Platform, type StyleProp, type TextStyle } from "react-native"
import { COLORS } from "../constants/colors"
import { UNITS, UNITS_TAILWIND } from "../constants/units"
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
  FigmaFrameEffectShadow,
  FigmaFrameFlow,
  FigmaFrameFlowParent,
  FigmaFrameGap,
  FigmaFrameHeight,
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

export const FrameComputeFlow = (p: FigmaFrameFlow): FigmaPropertiesReturnError => {
  if (p["flow-vertical"]) return { styles: { flexDirection: "column", width: 0 }, className: "flex-col" }
  if (p["flow-horizontal"]) return { styles: { flexDirection: "row", width: 0 }, className: "flex-row" }
  if (p["flow-grid"]) return { styles: {}, className: "" }

  return { error: '<Frame /> – missing "flow-" property' }
}

export const FrameComputeDimensions = (
  p: FigmaFrameWidth & FigmaFrameHeight & FigmaFrameFlow & FigmaFrameFlowParent,
): FigmaPropertiesReturnError => {
  let flowVertical = p["flow-vertical-parent"]
  const flowHorizontal = p["flow-horizontal-parent"]

  if (!flowVertical && !flowHorizontal) {
    flowVertical = p["flow-vertical"]
  }

  const widthFill = p["width-fill"]
  let widthHug = p["width-hug"]
  const heightFill = p["height-fill"]
  let heightHug = p["height-hug"]

  let exactWidth = ""
  let exactHeight = ""

  for (const key in UNITS) {
    if (p[`width-${key}` as keyof FigmaFrameWidth]) {
      exactWidth = key
      widthHug = true
    }

    if (p[`height-${key}` as keyof FigmaFrameHeight]) {
      exactHeight = key
      heightHug = true
    }
  }

  if (exactWidth !== "" && exactHeight !== "") {
    return {
      styles: {
        width: UNITS[exactWidth as keyof typeof UNITS],
        height: UNITS[exactHeight as keyof typeof UNITS],
      },
      className: `w-${UNITS_TAILWIND[exactWidth as keyof typeof UNITS] ?? exactWidth} h-${UNITS_TAILWIND[exactHeight as keyof typeof UNITS] ?? exactHeight}`,
    }
  }

  let r = { styles: {}, className: "" }

  if (flowVertical) {
    if (widthFill && heightFill) {
      r = {
        styles: { flexGrow: 1, alignSelf: "stretch" },
        className: `grow shrink self-stretch gg-a`,
      }
    }

    if (widthHug && heightFill) {
      r = {
        styles: { flexGrow: 1, flexShrink: 1 },
        className: `grow shrink gg-b`,
      }
    }

    if (widthFill && heightHug) {
      r = {
        styles: { alignSelf: "stretch" },
        className: `self-stretch grow shrink gg-c`,
      }
    }

    if (widthHug && heightHug) {
      r = { styles: {}, className: `max-w-fit max-h-fit gg-d` }
    }
  } else {
    if (widthFill && heightFill) {
      r = {
        styles: { flexGrow: 1, alignSelf: "stretch" },
        className: `grow self-stretch gg-e`,
      }
    }

    if (widthHug && heightFill) {
      r = {
        styles: { alignSelf: "stretch", flexGrow: 1 },
        className: `self-stretch grow gg-f h-[stretch]`,
      }
    }

    if (widthFill && heightHug) {
      r = {
        styles: { flexGrow: 0, flexShrink: 1 },
        className: `shrink self-stretch gg-g`,
      }
    }

    if (widthHug && heightHug) {
      r = { styles: {}, className: `max-w-fit max-h-fit gg-h` }
    }
  }

  if (exactWidth !== "") {
    r.styles = { ...r.styles, width: UNITS[exactWidth as keyof typeof UNITS] }
    r.className = `${r.className} w-${UNITS_TAILWIND[exactWidth as keyof typeof UNITS] ?? exactWidth}`
  }

  if (exactHeight !== "") {
    r.styles = { ...r.styles, height: UNITS[exactHeight as keyof typeof UNITS] }
    r.className = `${r.className} h-${UNITS_TAILWIND[exactHeight as keyof typeof UNITS] ?? exactHeight}`
  }

  return r
}

export const FrameComputeAlignment = (p: FigmaFrameAlignment & FigmaFrameFlow): FigmaPropertiesReturnError => {
  if (p["alignment-top-left"])
    return {
      styles: p["flow-vertical"]
        ? { alignItems: "flex-start", justifyContent: "flex-start" }
        : { alignItems: "flex-start", justifyContent: "flex-start" },
      className: p["flow-vertical"] ? "items-start justify-start" : "items-start justify-start",
    }

  if (p["alignment-top-center"])
    return {
      styles: p["flow-vertical"]
        ? { alignItems: "center", justifyContent: "flex-start" }
        : { alignItems: "flex-start", justifyContent: "center" },
      className: p["flow-vertical"] ? "items-center justify-start" : "items-start justify-center",
    }

  if (p["alignment-top-right"])
    return {
      styles: p["flow-vertical"]
        ? { alignItems: "flex-end", justifyContent: "flex-start" }
        : { alignItems: "flex-start", justifyContent: "flex-end" },
      className: p["flow-vertical"] ? "items-end justify-start" : "items-start justify-end",
    }

  if (p["alignment-left"])
    return {
      styles: p["flow-vertical"]
        ? { alignItems: "flex-start", justifyContent: "center" }
        : { alignItems: "center", justifyContent: "flex-start" },
      className: p["flow-vertical"] ? "items-start justify-center" : "items-center justify-start",
    }

  if (p["alignment-center"])
    return {
      styles: p["flow-vertical"]
        ? { alignItems: "center", justifyContent: "center" }
        : { alignItems: "center", justifyContent: "center" },
      className: p["flow-vertical"] ? "items-center justify-center" : "items-center justify-center",
    }

  if (p["alignment-right"])
    return {
      styles: p["flow-vertical"]
        ? { alignItems: "flex-end", justifyContent: "center" }
        : { alignItems: "center", justifyContent: "flex-end" },
      className: p["flow-vertical"] ? "items-end justify-center" : "items-center justify-end",
    }

  if (p["alignment-bottom-left"])
    return {
      styles: p["flow-vertical"]
        ? { alignItems: "flex-start", justifyContent: "flex-end" }
        : { alignItems: "flex-end", justifyContent: "flex-start" },
      className: p["flow-vertical"] ? "items-start justify-end" : "items-end justify-start",
    }

  if (p["alignment-bottom-center"])
    return {
      styles: p["flow-vertical"]
        ? { alignItems: "center", justifyContent: "flex-end" }
        : { alignItems: "flex-end", justifyContent: "center" },
      className: p["flow-vertical"] ? "items-center justify-end" : "items-end justify-center",
    }

  if (p["alignment-bottom-right"])
    return {
      styles: p["flow-vertical"]
        ? { alignItems: "flex-end", justifyContent: "flex-end" }
        : { alignItems: "flex-end", justifyContent: "flex-end" },
      className: p["flow-vertical"] ? "items-end justify-end" : "items-end justify-end",
    }

  return { error: '<Frame /> – missing "alignment-" property' }
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
  return ComputeColor(p, "bg")
}

export const FrameComputeStroke = (p: FigmaStroke): FigmaPropertiesReturn => {
  return ComputeStrokeColor(p, "outline")
}

export const FrameComputeFillHover = (p: FigmaFillHover): FigmaPropertiesReturn => {
  return ComputeColorHover(p, "hover:bg")
}

export const FrameComputeStrokeHover = (p: FigmaStrokeHover): FigmaPropertiesReturn => {
  return ComputeStrokeHoverColor(p, "hover:outline")
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
  const fill = ComputeColor(p, "text")

  if (fill.className !== "") {
    return fill
  }

  return { error: '<Text /> – missing "fill-" property' }
}

export const TextComputeFillHover = (p: FigmaFillHover): FigmaPropertiesReturn => {
  return ComputeColorHover(p, "hover:text")
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
  return ComputeColor(p, "text")
}

const ComputeColor = (
  p: FigmaFill & FigmaStroke & FigmaStrokeStyle,
  property: "bg" | "text" | "fill",
): FigmaPropertiesReturn => {
  if (p["fill-white"]) return { className: `${property}-white` }
  if (p["fill-black"]) return { className: `${property}-black` }

  if (p["fill-darken"]) return { className: `${property}-darken` }
  if (p["fill-lighten"]) return { className: `${property}-lighten` }

  if (p["fill-tentative-0"]) return { className: `${property}-tentative-0` }
  if (p["fill-tentative-50"]) return { className: `${property}-tentative-50` }
  if (p["fill-tentative-100"]) return { className: `${property}-tentative-100` }
  if (p["fill-tentative-200"]) return { className: `${property}-tentative-200` }
  if (p["fill-tentative-300"]) return { className: `${property}-tentative-300` }
  if (p["fill-tentative-400"]) return { className: `${property}-tentative-400` }
  if (p["fill-tentative-500"]) return { className: `${property}-tentative-500` }
  if (p["fill-tentative-600"]) return { className: `${property}-tentative-600` }
  if (p["fill-tentative-700"]) return { className: `${property}-tentative-700` }
  if (p["fill-tentative-800"]) return { className: `${property}-tentative-800` }
  if (p["fill-tentative-900"]) return { className: `${property}-tentative-900` }
  if (p["fill-tentative-brand"]) return { className: `${property}-tentative-brand` }

  if (p["fill-tertiary-0"]) return { className: `${property}-tertiary-0` }
  if (p["fill-tertiary-50"]) return { className: `${property}-tertiary-50` }
  if (p["fill-tertiary-100"]) return { className: `${property}-tertiary-100` }
  if (p["fill-tertiary-200"]) return { className: `${property}-tertiary-200` }
  if (p["fill-tertiary-300"]) return { className: `${property}-tertiary-300` }
  if (p["fill-tertiary-400"]) return { className: `${property}-tertiary-400` }
  if (p["fill-tertiary-500"]) return { className: `${property}-tertiary-500` }
  if (p["fill-tertiary-600"]) return { className: `${property}-tertiary-600` }
  if (p["fill-tertiary-700"]) return { className: `${property}-tertiary-700` }
  if (p["fill-tertiary-800"]) return { className: `${property}-tertiary-800` }
  if (p["fill-tertiary-900"]) return { className: `${property}-tertiary-900` }
  if (p["fill-tertiary-brand"]) return { className: `${property}-tertiary-brand` }

  if (p["fill-positive-0"]) return { className: `${property}-positive-0` }
  if (p["fill-positive-50"]) return { className: `${property}-positive-50` }
  if (p["fill-positive-100"]) return { className: `${property}-positive-100` }
  if (p["fill-positive-200"]) return { className: `${property}-positive-200` }
  if (p["fill-positive-300"]) return { className: `${property}-positive-300` }
  if (p["fill-positive-400"]) return { className: `${property}-positive-400` }
  if (p["fill-positive-500"]) return { className: `${property}-positive-500` }
  if (p["fill-positive-600"]) return { className: `${property}-positive-600` }
  if (p["fill-positive-700"]) return { className: `${property}-positive-700` }
  if (p["fill-positive-800"]) return { className: `${property}-positive-800` }
  if (p["fill-positive-900"]) return { className: `${property}-positive-900` }
  if (p["fill-positive-brand"]) return { className: `${property}-positive-brand` }

  if (p["fill-negative-0"]) return { className: `${property}-negative-0` }
  if (p["fill-negative-50"]) return { className: `${property}-negative-50` }
  if (p["fill-negative-100"]) return { className: `${property}-negative-100` }
  if (p["fill-negative-200"]) return { className: `${property}-negative-200` }
  if (p["fill-negative-300"]) return { className: `${property}-negative-300` }
  if (p["fill-negative-400"]) return { className: `${property}-negative-400` }
  if (p["fill-negative-500"]) return { className: `${property}-negative-500` }
  if (p["fill-negative-600"]) return { className: `${property}-negative-600` }
  if (p["fill-negative-700"]) return { className: `${property}-negative-700` }
  if (p["fill-negative-800"]) return { className: `${property}-negative-800` }
  if (p["fill-negative-900"]) return { className: `${property}-negative-900` }
  if (p["fill-negative-brand"]) return { className: `${property}-negative-brand` }

  if (p["fill-secondary-0"]) return { className: `${property}-secondary-0` }
  if (p["fill-secondary-50"]) return { className: `${property}-secondary-50` }
  if (p["fill-secondary-100"]) return { className: `${property}-secondary-100` }
  if (p["fill-secondary-200"]) return { className: `${property}-secondary-200` }
  if (p["fill-secondary-300"]) return { className: `${property}-secondary-300` }
  if (p["fill-secondary-400"]) return { className: `${property}-secondary-400` }
  if (p["fill-secondary-500"]) return { className: `${property}-secondary-500` }
  if (p["fill-secondary-600"]) return { className: `${property}-secondary-600` }
  if (p["fill-secondary-700"]) return { className: `${property}-secondary-700` }
  if (p["fill-secondary-800"]) return { className: `${property}-secondary-800` }
  if (p["fill-secondary-900"]) return { className: `${property}-secondary-900` }
  if (p["fill-secondary-brand"]) return { className: `${property}-secondary-brand` }

  if (p["fill-primary-0"]) return { className: `${property}-primary-0` }
  if (p["fill-primary-50"]) return { className: `${property}-primary-50` }
  if (p["fill-primary-100"]) return { className: `${property}-primary-100` }
  if (p["fill-primary-200"]) return { className: `${property}-primary-200` }
  if (p["fill-primary-300"]) return { className: `${property}-primary-300` }
  if (p["fill-primary-400"]) return { className: `${property}-primary-400` }
  if (p["fill-primary-500"]) return { className: `${property}-primary-500` }
  if (p["fill-primary-600"]) return { className: `${property}-primary-600` }
  if (p["fill-primary-700"]) return { className: `${property}-primary-700` }
  if (p["fill-primary-800"]) return { className: `${property}-primary-800` }
  if (p["fill-primary-900"]) return { className: `${property}-primary-900` }
  if (p["fill-primary-brand"]) return { className: `${property}-primary-brand` }

  if (p["fill-neutral-0"]) return { className: `${property}-neutral-0` }
  if (p["fill-neutral-50"]) return { className: `${property}-neutral-50` }
  if (p["fill-neutral-100"]) return { className: `${property}-neutral-100` }
  if (p["fill-neutral-200"]) return { className: `${property}-neutral-200` }
  if (p["fill-neutral-300"]) return { className: `${property}-neutral-300` }
  if (p["fill-neutral-400"]) return { className: `${property}-neutral-400` }
  if (p["fill-neutral-500"]) return { className: `${property}-neutral-500` }
  if (p["fill-neutral-600"]) return { className: `${property}-neutral-600` }
  if (p["fill-neutral-700"]) return { className: `${property}-neutral-700` }
  if (p["fill-neutral-800"]) return { className: `${property}-neutral-800` }
  if (p["fill-neutral-900"]) return { className: `${property}-neutral-900` }

  if (p["fill-neutralsurface-0"]) return { className: `${property}-neutralsurface-0` }
  if (p["fill-neutralsurface-50"]) return { className: `${property}-neutralsurface-50` }
  if (p["fill-neutralsurface-100"]) return { className: `${property}-neutralsurface-100` }
  if (p["fill-neutralsurface-200"]) return { className: `${property}-neutralsurface-200` }
  if (p["fill-neutralsurface-300"]) return { className: `${property}-neutralsurface-300` }
  if (p["fill-neutralsurface-400"]) return { className: `${property}-neutralsurface-400` }
  if (p["fill-neutralsurface-500"]) return { className: `${property}-neutralsurface-500` }
  if (p["fill-neutralsurface-600"]) return { className: `${property}-neutralsurface-600` }
  if (p["fill-neutralsurface-700"]) return { className: `${property}-neutralsurface-700` }
  if (p["fill-neutralsurface-800"]) return { className: `${property}-neutralsurface-800` }
  if (p["fill-neutralsurface-900"]) return { className: `${property}-neutralsurface-900` }
  if (p["fill-neutralsurface-brand"]) return { className: `${property}-neutralsurface-brand` }

  if (p["fill-text-0"]) return { className: `${property}-text-0` }
  if (p["fill-text-50"]) return { className: `${property}-text-50` }
  if (p["fill-text-100"]) return { className: `${property}-text-100` }
  if (p["fill-text-200"]) return { className: `${property}-text-200` }
  if (p["fill-text-300"]) return { className: `${property}-text-300` }
  if (p["fill-text-400"]) return { className: `${property}-text-400` }
  if (p["fill-text-500"]) return { className: `${property}-text-500` }
  if (p["fill-text-600"]) return { className: `${property}-text-600` }
  if (p["fill-text-700"]) return { className: `${property}-text-700` }
  if (p["fill-text-800"]) return { className: `${property}-text-800` }
  if (p["fill-text-900"]) return { className: `${property}-text-900` }
  if (p["fill-text-brand"]) return { className: `${property}-text-brand` }

  return { className: "" }
}

const ComputeColorHover = (
  p: FigmaFillHover,
  property: "hover:bg" | "hover:text" | "hover:fill",
): FigmaPropertiesReturn => {
  if (p["fill-hover-white"]) return { className: `${property}-white` }
  if (p["fill-hover-black"]) return { className: `${property}-black` }

  if (p["fill-hover-darken"]) return { className: `${property}-darken` }
  if (p["fill-hover-lighten"]) return { className: `${property}-lighten` }

  if (p["fill-hover-tentative-0"]) return { className: `${property}-tentative-0` }
  if (p["fill-hover-tentative-50"]) return { className: `${property}-tentative-50` }
  if (p["fill-hover-tentative-100"]) return { className: `${property}-tentative-100` }
  if (p["fill-hover-tentative-200"]) return { className: `${property}-tentative-200` }
  if (p["fill-hover-tentative-300"]) return { className: `${property}-tentative-300` }
  if (p["fill-hover-tentative-400"]) return { className: `${property}-tentative-400` }
  if (p["fill-hover-tentative-500"]) return { className: `${property}-tentative-500` }
  if (p["fill-hover-tentative-600"]) return { className: `${property}-tentative-600` }
  if (p["fill-hover-tentative-700"]) return { className: `${property}-tentative-700` }
  if (p["fill-hover-tentative-800"]) return { className: `${property}-tentative-800` }
  if (p["fill-hover-tentative-900"]) return { className: `${property}-tentative-900` }
  if (p["fill-hover-tentative-brand"]) return { className: `${property}-tentative-brand` }

  if (p["fill-hover-tertiary-0"]) return { className: `${property}-tertiary-0` }
  if (p["fill-hover-tertiary-50"]) return { className: `${property}-tertiary-50` }
  if (p["fill-hover-tertiary-100"]) return { className: `${property}-tertiary-100` }
  if (p["fill-hover-tertiary-200"]) return { className: `${property}-tertiary-200` }
  if (p["fill-hover-tertiary-300"]) return { className: `${property}-tertiary-300` }
  if (p["fill-hover-tertiary-400"]) return { className: `${property}-tertiary-400` }
  if (p["fill-hover-tertiary-500"]) return { className: `${property}-tertiary-500` }
  if (p["fill-hover-tertiary-600"]) return { className: `${property}-tertiary-600` }
  if (p["fill-hover-tertiary-700"]) return { className: `${property}-tertiary-700` }
  if (p["fill-hover-tertiary-800"]) return { className: `${property}-tertiary-800` }
  if (p["fill-hover-tertiary-900"]) return { className: `${property}-tertiary-900` }
  if (p["fill-hover-tertiary-brand"]) return { className: `${property}-tertiary-brand` }

  if (p["fill-hover-positive-0"]) return { className: `${property}-positive-0` }
  if (p["fill-hover-positive-50"]) return { className: `${property}-positive-50` }
  if (p["fill-hover-positive-100"]) return { className: `${property}-positive-100` }
  if (p["fill-hover-positive-200"]) return { className: `${property}-positive-200` }
  if (p["fill-hover-positive-300"]) return { className: `${property}-positive-300` }
  if (p["fill-hover-positive-400"]) return { className: `${property}-positive-400` }
  if (p["fill-hover-positive-500"]) return { className: `${property}-positive-500` }
  if (p["fill-hover-positive-600"]) return { className: `${property}-positive-600` }
  if (p["fill-hover-positive-700"]) return { className: `${property}-positive-700` }
  if (p["fill-hover-positive-800"]) return { className: `${property}-positive-800` }
  if (p["fill-hover-positive-900"]) return { className: `${property}-positive-900` }
  if (p["fill-hover-positive-brand"]) return { className: `${property}-positive-brand` }

  if (p["fill-hover-negative-0"]) return { className: `${property}-negative-0` }
  if (p["fill-hover-negative-50"]) return { className: `${property}-negative-50` }
  if (p["fill-hover-negative-100"]) return { className: `${property}-negative-100` }
  if (p["fill-hover-negative-200"]) return { className: `${property}-negative-200` }
  if (p["fill-hover-negative-300"]) return { className: `${property}-negative-300` }
  if (p["fill-hover-negative-400"]) return { className: `${property}-negative-400` }
  if (p["fill-hover-negative-500"]) return { className: `${property}-negative-500` }
  if (p["fill-hover-negative-600"]) return { className: `${property}-negative-600` }
  if (p["fill-hover-negative-700"]) return { className: `${property}-negative-700` }
  if (p["fill-hover-negative-800"]) return { className: `${property}-negative-800` }
  if (p["fill-hover-negative-900"]) return { className: `${property}-negative-900` }
  if (p["fill-hover-negative-brand"]) return { className: `${property}-negative-brand` }

  if (p["fill-hover-secondary-0"]) return { className: `${property}-secondary-0` }
  if (p["fill-hover-secondary-50"]) return { className: `${property}-secondary-50` }
  if (p["fill-hover-secondary-100"]) return { className: `${property}-secondary-100` }
  if (p["fill-hover-secondary-200"]) return { className: `${property}-secondary-200` }
  if (p["fill-hover-secondary-300"]) return { className: `${property}-secondary-300` }
  if (p["fill-hover-secondary-400"]) return { className: `${property}-secondary-400` }
  if (p["fill-hover-secondary-500"]) return { className: `${property}-secondary-500` }
  if (p["fill-hover-secondary-600"]) return { className: `${property}-secondary-600` }
  if (p["fill-hover-secondary-700"]) return { className: `${property}-secondary-700` }
  if (p["fill-hover-secondary-800"]) return { className: `${property}-secondary-800` }
  if (p["fill-hover-secondary-900"]) return { className: `${property}-secondary-900` }
  if (p["fill-hover-secondary-brand"]) return { className: `${property}-secondary-brand` }

  if (p["fill-hover-primary-0"]) return { className: `${property}-primary-0` }
  if (p["fill-hover-primary-50"]) return { className: `${property}-primary-50` }
  if (p["fill-hover-primary-100"]) return { className: `${property}-primary-100` }
  if (p["fill-hover-primary-200"]) return { className: `${property}-primary-200` }
  if (p["fill-hover-primary-300"]) return { className: `${property}-primary-300` }
  if (p["fill-hover-primary-400"]) return { className: `${property}-primary-400` }
  if (p["fill-hover-primary-500"]) return { className: `${property}-primary-500` }
  if (p["fill-hover-primary-600"]) return { className: `${property}-primary-600` }
  if (p["fill-hover-primary-700"]) return { className: `${property}-primary-700` }
  if (p["fill-hover-primary-800"]) return { className: `${property}-primary-800` }
  if (p["fill-hover-primary-900"]) return { className: `${property}-primary-900` }
  if (p["fill-hover-primary-brand"]) return { className: `${property}-primary-brand` }

  if (p["fill-hover-neutral-0"]) return { className: `${property}-neutral-0` }
  if (p["fill-hover-neutral-50"]) return { className: `${property}-neutral-50` }
  if (p["fill-hover-neutral-100"]) return { className: `${property}-neutral-100` }
  if (p["fill-hover-neutral-200"]) return { className: `${property}-neutral-200` }
  if (p["fill-hover-neutral-300"]) return { className: `${property}-neutral-300` }
  if (p["fill-hover-neutral-400"]) return { className: `${property}-neutral-400` }
  if (p["fill-hover-neutral-500"]) return { className: `${property}-neutral-500` }
  if (p["fill-hover-neutral-600"]) return { className: `${property}-neutral-600` }
  if (p["fill-hover-neutral-700"]) return { className: `${property}-neutral-700` }
  if (p["fill-hover-neutral-800"]) return { className: `${property}-neutral-800` }
  if (p["fill-hover-neutral-900"]) return { className: `${property}-neutral-900` }

  if (p["fill-hover-neutralsurface-0"]) return { className: `${property}-neutralsurface-0` }
  if (p["fill-hover-neutralsurface-50"]) return { className: `${property}-neutralsurface-50` }
  if (p["fill-hover-neutralsurface-100"]) return { className: `${property}-neutralsurface-100` }
  if (p["fill-hover-neutralsurface-200"]) return { className: `${property}-neutralsurface-200` }
  if (p["fill-hover-neutralsurface-300"]) return { className: `${property}-neutralsurface-300` }
  if (p["fill-hover-neutralsurface-400"]) return { className: `${property}-neutralsurface-400` }
  if (p["fill-hover-neutralsurface-500"]) return { className: `${property}-neutralsurface-500` }
  if (p["fill-hover-neutralsurface-600"]) return { className: `${property}-neutralsurface-600` }
  if (p["fill-hover-neutralsurface-700"]) return { className: `${property}-neutralsurface-700` }
  if (p["fill-hover-neutralsurface-800"]) return { className: `${property}-neutralsurface-800` }
  if (p["fill-hover-neutralsurface-900"]) return { className: `${property}-neutralsurface-900` }
  if (p["fill-hover-neutralsurface-brand"]) return { className: `${property}-neutralsurface-brand` }

  if (p["fill-hover-text-0"]) return { className: `${property}-text-0` }
  if (p["fill-hover-text-50"]) return { className: `${property}-text-50` }
  if (p["fill-hover-text-100"]) return { className: `${property}-text-100` }
  if (p["fill-hover-text-200"]) return { className: `${property}-text-200` }
  if (p["fill-hover-text-300"]) return { className: `${property}-text-300` }
  if (p["fill-hover-text-400"]) return { className: `${property}-text-400` }
  if (p["fill-hover-text-500"]) return { className: `${property}-text-500` }
  if (p["fill-hover-text-600"]) return { className: `${property}-text-600` }
  if (p["fill-hover-text-700"]) return { className: `${property}-text-700` }
  if (p["fill-hover-text-800"]) return { className: `${property}-text-800` }
  if (p["fill-hover-text-900"]) return { className: `${property}-text-900` }
  if (p["fill-hover-text-brand"]) return { className: `${property}-text-brand` }

  return { className: "" }
}

const ComputeStrokeColor = (p: FigmaStroke & FigmaStrokeStyle, property: "outline"): FigmaPropertiesReturn => {
  const s = `outline-1 outline -outline-offset-1 ${p["stroke-style-dashed"] ? "outline-dashed" : ""}`

  if (p["stroke-white"]) return { className: `${property}-white ${s}` }
  if (p["stroke-black"]) return { className: `${property}-black ${s}` }

  if (p["stroke-darken"]) return { className: `${property}-darken ${s}` }
  if (p["stroke-lighten"]) return { className: `${property}-lighten ${s}` }

  if (p["stroke-tentative-0"]) return { className: `${property}-tentative-0 ${s}` }
  if (p["stroke-tentative-50"]) return { className: `${property}-tentative-50 ${s}` }
  if (p["stroke-tentative-100"]) return { className: `${property}-tentative-100 ${s}` }
  if (p["stroke-tentative-200"]) return { className: `${property}-tentative-200 ${s}` }
  if (p["stroke-tentative-300"]) return { className: `${property}-tentative-300 ${s}` }
  if (p["stroke-tentative-400"]) return { className: `${property}-tentative-400 ${s}` }
  if (p["stroke-tentative-500"]) return { className: `${property}-tentative-500 ${s}` }
  if (p["stroke-tentative-600"]) return { className: `${property}-tentative-600 ${s}` }
  if (p["stroke-tentative-700"]) return { className: `${property}-tentative-700 ${s}` }
  if (p["stroke-tentative-800"]) return { className: `${property}-tentative-800 ${s}` }
  if (p["stroke-tentative-900"]) return { className: `${property}-tentative-900 ${s}` }
  if (p["stroke-tentative-brand"]) return { className: `${property}-tentative-brand ${s}` }

  if (p["stroke-tertiary-0"]) return { className: `${property}-tertiary-0 ${s}` }
  if (p["stroke-tertiary-50"]) return { className: `${property}-tertiary-50 ${s}` }
  if (p["stroke-tertiary-100"]) return { className: `${property}-tertiary-100 ${s}` }
  if (p["stroke-tertiary-200"]) return { className: `${property}-tertiary-200 ${s}` }
  if (p["stroke-tertiary-300"]) return { className: `${property}-tertiary-300 ${s}` }
  if (p["stroke-tertiary-400"]) return { className: `${property}-tertiary-400 ${s}` }
  if (p["stroke-tertiary-500"]) return { className: `${property}-tertiary-500 ${s}` }
  if (p["stroke-tertiary-600"]) return { className: `${property}-tertiary-600 ${s}` }
  if (p["stroke-tertiary-700"]) return { className: `${property}-tertiary-700 ${s}` }
  if (p["stroke-tertiary-800"]) return { className: `${property}-tertiary-800 ${s}` }
  if (p["stroke-tertiary-900"]) return { className: `${property}-tertiary-900 ${s}` }
  if (p["stroke-tertiary-brand"]) return { className: `${property}-tertiary-brand ${s}` }

  if (p["stroke-positive-0"]) return { className: `${property}-positive-0 ${s}` }
  if (p["stroke-positive-50"]) return { className: `${property}-positive-50 ${s}` }
  if (p["stroke-positive-100"]) return { className: `${property}-positive-100 ${s}` }
  if (p["stroke-positive-200"]) return { className: `${property}-positive-200 ${s}` }
  if (p["stroke-positive-300"]) return { className: `${property}-positive-300 ${s}` }
  if (p["stroke-positive-400"]) return { className: `${property}-positive-400 ${s}` }
  if (p["stroke-positive-500"]) return { className: `${property}-positive-500 ${s}` }
  if (p["stroke-positive-600"]) return { className: `${property}-positive-600 ${s}` }
  if (p["stroke-positive-700"]) return { className: `${property}-positive-700 ${s}` }
  if (p["stroke-positive-800"]) return { className: `${property}-positive-800 ${s}` }
  if (p["stroke-positive-900"]) return { className: `${property}-positive-900 ${s}` }
  if (p["stroke-positive-brand"]) return { className: `${property}-positive-brand` }

  if (p["stroke-negative-0"]) return { className: `${property}-negative-0 ${s}` }
  if (p["stroke-negative-50"]) return { className: `${property}-negative-50 ${s}` }
  if (p["stroke-negative-100"]) return { className: `${property}-negative-100 ${s}` }
  if (p["stroke-negative-200"]) return { className: `${property}-negative-200 ${s}` }
  if (p["stroke-negative-300"]) return { className: `${property}-negative-300 ${s}` }
  if (p["stroke-negative-400"]) return { className: `${property}-negative-400 ${s}` }
  if (p["stroke-negative-500"]) return { className: `${property}-negative-500 ${s}` }
  if (p["stroke-negative-600"]) return { className: `${property}-negative-600 ${s}` }
  if (p["stroke-negative-700"]) return { className: `${property}-negative-700 ${s}` }
  if (p["stroke-negative-800"]) return { className: `${property}-negative-800 ${s}` }
  if (p["stroke-negative-900"]) return { className: `${property}-negative-900 ${s}` }
  if (p["stroke-negative-brand"]) return { className: `${property}-negative-brand ${s}` }

  if (p["stroke-secondary-0"]) return { className: `${property}-secondary-0 ${s}` }
  if (p["stroke-secondary-50"]) return { className: `${property}-secondary-50 ${s}` }
  if (p["stroke-secondary-100"]) return { className: `${property}-secondary-100 ${s}` }
  if (p["stroke-secondary-200"]) return { className: `${property}-secondary-200 ${s}` }
  if (p["stroke-secondary-300"]) return { className: `${property}-secondary-300 ${s}` }
  if (p["stroke-secondary-400"]) return { className: `${property}-secondary-400 ${s}` }
  if (p["stroke-secondary-500"]) return { className: `${property}-secondary-500 ${s}` }
  if (p["stroke-secondary-600"]) return { className: `${property}-secondary-600 ${s}` }
  if (p["stroke-secondary-700"]) return { className: `${property}-secondary-700 ${s}` }
  if (p["stroke-secondary-800"]) return { className: `${property}-secondary-800 ${s}` }
  if (p["stroke-secondary-900"]) return { className: `${property}-secondary-900 ${s}` }
  if (p["stroke-secondary-brand"]) return { className: `${property}-secondary-brand ${s}` }

  if (p["stroke-primary-0"]) return { className: `${property}-primary-0 ${s}` }
  if (p["stroke-primary-50"]) return { className: `${property}-primary-50 ${s}` }
  if (p["stroke-primary-100"]) return { className: `${property}-primary-100 ${s}` }
  if (p["stroke-primary-200"]) return { className: `${property}-primary-200 ${s}` }
  if (p["stroke-primary-300"]) return { className: `${property}-primary-300 ${s}` }
  if (p["stroke-primary-400"]) return { className: `${property}-primary-400 ${s}` }
  if (p["stroke-primary-500"]) return { className: `${property}-primary-500 ${s}` }
  if (p["stroke-primary-600"]) return { className: `${property}-primary-600 ${s}` }
  if (p["stroke-primary-700"]) return { className: `${property}-primary-700 ${s}` }
  if (p["stroke-primary-800"]) return { className: `${property}-primary-800 ${s}` }
  if (p["stroke-primary-900"]) return { className: `${property}-primary-900 ${s}` }
  if (p["stroke-primary-brand"]) return { className: `${property}-primary-brand ${s}` }

  if (p["stroke-neutral-0"]) return { className: `${property}-neutral-0 ${s}` }
  if (p["stroke-neutral-50"]) return { className: `${property}-neutral-50 ${s}` }
  if (p["stroke-neutral-100"]) return { className: `${property}-neutral-100 ${s}` }
  if (p["stroke-neutral-200"]) return { className: `${property}-neutral-200 ${s}` }
  if (p["stroke-neutral-300"]) return { className: `${property}-neutral-300 ${s}` }
  if (p["stroke-neutral-400"]) return { className: `${property}-neutral-400 ${s}` }
  if (p["stroke-neutral-500"]) return { className: `${property}-neutral-500 ${s}` }
  if (p["stroke-neutral-600"]) return { className: `${property}-neutral-600 ${s}` }
  if (p["stroke-neutral-700"]) return { className: `${property}-neutral-700 ${s}` }
  if (p["stroke-neutral-800"]) return { className: `${property}-neutral-800 ${s}` }
  if (p["stroke-neutral-900"]) return { className: `${property}-neutral-900 ${s}` }
  if (p["stroke-neutral-brand"]) return { className: `${property}-neutral-brand ${s}` }

  if (p["stroke-neutralsurface-0"]) return { className: `${property}-neutralsurface-0 ${s}` }
  if (p["stroke-neutralsurface-50"]) return { className: `${property}-neutralsurface-50 ${s}` }
  if (p["stroke-neutralsurface-100"]) return { className: `${property}-neutralsurface-100 ${s}` }
  if (p["stroke-neutralsurface-200"]) return { className: `${property}-neutralsurface-200 ${s}` }
  if (p["stroke-neutralsurface-300"]) return { className: `${property}-neutralsurface-300 ${s}` }
  if (p["stroke-neutralsurface-400"]) return { className: `${property}-neutralsurface-400 ${s}` }
  if (p["stroke-neutralsurface-500"]) return { className: `${property}-neutralsurface-500 ${s}` }
  if (p["stroke-neutralsurface-600"]) return { className: `${property}-neutralsurface-600 ${s}` }
  if (p["stroke-neutralsurface-700"]) return { className: `${property}-neutralsurface-700 ${s}` }
  if (p["stroke-neutralsurface-800"]) return { className: `${property}-neutralsurface-800 ${s}` }
  if (p["stroke-neutralsurface-900"]) return { className: `${property}-neutralsurface-900 ${s}` }
  if (p["stroke-neutralsurface-brand"]) return { className: `${property}-neutralsurface-brand ${s}` }

  if (p["stroke-text-0"]) return { className: `${property}-text-0 ${s}` }
  if (p["stroke-text-50"]) return { className: `${property}-text-50 ${s}` }
  if (p["stroke-text-100"]) return { className: `${property}-text-100 ${s}` }
  if (p["stroke-text-200"]) return { className: `${property}-text-200 ${s}` }
  if (p["stroke-text-300"]) return { className: `${property}-text-300 ${s}` }
  if (p["stroke-text-400"]) return { className: `${property}-text-400 ${s}` }
  if (p["stroke-text-500"]) return { className: `${property}-text-500 ${s}` }
  if (p["stroke-text-600"]) return { className: `${property}-text-600 ${s}` }
  if (p["stroke-text-700"]) return { className: `${property}-text-700 ${s}` }
  if (p["stroke-text-800"]) return { className: `${property}-text-800 ${s}` }
  if (p["stroke-text-900"]) return { className: `${property}-text-900 ${s}` }
  if (p["stroke-text-brand"]) return { className: `${property}-text-brand ${s}` }

  return { className: "" }
}

const ComputeStrokeHoverColor = (p: FigmaStrokeHover, property: "hover:outline"): FigmaPropertiesReturn => {
  if (p["stroke-hover-white"]) return { className: `${property}-white` }
  if (p["stroke-hover-black"]) return { className: `${property}-black` }

  if (p["stroke-hover-darken"]) return { className: `${property}-darken` }
  if (p["stroke-hover-lighten"]) return { className: `${property}-lighten` }

  if (p["stroke-hover-tentative-0"]) return { className: `${property}-tentative-0` }
  if (p["stroke-hover-tentative-50"]) return { className: `${property}-tentative-50` }
  if (p["stroke-hover-tentative-100"]) return { className: `${property}-tentative-100` }
  if (p["stroke-hover-tentative-200"]) return { className: `${property}-tentative-200` }
  if (p["stroke-hover-tentative-300"]) return { className: `${property}-tentative-300` }
  if (p["stroke-hover-tentative-400"]) return { className: `${property}-tentative-400` }
  if (p["stroke-hover-tentative-500"]) return { className: `${property}-tentative-500` }
  if (p["stroke-hover-tentative-600"]) return { className: `${property}-tentative-600` }
  if (p["stroke-hover-tentative-700"]) return { className: `${property}-tentative-700` }
  if (p["stroke-hover-tentative-800"]) return { className: `${property}-tentative-800` }
  if (p["stroke-hover-tentative-900"]) return { className: `${property}-tentative-900` }
  if (p["stroke-hover-tentative-brand"]) return { className: `${property}-tentative-brand` }

  if (p["stroke-hover-tertiary-0"]) return { className: `${property}-tertiary-0` }
  if (p["stroke-hover-tertiary-50"]) return { className: `${property}-tertiary-50` }
  if (p["stroke-hover-tertiary-100"]) return { className: `${property}-tertiary-100` }
  if (p["stroke-hover-tertiary-200"]) return { className: `${property}-tertiary-200` }
  if (p["stroke-hover-tertiary-300"]) return { className: `${property}-tertiary-300` }
  if (p["stroke-hover-tertiary-400"]) return { className: `${property}-tertiary-400` }
  if (p["stroke-hover-tertiary-500"]) return { className: `${property}-tertiary-500` }
  if (p["stroke-hover-tertiary-600"]) return { className: `${property}-tertiary-600` }
  if (p["stroke-hover-tertiary-700"]) return { className: `${property}-tertiary-700` }
  if (p["stroke-hover-tertiary-800"]) return { className: `${property}-tertiary-800` }
  if (p["stroke-hover-tertiary-900"]) return { className: `${property}-tertiary-900` }
  if (p["stroke-hover-tertiary-brand"]) return { className: `${property}-tertiary-brand` }

  if (p["stroke-hover-positive-0"]) return { className: `${property}-positive-0` }
  if (p["stroke-hover-positive-50"]) return { className: `${property}-positive-50` }
  if (p["stroke-hover-positive-100"]) return { className: `${property}-positive-100` }
  if (p["stroke-hover-positive-200"]) return { className: `${property}-positive-200` }
  if (p["stroke-hover-positive-300"]) return { className: `${property}-positive-300` }
  if (p["stroke-hover-positive-400"]) return { className: `${property}-positive-400` }
  if (p["stroke-hover-positive-500"]) return { className: `${property}-positive-500` }
  if (p["stroke-hover-positive-600"]) return { className: `${property}-positive-600` }
  if (p["stroke-hover-positive-700"]) return { className: `${property}-positive-700` }
  if (p["stroke-hover-positive-800"]) return { className: `${property}-positive-800` }
  if (p["stroke-hover-positive-900"]) return { className: `${property}-positive-900` }
  if (p["stroke-hover-positive-brand"]) return { className: `${property}-positive-brand` }

  if (p["stroke-hover-negative-0"]) return { className: `${property}-negative-0` }
  if (p["stroke-hover-negative-50"]) return { className: `${property}-negative-50` }
  if (p["stroke-hover-negative-100"]) return { className: `${property}-negative-100` }
  if (p["stroke-hover-negative-200"]) return { className: `${property}-negative-200` }
  if (p["stroke-hover-negative-300"]) return { className: `${property}-negative-300` }
  if (p["stroke-hover-negative-400"]) return { className: `${property}-negative-400` }
  if (p["stroke-hover-negative-500"]) return { className: `${property}-negative-500` }
  if (p["stroke-hover-negative-600"]) return { className: `${property}-negative-600` }
  if (p["stroke-hover-negative-700"]) return { className: `${property}-negative-700` }
  if (p["stroke-hover-negative-800"]) return { className: `${property}-negative-800` }
  if (p["stroke-hover-negative-900"]) return { className: `${property}-negative-900` }
  if (p["stroke-hover-negative-brand"]) return { className: `${property}-negative-brand` }

  if (p["stroke-hover-secondary-0"]) return { className: `${property}-secondary-0` }
  if (p["stroke-hover-secondary-50"]) return { className: `${property}-secondary-50` }
  if (p["stroke-hover-secondary-100"]) return { className: `${property}-secondary-100` }
  if (p["stroke-hover-secondary-200"]) return { className: `${property}-secondary-200` }
  if (p["stroke-hover-secondary-300"]) return { className: `${property}-secondary-300` }
  if (p["stroke-hover-secondary-400"]) return { className: `${property}-secondary-400` }
  if (p["stroke-hover-secondary-500"]) return { className: `${property}-secondary-500` }
  if (p["stroke-hover-secondary-600"]) return { className: `${property}-secondary-600` }
  if (p["stroke-hover-secondary-700"]) return { className: `${property}-secondary-700` }
  if (p["stroke-hover-secondary-800"]) return { className: `${property}-secondary-800` }
  if (p["stroke-hover-secondary-900"]) return { className: `${property}-secondary-900` }
  if (p["stroke-hover-secondary-brand"]) return { className: `${property}-secondary-brand` }

  if (p["stroke-hover-primary-0"]) return { className: `${property}-primary-0` }
  if (p["stroke-hover-primary-50"]) return { className: `${property}-primary-50` }
  if (p["stroke-hover-primary-100"]) return { className: `${property}-primary-100` }
  if (p["stroke-hover-primary-200"]) return { className: `${property}-primary-200` }
  if (p["stroke-hover-primary-300"]) return { className: `${property}-primary-300` }
  if (p["stroke-hover-primary-400"]) return { className: `${property}-primary-400` }
  if (p["stroke-hover-primary-500"]) return { className: `${property}-primary-500` }
  if (p["stroke-hover-primary-600"]) return { className: `${property}-primary-600` }
  if (p["stroke-hover-primary-700"]) return { className: `${property}-primary-700` }
  if (p["stroke-hover-primary-800"]) return { className: `${property}-primary-800` }
  if (p["stroke-hover-primary-900"]) return { className: `${property}-primary-900` }
  if (p["stroke-hover-primary-brand"]) return { className: `${property}-primary-brand` }

  if (p["stroke-hover-neutral-0"]) return { className: `${property}-neutral-0` }
  if (p["stroke-hover-neutral-50"]) return { className: `${property}-neutral-50` }
  if (p["stroke-hover-neutral-100"]) return { className: `${property}-neutral-100` }
  if (p["stroke-hover-neutral-200"]) return { className: `${property}-neutral-200` }
  if (p["stroke-hover-neutral-300"]) return { className: `${property}-neutral-300` }
  if (p["stroke-hover-neutral-400"]) return { className: `${property}-neutral-400` }
  if (p["stroke-hover-neutral-500"]) return { className: `${property}-neutral-500` }
  if (p["stroke-hover-neutral-600"]) return { className: `${property}-neutral-600` }
  if (p["stroke-hover-neutral-700"]) return { className: `${property}-neutral-700` }
  if (p["stroke-hover-neutral-800"]) return { className: `${property}-neutral-800` }
  if (p["stroke-hover-neutral-900"]) return { className: `${property}-neutral-900` }

  if (p["stroke-hover-neutralsurface-0"]) return { className: `${property}-neutralsurface-0` }
  if (p["stroke-hover-neutralsurface-50"]) return { className: `${property}-neutralsurface-50` }
  if (p["stroke-hover-neutralsurface-100"]) return { className: `${property}-neutralsurface-100` }
  if (p["stroke-hover-neutralsurface-200"]) return { className: `${property}-neutralsurface-200` }
  if (p["stroke-hover-neutralsurface-300"]) return { className: `${property}-neutralsurface-300` }
  if (p["stroke-hover-neutralsurface-400"]) return { className: `${property}-neutralsurface-400` }
  if (p["stroke-hover-neutralsurface-500"]) return { className: `${property}-neutralsurface-500` }
  if (p["stroke-hover-neutralsurface-600"]) return { className: `${property}-neutralsurface-600` }
  if (p["stroke-hover-neutralsurface-700"]) return { className: `${property}-neutralsurface-700` }
  if (p["stroke-hover-neutralsurface-800"]) return { className: `${property}-neutralsurface-800` }
  if (p["stroke-hover-neutralsurface-900"]) return { className: `${property}-neutralsurface-900` }
  if (p["stroke-hover-neutralsurface-brand"]) return { className: `${property}-neutralsurface-brand` }

  if (p["stroke-hover-text-0"]) return { className: `${property}-text-0` }
  if (p["stroke-hover-text-50"]) return { className: `${property}-text-50` }
  if (p["stroke-hover-text-100"]) return { className: `${property}-text-100` }
  if (p["stroke-hover-text-200"]) return { className: `${property}-text-200` }
  if (p["stroke-hover-text-300"]) return { className: `${property}-text-300` }
  if (p["stroke-hover-text-400"]) return { className: `${property}-text-400` }
  if (p["stroke-hover-text-500"]) return { className: `${property}-text-500` }
  if (p["stroke-hover-text-600"]) return { className: `${property}-text-600` }
  if (p["stroke-hover-text-700"]) return { className: `${property}-text-700` }
  if (p["stroke-hover-text-800"]) return { className: `${property}-text-800` }
  if (p["stroke-hover-text-900"]) return { className: `${property}-text-900` }
  if (p["stroke-hover-text-brand"]) return { className: `${property}-text-brand` }

  return { className: "" }
}

export const FontFeatureStyle: StyleProp<TextStyle> = Platform.select({
  ios: { fontVariant: ["stylistic-one"] },
  android: { fontFeatureSettings: '"ss01" 1' },
  default: {},
})
