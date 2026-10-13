import { LinearGradient } from "expo-linear-gradient"
import { type ReactElement, useEffect, useState } from "react"
import ReanimatedAnimated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated"
import type { StyleNative } from "../types/ElementProperties"
import AnimateOpacity from "./AnimateOpacity.native"
import Frame, { type Frame as FrameType } from "./Frame.native"

const LoadingGradient = (p: { loading?: boolean }) => {
  const translateX = useSharedValue(-100)

  useEffect(() => {
    translateX.value = withRepeat(withTiming(400, { duration: 1200 }), -1, false)
  }, [translateX])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: `${translateX.value}%` }],
    opacity: p.loading ? 1 : 0,
  }))

  return (
    <ReanimatedAnimated.View
      style={[
        animatedStyle,
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "25%",
          zIndex: p.loading ? 1 : -40,
        },
      ]}
    >
      <LinearGradient
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: 0.8,
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 0)"]}
      />
    </ReanimatedAnimated.View>
  )
}

export type Button = {
  children?: ReactElement<FrameType>
  onPress?: () => void
  disabled?: boolean
  blockInteraction?: boolean
  loading?: boolean
  _CLASSNAME?: string
  _STYLE?: StyleNative
}

export default (p: Button) => {
  const [pressed, setPressed] = useState(false)

  const blockInteraction = p.blockInteraction || p.disabled || p.loading

  const pressIn = () => {
    if (!blockInteraction) {
      setPressed(true)
    }
  }

  const pressOut = () => {
    if (!blockInteraction) {
      setPressed(false)
    }
  }

  const press = () => {
    if (!blockInteraction) {
      p.onPress?.()
    }
  }

  return (
    <Frame
      flow-horizontal
      width-hug
      height-hug
      alignment-center
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={press}
      className={[blockInteraction ? "opacity-50" : "", p._CLASSNAME].join(" ")}
      _STYLE={p._STYLE}
    >
      <AnimateOpacity
        flow-horizontal
        width-hug
        height-hug
        alignment-center
        animation-duration-sprint
        animation-opacity-translucent
        animation-easing-linear
        active={pressed}
        className={p._CLASSNAME}
        style={p._STYLE}
      >
        {p.children}
      </AnimateOpacity>

      <LoadingGradient loading={p.loading} />
    </Frame>
  )
}
