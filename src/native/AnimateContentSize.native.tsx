import { useEffect, useRef, useState } from "react"
import type { LayoutChangeEvent } from "react-native"
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated"
import DebugError from "../base/DebugError.base"
import type { AnimationDuration, AnimationEasing } from "../types/AnimationProperties"
import type {
  FigmaFill,
  FigmaFrameAlignment,
  FigmaFrameCornerRadius,
  FigmaFrameCornerRadiusBottomLeft,
  FigmaFrameCornerRadiusBottomRight,
  FigmaFrameCornerRadiusTopLeft,
  FigmaFrameCornerRadiusTopRight,
  FigmaFrameEffectShadow,
  FigmaFrameFlow,
  FigmaFrameGap,
  FigmaFrameWidth,
  FigmaPadding,
  FigmaPaddingHorizontal,
  FigmaPaddingRight,
  FigmaPaddingVertical,
  FigmaStroke,
} from "../types/FigmaProperties"
import { ComputeAnimationDuration, ComputeAnimationEasing } from "../utilities/AnimationPropertyHelpers"
import { FrameComputeAlignment, FrameComputeFlow, FrameComputeGap } from "../utilities/FigmaPropertyHelpers"
import Frame, { type Frame as FrameType } from "./Frame.native"

type AnimateContentSize = FigmaFrameFlow &
  FigmaFrameWidth &
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
  FigmaFrameEffectShadow &
  AnimationDuration &
  AnimationEasing & {
    children: FrameType["children"]
    onAnimationStart?: () => void
    onAnimationEnd?: () => void
  }

export default (p: AnimateContentSize) => {
  const [previousWidth, setPreviousWidth] = useState(0)
  const [previousHeight, setPreviousHeight] = useState(0)

  const width = useSharedValue(0)
  const height = useSharedValue(0)
  const opacity = useSharedValue(0)

  const duration = ComputeAnimationDuration(p)
  const easing = ComputeAnimationEasing(p)

  const durationFade = duration.value / 2
  const durationSize = duration.value
  const easingFade = easing.value
  const easingSize = easing.value

  const { children, onAnimationStart, onAnimationEnd, ...frameProperties } = p

  const [childrenClone, setChildrenClone] = useState(children)

  const childrenCloneTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animationEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    childrenCloneTimeoutRef.current = setTimeout(() => {
      setChildrenClone(children)
    }, durationSize)
  }, [children, durationSize])

  const contentClasses = [
    "w-full h-full overflow-hidden", // TODO: @cllpse: remove this
    FrameComputeFlow(frameProperties).styles,
    FrameComputeAlignment(frameProperties).styles,
    FrameComputeGap(frameProperties),
  ].join(" ")

  const onLayoutContainer = (event: LayoutChangeEvent) => {
    onAnimationStart?.()

    const containerWidth = event.nativeEvent.layout.width
    const containerHeight = event.nativeEvent.layout.height

    if (previousWidth > 0 || previousHeight > 0) {
      opacity.value = withSequence(
        withTiming(0, { duration: durationFade, easing: easingFade }),
        withDelay(durationSize, withTiming(1, { duration: durationFade, easing: easingFade })),
      )

      width.value = withDelay(
        durationFade,
        withTiming(containerWidth, {
          duration: durationSize,
          easing: easingSize,
        }),
      )

      height.value = withDelay(
        durationFade,
        withTiming(containerHeight, {
          duration: durationSize,
          easing: easingSize,
        }),
      )
    } else {
      opacity.value = 1
      width.value = containerWidth
      height.value = containerHeight
    }

    if (childrenCloneTimeoutRef.current) {
      clearTimeout(childrenCloneTimeoutRef.current)
    }

    if (animationEndTimeoutRef.current) {
      clearTimeout(animationEndTimeoutRef.current)
    }

    childrenCloneTimeoutRef.current = setTimeout(() => {
      setChildrenClone(children)
    }, durationSize)

    animationEndTimeoutRef.current = setTimeout(() => {
      setPreviousWidth(containerWidth)
      setPreviousHeight(containerHeight)

      onAnimationEnd?.()
    }, durationFade + durationSize)
  }

  useEffect(() => {
    return () => {
      if (childrenCloneTimeoutRef.current) {
        clearTimeout(childrenCloneTimeoutRef.current)
      }

      if (animationEndTimeoutRef.current) {
        clearTimeout(animationEndTimeoutRef.current)
      }
    }
  }, [])

  const widthHeightAnimatedStyle = useAnimatedStyle(() => ({
    width: width.value,
    height: height.value,
  }))

  const opacityAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return duration.error || easing.error ? (
    <DebugError message={duration.error || easing.error} />
  ) : (
    <Frame
      flow-vertical
      width-fill={frameProperties["width-fill"]}
      width-hug={frameProperties["width-hug"]}
      height-hug
      alignment-center
    >
      <Animated.View
        className="absolute"
        style={widthHeightAnimatedStyle}
        layout={LinearTransition.springify().duration(durationSize).easing(easingSize)}
      >
        <Frame {...frameProperties} width-fill height-fill>
          <Animated.View className={contentClasses} style={opacityAnimatedStyle}>
            {childrenClone}
          </Animated.View>
        </Frame>
      </Animated.View>

      <Frame {...frameProperties} height-hug onLayout={onLayoutContainer} _STYLE={{ opacity: 0 }}>
        {children}
      </Frame>
    </Frame>
  )
}
