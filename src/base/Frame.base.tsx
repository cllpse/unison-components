import {
  Pressable,
  type PressableProps as PressableProperties,
  type ViewProps as ReactNativeViewProperties,
  type Role,
  View,
} from "react-native"
import type {
  ClassName,
  PointerEvents,
  Style,
  TailwindGroup,
  ViewAttributes,
  ViewElement,
} from "../types/baseProperties"
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
} from "../types/figmaProperties"
import {
  computeElementPointerEvents,
  computeElementTailwindGroup,
  computeFrameAlignment,
  computeFrameAutolayout,
  computeFrameCornerRadius,
  computeFrameEffectShadow,
  computeFrameFill,
  computeFrameFillHover,
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
  computeFrameWrap,
} from "../utilities/computeProperties"

export type Frame = FigmaFrameAutolayout &
  FigmaFrameWidth &
  FigmaFrameHeight &
  FigmaFrameAlignment &
  FigmaFrameWrap &
  FigmaFrameGap &
  FigmaFramePadding &
  FigmaFramePaddingVertical &
  FigmaFramePaddingHorizontal &
  FigmaFramePaddingLeft &
  FigmaFramePaddingRight &
  FigmaFramePaddingTop &
  FigmaFramePaddingBottom &
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
  PointerEvents &
  TailwindGroup &
  ViewAttributes &
  ViewElement & {
    onTouchStart?: PressableProperties["onTouchStart"]
    onTouchEnd?: PressableProperties["onTouchEnd"]

    onPress?: PressableProperties["onPress"]
    onPressIn?: PressableProperties["onPressIn"]
    onPressOut?: PressableProperties["onPressOut"]

    style?: Style
    className?: ClassName

    children?: ReactNativeViewProperties["children"]
  }

export default (p: Frame) => {
  const className = [
    "flex",
    computeFrameAutolayout(p).className,
    computeFrameWrap(p).className,
    computeFrameAlignment(p).className,
    computeFrameSizing(p).className,
    computeFrameGap(p).className,
    computeFramePadding(p).className,
    computeFramePaddingVertical(p).className,
    computeFramePaddingHorizontal(p).className,
    computeFramePaddingLeft(p).className,
    computeFramePaddingRight(p).className,
    computeFramePaddingTop(p).className,
    computeFramePaddingBottom(p).className,
    computeFrameFill(p).className,
    computeFrameStroke(p).className,
    computeFrameFillHover(p).className,
    computeFrameStrokeHover(p).className,
    computeFrameCornerRadius(p).className,
    computeFrameEffectShadow(p).className,
    computeElementPointerEvents(p).className,
    computeElementTailwindGroup(p).className,
    p.className,
  ]
    .filter(Boolean)
    .join(" ")

  const props = {
    id: p.id,
    ref: p.ref,
    role: p.role as Role,
    "aria-label": p["aria-label"],
    "aria-selected": p["aria-selected"],
    onTouchStart: p.onTouchStart,
    onTouchEnd: p.onTouchEnd,
    // React Native Web's className passthrough; React Native's style types don't know `$$css`.
    style: [p.style, { $$css: true, className }] as ReactNativeViewProperties["style"],
    className,
    pointerEvents: p.pointerEvents,
    children: p.children,
  }

  if (p.onPress || p.onPressIn || p.onPressOut) {
    return <Pressable {...props} onPress={p.onPress} onPressIn={p.onPressIn} onPressOut={p.onPressOut} />
  }

  return <View {...props} />
}
