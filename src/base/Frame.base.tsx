import type { ReactNode, RefObject } from "react"
import { Pressable, type PressableProps, type Role, View, type ViewInstance, type ViewProps } from "react-native"
import type { ClassName, PointerEventsWeb, StyleNative, StyleWeb } from "../types/elementProperties"
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
} from "../types/figmaProperties"
import { computeElementPointerEvents } from "../utilities/elementPropertyHelpers"

import {
  computeFrameAlignment,
  computeFrameCornerRadius,
  computeFrameEffectShadow,
  computeFrameFill,
  computeFrameFillHover,
  computeFrameFlow,
  computeFrameGap,
  computeFramePadding,
  computeFramePaddingBottom,
  computeFramePaddingHorizontal,
  computeFramePaddingLeft,
  computeFramePaddingRight,
  computeFramePaddingTop,
  computeFramePaddingVertical,
  computeFrameSizing,
  computeFrameStroke,
  computeFrameStrokeHover,
} from "../utilities/figmaPropertyHelpers"

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
  const gap = computeFrameGap(p).className
  const padding = computeFramePadding(p)
  const paddingVertical = computeFramePaddingVertical(p)
  const paddingHorizontal = computeFramePaddingHorizontal(p)
  const paddingLeft = computeFramePaddingLeft(p)
  const paddingRight = computeFramePaddingRight(p)
  const paddingTop = computeFramePaddingTop(p)
  const paddingBottom = computeFramePaddingBottom(p)
  const fill = computeFrameFill(p).className
  const stroke = computeFrameStroke(p).className
  const fillHover = computeFrameFillHover(p).className
  const cornerRadius = computeFrameCornerRadius(p)
  const effectShadow = computeFrameEffectShadow(p).className
  const strokeHover = computeFrameStrokeHover(p).className
  const pointerEvents = computeElementPointerEvents(p).className

  const flow = computeFrameFlow(p).className
  const alignment = computeFrameAlignment(p).className
  const sizing = computeFrameSizing(p)

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
