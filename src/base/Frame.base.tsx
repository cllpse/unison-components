import type { ReactNode, RefObject } from "react"
import { Pressable, type PressableProps, type Role, View, type ViewInstance, type ViewProps } from "react-native"
import type { ClassName, PointerEventsWeb, StyleNative, StyleWeb } from "../types/ElementProperties"
// import DebugError from "./DebugError.base"
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
  FigmaFrameGap,
  FigmaFrameHeight,
  FigmaFrameWidth,
  FigmaFrameWrap,
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
  FrameComputeAlignment,
  FrameComputeCornerRadius,
  FrameComputeEffectShadow,
  FrameComputeFill,
  FrameComputeFillHover,
  FrameComputeFlow,
  FrameComputeGap,
  FrameComputePadding,
  FrameComputePaddingBottom,
  FrameComputePaddingHorizontal,
  FrameComputePaddingLeft,
  FrameComputePaddingRight,
  FrameComputePaddingTop,
  FrameComputePaddingVertical,
  FrameComputeSizing,
  FrameComputeStroke,
  FrameComputeStrokeHover,
} from "../utilities/FigmaPropertyHelpers"

export type Frame = FigmaFrameFlow &
  FigmaFrameWidth &
  FigmaFrameHeight &
  FigmaFrameAlignment &
  FigmaFrameWrap &
  FigmaFrameBorderRadius &
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

    style?: StyleNative & StyleWeb
    className?: ClassName

    role?: string
    "aria-label"?: string
    "aria-selected"?: boolean

    children?: ViewProps["children"]

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

  const flow = FrameComputeFlow(p).className
  const alignment = FrameComputeAlignment(p).className
  const sizing = FrameComputeSizing(p)

  const styles = [
    sizing.styles,
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
    flow,
    p.wrap ? "flex-wrap" : "",
    alignment,
    sizing.className,
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

  if (p.onPress || p.onPressIn || p.onPressOut) {
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
