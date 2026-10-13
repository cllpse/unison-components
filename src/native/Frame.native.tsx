import { type ComponentType, useEffect } from "react"
import { Platform, type StyleProp, type ViewStyle } from "react-native"
import Animated, {
  type AnimatedStyle,
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated"
import FrameBase, { /* computeStyles, */ type Frame as FrameType, type LoadingOptions } from "../base/Frame.base"
import type { StyleNative } from "../types/ElementProperties"
import Icon from "./Icon.native"

export type Frame = Omit<FrameType, "role" | "aria-label" | "aria-selected"> & {
  _STYLE?: StyleNative
}

type FrameAnimatedView = FrameType & {
  styleAnimated?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>
}

export type FrameAnimatedViewComponent = ComponentType<FrameAnimatedView>

const AnimatedLoading = (p: LoadingOptions | undefined) => {
  const rotation = useSharedValue(0)

  useEffect(() => {
    rotation.value = 0

    rotation.value = withRepeat(
      withSequence(
        withTiming(360, { duration: 600, easing: Easing.elastic(1.1) }),
        withDelay(300, withTiming(630, { duration: 0 })),
      ),
      -1,
      false,
    )
  }, [rotation])

  const animatedTransform = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      className="bg-solid absolute z-40 h-full w-full grow flex-col items-center justify-center self-stretch bg-white/80"
      pointerEvents="box-none"
    >
      <Animated.View style={animatedTransform}>
        <Icon name="ring" width-large {...{ [p?.[1] || "fill-black"]: true }} />
      </Animated.View>
    </Animated.View>
  )
}

export default (p: Frame) => {
  const styleAnimated = (p as FrameAnimatedView).styleAnimated

  const styles = [
    p.style,
    // computeStyles(p)
  ]

  return (
    <FrameBase
      {...p}
      style={{ borderCurve: "continuous" }}
      elementLoader={Platform.OS === "ios" && p.loading?.[0] ? <AnimatedLoading {...p.loading} /> : null}
      elementAnimatedView={
        styleAnimated ? (
          <Animated.View
            ref={p.ref}
            style={[styles, p._STYLE, styleAnimated]}
            onTouchStart={p.onTouchStart}
            onTouchEnd={p.onTouchEnd}
            onLayout={p.onLayout}
            pointerEvents={p.pointerEvents}
          >
            {p.children}
          </Animated.View>
        ) : null
      }
    >
      {p.children}
    </FrameBase>
  )
}
