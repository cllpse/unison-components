import type { COLORS } from "../constants/colors"
import type { CONTAINERS, RADII, SHADOWS, TEXT_SIZES, UNITS } from "../constants/units"
import type { ClassName, StyleNative, StyleWeb } from "./elementProperties"

type Simplify<T> = {
  [KeyType in keyof T]: T[KeyType]
}

type UnionToIntersection<U> = (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void ? I : never

type UnitsFlags<prefix extends string> = {
  [key in keyof typeof UNITS as `${prefix}${key & (string | number)}`]?: boolean
}

type RadiusFlags<prefix extends string> = {
  [key in keyof typeof RADII as `${prefix}${key}`]?: boolean
}

type AdditionalUnitsFlags<prefix extends string, Suffix extends string = "hug" | "fill" | "full"> = {
  [key in Suffix as `${prefix}${key}`]?: boolean
}

type Colors = typeof COLORS

type Color<prefix extends string> = UnionToIntersection<
  {
    [color in keyof Colors]: Colors[color] extends string
      ? {
          [key in color as `${prefix}${key & string}`]?: boolean
        }
      : {
          [level in keyof Colors[color] as `${prefix}${color & string}-${level & (string | number)}`]?: boolean
        }
  }[keyof Colors]
>

export type FigmaPropertiesReturnError = {
  error?: string
  styles?: StyleNative & StyleWeb
  className?: ClassName
}

export type FigmaPropertiesReturn = {
  styles?: StyleNative & StyleWeb
  className?: ClassName
}

/** Width also takes Tailwind's container scale (`width-md`, 448px). */
export type FigmaFrameWidth = Simplify<
  UnitsFlags<"width-"> &
    AdditionalUnitsFlags<"width-", "hug" | "fill"> & { [key in keyof typeof CONTAINERS as `width-${key}`]?: boolean }
>

export type FigmaFrameHeight = Simplify<UnitsFlags<"height-"> & AdditionalUnitsFlags<"height-", "hug" | "fill">>

/** `gap-` spaces items and wrapped rows alike; `gap-horizontal-` and `gap-vertical-` set one direction each. */
export type FigmaFrameGap = Simplify<UnitsFlags<"gap-"> & UnitsFlags<"gap-horizontal-"> & UnitsFlags<"gap-vertical-">>

export type FigmaPadding = Simplify<UnitsFlags<"padding-">>

export type FigmaPaddingVertical = Simplify<UnitsFlags<"padding-vertical-">>

export type FigmaPaddingHorizontal = Simplify<UnitsFlags<"padding-horizontal-">>

export type FigmaPaddingLeft = Simplify<UnitsFlags<"padding-left-">>

export type FigmaPaddingRight = Simplify<UnitsFlags<"padding-right-">>

export type FigmaPaddingTop = Simplify<UnitsFlags<"padding-top-">>

export type FigmaPaddingBottom = Simplify<UnitsFlags<"padding-bottom-">>

export type FigmaFrameCornerRadius = RadiusFlags<"corner-radius-">

export type FigmaFrameCornerRadiusTopLeft = RadiusFlags<"corner-radius-top-left-">

export type FigmaFrameCornerRadiusTopRight = RadiusFlags<"corner-radius-top-right-">

export type FigmaFrameCornerRadiusBottomLeft = RadiusFlags<"corner-radius-bottom-left-">

export type FigmaFrameCornerRadiusBottomRight = RadiusFlags<"corner-radius-bottom-right-">

export type FigmaFrameBorderRadius = RadiusFlags<"border-radius-">

export type FigmaFrameAutolayout = {
  "autolayout-horizontal"?: boolean
  "autolayout-vertical"?: boolean
}

export type FigmaFrameAutolayoutParent = {
  "autolayout-horizontal-parent"?: boolean
  "autolayout-vertical-parent"?: boolean
}

export type FigmaFrameAutolayoutDirection = "horizontal" | "vertical"

export type FigmaFrameAlignment = {
  "alignment-top-left"?: boolean
  "alignment-top-center"?: boolean
  "alignment-top-right"?: boolean

  "alignment-left"?: boolean
  "alignment-center"?: boolean
  "alignment-right"?: boolean

  "alignment-bottom-left"?: boolean
  "alignment-bottom-center"?: boolean
  "alignment-bottom-right"?: boolean
}

export type FigmaFrameVerticalPosition = "top" | "center" | "bottom"

export type FigmaFrameHorizontalPosition = "left" | "center" | "right"

export type FigmaFrameEdgePosition = "start" | "center" | "end"

export type FigmaFrameWrap = {
  wrap?: boolean
}

export type FigmaFrameEffectShadow = Simplify<
  {
    "effect-shadow-none"?: boolean
  } & { [key in (typeof SHADOWS)[number] as `effect-shadow-${key}`]?: boolean }
>

export type FigmaFrameStrokeWeight = {
  "stroke-weight-small"?: boolean
  "stroke-weight-large"?: boolean
}

export type FigmaTypography = { [key in (typeof TEXT_SIZES)[number] as `typography-${key}`]?: boolean }

export type FigmaTypographyAlignment = {
  "typography-align-left"?: boolean
  "typography-align-center"?: boolean
  "typography-align-right"?: boolean
}

export type FigmaTypographyDecoration = {
  "typography-decoration-underline"?: boolean
}

/**
 * @deprecated
 * @todo @cllpse: transition to wrapping in Frame and using Material Icons
 */
export type FigmaIconWidth = {
  "width-small"?: boolean
  "width-medium"?: boolean
  "width-large"?: boolean
  "width-huge"?: boolean
}

export type FigmaVectorWidth = Simplify<Omit<UnitsFlags<"width-">, "width-full">>

export type FigmaVectorHeight = Simplify<Omit<UnitsFlags<"height-">, "height-full">>

export type FigmaFill = Simplify<Color<"fill-">>

export type FigmaStroke = Simplify<Color<"stroke-">>

export type FigmaStrokeStyle = {
  "stroke-style-dashed"?: boolean
  "stroke-style-solid"?: boolean
}

export type FigmaFillHover = Simplify<Color<"fill-hover-">>

export type FigmaStrokeHover = Simplify<Color<"stroke-hover-">>
