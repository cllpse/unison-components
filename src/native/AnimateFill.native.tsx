import { useEffect } from "react"
import { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { COLORS } from "../constants/colors"
import type {
  AnimationDuration,
  AnimationEasing,
  AnimationFill,
  AnimationFillActive,
} from "../types/AnimationProperties"
import {
  ComputeAnimationDuration,
  ComputeAnimationEasing,
  ComputeAnimationFill,
  ComputeAnimationFillActive,
} from "../utilities/AnimationPropertyHelpers"
import Frame, { type FrameAnimatedViewComponent, type Frame as FrameType } from "./Frame.native"

type AnimateFill = FrameType &
  AnimationFill &
  AnimationFillActive &
  AnimationDuration &
  AnimationEasing & {
    children: FrameType["children"]
    active: boolean
  }

const FrameAnimated = Frame as FrameAnimatedViewComponent

export default (p: AnimateFill) => {
  const sharedValue = useSharedValue(0)

  const { children, active, ...frameProperties } = p

  const duration = ComputeAnimationDuration(p)
  const easing = ComputeAnimationEasing(p)

  const segments = ComputeAnimationFill(p).value.split("-")
  const segmentsActive = ComputeAnimationFillActive(p).value.split("-")

  let color = "transparent"
  let colorActive = "transparent"

  if (segments.length > 1 && segmentsActive.length > 1) {
    const segmentColor = segments[1]
    const segmentLightness = segments[2]
    const segmentActiveColor = segmentsActive[1]
    const segmentActiveLightness = segmentsActive[2]

    // @ts-expect-error TODO: @cllpse: implement standard functionality for color manipulation.
    color = COLORS[segmentColor][segmentLightness] || COLORS[segmentColor]

    // @ts-expect-error TODO: @cllpse: implement standard functionality for color manipulation.
    colorActive = COLORS[segmentActiveColor][segmentActiveLightness] || COLORS[segmentActiveColor]
  }

  useEffect(() => {
    if (active) {
      sharedValue.value = 1
    } else {
      sharedValue.value = 0
    }
  }, [active, sharedValue])

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(interpolateColor(sharedValue.value, [0, 1], [color, colorActive], "LAB"), {
      easing: easing.value,
      duration: duration.value,
    }),
  }))

  return (
    <FrameAnimated {...frameProperties} styleAnimated={animatedStyle}>
      {children}
    </FrameAnimated>
  )
}
