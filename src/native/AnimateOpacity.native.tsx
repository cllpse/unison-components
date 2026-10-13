import { useEffect } from "react"
import type { ViewProps } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import DebugError from "../base/DebugError.base"
import type { AnimationDuration, AnimationEasing, AnimationOpacity } from "../types/AnimationProperties"
import type {
  FigmaFill,
  FigmaFrameAlignment,
  FigmaFrameCornerRadius,
  FigmaFrameCornerRadiusBottomLeft,
  FigmaFrameCornerRadiusBottomRight,
  FigmaFrameCornerRadiusTopLeft,
  FigmaFrameCornerRadiusTopRight,
  FigmaFrameFlow,
  FigmaFrameGap,
  FigmaFrameHeight,
  FigmaFrameWidth,
  FigmaPadding,
  FigmaPaddingHorizontal,
  FigmaPaddingRight,
  FigmaPaddingVertical,
  FigmaStroke,
} from "../types/FigmaProperties"
import {
  ComputeAnimationDuration,
  ComputeAnimationEasing,
  ComputeAnimationOpacity,
} from "../utilities/AnimationPropertyHelpers"
import {
  FrameComputeAlignment,
  FrameComputeFlow /* FrameComputeWidthHeight */,
} from "../utilities/FigmaPropertyHelpers"
import Frame, { type Frame as FrameType } from "./Frame.native"

type AnimateOpacity = FigmaFrameFlow &
  FigmaFrameWidth &
  FigmaFrameHeight &
  FigmaFrameAlignment &
  FigmaFrameGap &
  FigmaPadding &
  FigmaPaddingVertical &
  FigmaPaddingHorizontal &
  FigmaPaddingRight &
  FigmaFill &
  FigmaStroke &
  FigmaFrameCornerRadius &
  FigmaFrameCornerRadiusTopLeft &
  FigmaFrameCornerRadiusTopRight &
  FigmaFrameCornerRadiusBottomLeft &
  FigmaFrameCornerRadiusBottomRight &
  AnimationOpacity &
  AnimationDuration &
  AnimationEasing & {
    children: FrameType["children"]
    active: boolean
    className?: ViewProps["className"]
    style?: ViewProps["style"]
  }

export default (p: AnimateOpacity) => {
  const sharedValue = useSharedValue(1)

  const duration = ComputeAnimationDuration(p)
  const easing = ComputeAnimationEasing(p)
  const opacity = ComputeAnimationOpacity(p)

  const { children, active, className: _CLASSNAME, style: _STYLE, ...frameProperties } = p

  useEffect(() => {
    if (active) {
      sharedValue.value = withTiming(opacity.value, {
        duration: duration.value,
        easing: easing.value,
      })
    } else {
      sharedValue.value = withTiming(1, {
        duration: duration.value,
        easing: easing.value,
      })
    }
  }, [active, sharedValue, duration.value, easing.value, opacity.value])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: sharedValue.value,
  }))

  return opacity.error || duration.error || easing.error ? (
    <DebugError message={opacity.error || duration.error || easing.error} />
  ) : (
    <Animated.View
      className={[
        FrameComputeFlow(frameProperties).styles,
        // FrameComputeWidthHeight(frameProperties).styles,
        FrameComputeAlignment(frameProperties).styles,
        p.className ?? "",
      ].join(" ")}
      style={[animatedStyle, p.style]}
    >
      <Frame {...frameProperties} className={p.className}>
        {children}
      </Frame>
    </Animated.View>
  )
}
