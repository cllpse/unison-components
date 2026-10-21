// The flag types are built from the same group lists as the flag table in maps and the scales in dist/design-tokens.ts,
// so a group or token added there gets its props here; no flag name is written out by hand.
import type {
  CONTAINERS,
  ColorNameAndShade,
  EASINGS,
  RADIUS,
  SHADOWS,
  SPACING,
  SpacingPixelKey,
  TEXT_SIZES,
  TRANSITION_DELAYS,
  TRANSITION_DURATIONS,
  TRANSITION_PROPERTIES,
} from "../dist/design-tokens"
import type { ColorGroup, NamedFlagGroup, NamedFlagName, RadiusGroup, SizeMode, SpacingGroup } from "../maps"
import type { Simplify } from "./utilities"

/** `<group>-<key>` boolean flags for every key. */
type GroupFlags<Group extends string, Key extends string> = { [key in Key as `${Group}-${key}`]?: boolean }

type SpacingFlags<Group extends SpacingGroup> = GroupFlags<Group, keyof typeof SPACING>

type RadiusFlags<Group extends RadiusGroup> = GroupFlags<Group, keyof typeof RADIUS>

type ColorFlags<Group extends ColorGroup> = GroupFlags<Group, ColorNameAndShade>

type NamedFlags<Group extends NamedFlagGroup> = { [key in NamedFlagName<Group>]?: boolean }

/** Width also takes Tailwind's container scale (`width-md`, 448px). */
export type FigmaFrameWidth = Simplify<GroupFlags<"width", keyof typeof SPACING | SizeMode | keyof typeof CONTAINERS>>

export type FigmaFrameHeight = Simplify<GroupFlags<"height", keyof typeof SPACING | SizeMode>>

/** `gap-` spaces items and wrapped rows alike; `gap-horizontal-` and `gap-vertical-` set one direction each. */
export type FigmaFrameGap = Simplify<SpacingFlags<"gap" | "gap-horizontal" | "gap-vertical">>

export type FigmaFramePadding = Simplify<SpacingFlags<"padding">>

export type FigmaFramePaddingVertical = Simplify<SpacingFlags<"padding-vertical">>

export type FigmaFramePaddingHorizontal = Simplify<SpacingFlags<"padding-horizontal">>

export type FigmaFramePaddingLeft = Simplify<SpacingFlags<"padding-left">>

export type FigmaFramePaddingRight = Simplify<SpacingFlags<"padding-right">>

export type FigmaFramePaddingTop = Simplify<SpacingFlags<"padding-top">>

export type FigmaFramePaddingBottom = Simplify<SpacingFlags<"padding-bottom">>

export type FigmaFrameCornerRadius = RadiusFlags<"corner-radius">

export type FigmaFrameCornerRadiusTopLeft = RadiusFlags<"corner-radius-top-left">

export type FigmaFrameCornerRadiusTopRight = RadiusFlags<"corner-radius-top-right">

export type FigmaFrameCornerRadiusBottomLeft = RadiusFlags<"corner-radius-bottom-left">

export type FigmaFrameCornerRadiusBottomRight = RadiusFlags<"corner-radius-bottom-right">

export type FigmaFrameAutolayout = NamedFlags<"autolayout">

export type FigmaFrameAlignment = NamedFlags<"alignment">

export type FigmaFrameWrap = {
  wrap?: boolean
}

export type FigmaFrameEffectShadow = Simplify<
  NamedFlags<"effect-shadow"> & GroupFlags<"effect-shadow", (typeof SHADOWS)[number]>
>

export type FigmaTypography = GroupFlags<"typography", (typeof TEXT_SIZES)[number]>

export type FigmaTypographyAlignment = NamedFlags<"typography-align">

export type FigmaTypographyDecoration = NamedFlags<"typography-decoration">

export type FigmaVectorWidth = Simplify<GroupFlags<"width", SpacingPixelKey>>

export type FigmaVectorHeight = Simplify<GroupFlags<"height", SpacingPixelKey>>

export type FigmaFill = Simplify<ColorFlags<"fill">>

export type FigmaStroke = Simplify<ColorFlags<"stroke">>

export type FigmaStrokeStyle = NamedFlags<"stroke-style">

export type FigmaFillHover = Simplify<ColorFlags<"fill-hover">>

export type FigmaStrokeHover = Simplify<ColorFlags<"stroke-hover">>

/** What changes animate between two states, as a Figma prototype's Smart animate between variants does. */
export type FigmaTransition = Simplify<GroupFlags<"transition", keyof typeof TRANSITION_PROPERTIES>>

export type FigmaTransitionDuration = Simplify<GroupFlags<"transition-duration", keyof typeof TRANSITION_DURATIONS>>

export type FigmaTransitionDelay = Simplify<GroupFlags<"transition-delay", keyof typeof TRANSITION_DELAYS>>

export type FigmaTransitionEasing = Simplify<GroupFlags<"transition-easing", keyof typeof EASINGS>>
