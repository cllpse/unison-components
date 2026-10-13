import type { ReactNode, RefObject } from "react"
import { Pressable, type PressableProps, type Role, View, type ViewInstance, type ViewProps } from "react-native"
import { UNITS, UNITS_TAILWIND } from "../constants/units"
import type { ClassName, PointerEventsWeb, StyleNative, StyleWeb } from "../types/ElementProperties"
// import DebugError from "./DebugError.base"
import type {
  FigmaFill,
  FigmaFillHover,
  FigmaFrameAlignment,
  FigmaFrameCornerRadius,
  FigmaFrameCornerRadiusBottomLeft,
  FigmaFrameCornerRadiusBottomRight,
  FigmaFrameCornerRadiusTopLeft,
  FigmaFrameCornerRadiusTopRight,
  FigmaFrameEffectShadow,
  FigmaFrameFlow,
  FigmaFrameGap,
  FigmaFrameHeight,
  FigmaFrameWidth,
  FigmaPadding,
  FigmaPaddingBottom,
  FigmaPaddingHorizontal,
  FigmaPaddingLeft,
  FigmaPaddingRight,
  FigmaPaddingTop,
  FigmaPaddingVertical,
  FigmaStroke,
  FigmaStrokeHover,
  FigmaStrokeStyle,
} from "../types/FigmaProperties"
import { ElementComputePointerEvents } from "../utilities/ElementPropertyHelpers"

import {
  FrameComputeCornerRadius,
  FrameComputeEffectShadow,
  FrameComputeFill,
  FrameComputeFillHover,
  FrameComputeGap,
  FrameComputePadding,
  FrameComputePaddingBottom,
  FrameComputePaddingHorizontal,
  FrameComputePaddingLeft,
  FrameComputePaddingRight,
  FrameComputePaddingTop,
  FrameComputePaddingVertical,
  FrameComputeStroke,
  FrameComputeStrokeHover,
} from "../utilities/FigmaPropertyHelpers"

type GGFrameFlow = "horizontal" | "vertical"
type GGFrameVerticalPosition = "top" | "center" | "bottom"
type GGFrameHorizontalPosition = "left" | "center" | "right"
type GGFrameEdgePosition = "start" | "center" | "end"

const GG_HORIZONTAL_TO_EDGE: Record<GGFrameHorizontalPosition, GGFrameEdgePosition> = {
  left: "start",
  center: "center",
  right: "end",
}

const GG_VERTICAL_TO_EDGE: Record<GGFrameVerticalPosition, GGFrameEdgePosition> = {
  top: "start",
  center: "center",
  bottom: "end",
}

const GG_JUSTIFY: Record<GGFrameEdgePosition, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
}

const GG_ITEMS: Record<GGFrameEdgePosition, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
}

const GGresolveFlow = (p: Frame): GGFrameFlow => {
  if (p["flow-horizontal"]) return "horizontal"
  if (p["flow-vertical"]) return "vertical"

  return "vertical"
}

const GGresolveAlignment = (
  props: Frame,
): {
  vertical: GGFrameVerticalPosition
  horizontal: GGFrameHorizontalPosition
} => {
  if (props["alignment-top-left"]) return { vertical: "top", horizontal: "left" }
  if (props["alignment-top-center"]) return { vertical: "top", horizontal: "center" }
  if (props["alignment-top-right"]) return { vertical: "top", horizontal: "right" }
  if (props["alignment-left"]) return { vertical: "center", horizontal: "left" }
  if (props["alignment-center"]) return { vertical: "center", horizontal: "center" }
  if (props["alignment-right"]) return { vertical: "center", horizontal: "right" }
  if (props["alignment-bottom-left"]) return { vertical: "bottom", horizontal: "left" }
  if (props["alignment-bottom-center"]) return { vertical: "bottom", horizontal: "center" }
  if (props["alignment-bottom-right"]) return { vertical: "bottom", horizontal: "right" }

  return { vertical: "top", horizontal: "left" }
}

