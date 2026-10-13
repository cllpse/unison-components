import type { ComponentType } from "react"
import type { StyleProp, ViewStyle } from "react-native"
import Animated, { type AnimatedStyle } from "react-native-reanimated"
import FrameBase, { /* computeStyles, */ type Frame as FrameType } from "../base/Frame.base"
import type { StyleNative } from "../types/ElementProperties"

export type Frame = Omit<FrameType, "role" | "aria-label" | "aria-selected"> & {
  _STYLE?: StyleNative
}

type FrameAnimatedView = FrameType & {
  styleAnimated?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>
}

export type FrameAnimatedViewComponent = ComponentType<FrameAnimatedView>

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
      elementAnimatedView={
        styleAnimated ? (
          <Animated.View
            testID={p.testID}
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