const GGcomputeAlignment = (
  flow: GGFrameFlow,
  vertical: GGFrameVerticalPosition,
  horizontal: GGFrameHorizontalPosition,
): string[] => {
  const horizontalEdge = GG_HORIZONTAL_TO_EDGE[horizontal]
  const verticalEdge = GG_VERTICAL_TO_EDGE[vertical]

  if (flow === "horizontal") {
    return [GG_JUSTIFY[horizontalEdge], GG_ITEMS[verticalEdge]]
  }

  return [GG_JUSTIFY[verticalEdge], GG_ITEMS[horizontalEdge]]
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
const GGcomputeSizing = (p: Frame): { className: string[]; style: StyleNative & StyleWeb } => {
  let exactWidth = ""
  let exactHeight = ""

  for (const key in UNITS) {
    if (p[`width-${key}` as keyof Frame]) {
      exactWidth = key
    }

    if (p[`height-${key}` as keyof Frame]) {
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
  const style: StyleNative & StyleWeb = {}

  if (exactWidth !== "" && exactWidth !== "full") {
    const value = UNITS[exactWidth as keyof typeof UNITS]
    style.minWidth = value
    style.maxWidth = value
  } else {
    style.minWidth = widthFill ? 0 : "auto"
  }

  if (exactHeight !== "" && exactHeight !== "full") {
    const value = UNITS[exactHeight as keyof typeof UNITS]
    style.minHeight = value
    style.maxHeight = value
  } else {
    style.minHeight = heightFill ? 0 : "auto"
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
      className: [widthClass, "self-stretch"],
      style: { ...style, flexGrow: 1, flexShrink: 1 },
    }
  }

  if (!widthFill && !heightFill) {
    // Hug/exact on both axes → rigid box (equivalent to `flex-none`).

    return {
      className: [widthClass, heightClass],
      style: { ...style, flexGrow: 0, flexShrink: 0 },
    }
  }

  // Exactly one axis fills: let the filling axis shrink so it yields space to fixed
  // siblings (instead of overflowing them). Any exact sibling axis is already pinned
  // above, so `flexShrink: 1` can't collapse it below its exact size.

  return {
    className: [widthClass, heightClass],
    style: { ...style, flexGrow: 0, flexShrink: 1 },
  }
}

export type Frame = FigmaFrameFlow &
  FigmaFrameWidth &
  FigmaFrameHeight &
  FigmaFrameAlignment &
  FigmaFrameGap &
  FigmaPadding &
  FigmaPaddingVertical &
  FigmaPaddingHorizontal &
  FigmaPaddingLeft &
  FigmaPaddingRight &
  FigmaPaddingTop &
  FigmaPaddingBottom &
  FigmaFill &
  FigmaStroke &
  FigmaStrokeStyle &
  FigmaFillHover &
  FigmaStrokeHover &
  FigmaFrameCornerRadius &
  FigmaFrameCornerRadiusTopLeft &
  FigmaFrameCornerRadiusTopRight &
  FigmaFrameCornerRadiusBottomLeft &
  FigmaFrameCornerRadiusBottomRight &
  FigmaFrameEffectShadow &
  PointerEventsWeb & {
    id?: ViewProps["id"]

    ref?: RefObject<ViewInstance | null>

    pointerEvents?: "box-none" | "auto"

    onTouchStart?: PressableProps["onTouchStart"]
    onTouchEnd?: PressableProps["onTouchEnd"]

    onPress?: PressableProps["onPress"]
    onPressIn?: PressableProps["onPressIn"]
    onPressOut?: PressableProps["onPressOut"]

    onLayout?: ViewProps["onLayout"]

    style?: StyleNative & StyleWeb
    className?: ClassName

    role?: string
    "aria-label"?: string
    "aria-selected"?: boolean

    children?: ViewProps["children"]

    elementAnimatedView?: ReactNode

    "tailwind-group"?: boolean
  }

export default (p: Frame) => {
  const gap = FrameComputeGap(p).className
  const padding = FrameComputePadding(p)
  const paddingVertical = FrameComputePaddingVertical(p)
  const paddingHorizontal = FrameComputePaddingHorizontal(p)
  const paddingLeft = FrameComputePaddingLeft(p)
  const paddingRight = FrameComputePaddingRight(p)
  const paddingTop = FrameComputePaddingTop(p)
  const paddingBottom = FrameComputePaddingBottom(p)
  const fill = FrameComputeFill(p).className
  const stroke = FrameComputeStroke(p).className
  const fillHover = FrameComputeFillHover(p).className
  const cornerRadius = FrameComputeCornerRadius(p)
  const effectShadow = FrameComputeEffectShadow(p).className
  const strokeHover = FrameComputeStrokeHover(p).className
  const pointerEvents = ElementComputePointerEvents(p).className

  const flow = GGresolveFlow(p)
  const { vertical, horizontal } = GGresolveAlignment(p)
  const sizing = GGcomputeSizing(p)

  const styles = [
    sizing.style,
    p.style,
    padding.styles,
    paddingVertical.styles,
    paddingHorizontal.styles,
    paddingLeft.styles,
    paddingRight.styles,
    paddingTop.styles,
    paddingBottom.styles,
    cornerRadius.styles,
  ]

  const classes = [
    "flex",
    flow === "horizontal" ? "flex-row" : "flex-col",
    ...GGcomputeAlignment(flow, vertical, horizontal),
    ...sizing.className,
    gap,
    padding.className,
    paddingVertical.className,
    paddingHorizontal.className,
    paddingLeft.className,
    paddingRight.className,
    paddingTop.className,
    paddingBottom.className,
    fill,
    stroke,
    fillHover,
    strokeHover,
    cornerRadius.className,
    effectShadow,
    pointerEvents,
    p["tailwind-group"] ? "group" : "",
    p.className ?? "",
  ]

  let r: ReactNode = null

  if (p.elementAnimatedView) {
    r = p.elementAnimatedView
  } else if (p.onPress || p.onPressIn || p.onPressOut) {
    r = (
      <Pressable
        id={p.id}
        ref={p.ref}
        role={p.role as Role}
        aria-label={p["aria-label"]}
        aria-selected={p["aria-selected"]}
        onTouchStart={p.onTouchStart}
        onTouchEnd={p.onTouchEnd}
        onPress={p.onPress}
        onPressIn={p.onPressIn}
        onPressOut={p.onPressOut}
        onLayout={p.onLayout}
        style={[
          styles,
          {
            // @ts-expect-error ...
            $$css: true,
            className: classes.join(" "),
          },
        ]}
        pointerEvents={p.pointerEvents}
      >
        {p.children}
      </Pressable>
    )
  } else {
    r = (
      <View
        id={p.id}
        ref={p.ref}
        role={p.role as Role}
        aria-label={p["aria-label"]}
        aria-selected={p["aria-selected"]}
        onTouchStart={p.onTouchStart}
        onTouchEnd={p.onTouchEnd}
        onLayout={p.onLayout}
        style={[
          styles,
          {
            // @ts-expect-error ...
            $$css: true,
            className: classes.join(" "),
          },
        ]}
        pointerEvents={p.pointerEvents}
      >
        {p.children}
      </View>
    )
  }

  return r
}
