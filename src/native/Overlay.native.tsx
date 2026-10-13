import { Platform, Pressable } from "react-native"
import Animated, { Easing, FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated"
import Frame, { type Frame as FrameType } from "./Frame.native"

const FadeIndSpring = FadeIn.springify().duration(400).easing(Easing.ease)
const FadeOutSpring = FadeOut.springify().duration(400).easing(Easing.ease)
const SlideInUpSpring = SlideInDown.springify().duration(400).easing(Easing.ease)
const SlideOutUpSpring = SlideOutDown.springify().duration(400).easing(Easing.ease)

export type Overlay = {
  position: "top" | "center" | "bottom"

  backdrop: "blur" | "transparent"
  pointerEvents?: "box-none" | "auto"
  blockDismiss?: boolean

  onDismiss?: () => void

  children: FrameType["children"]
}

export default (p: Overlay) => (
  <>
    {Platform.OS === "ios" && p.backdrop === "blur" && (
      <Animated.View
        entering={FadeIndSpring}
        exiting={FadeOutSpring}
        className="bg-solid absolute z-50 h-full w-full bg-white/80"
      />
    )}

    <Animated.View
      entering={p.position === "bottom" ? SlideInUpSpring : FadeIndSpring}
      exiting={p.position === "bottom" ? SlideOutUpSpring : FadeOutSpring}
      className="absolute bottom-0 left-0 right-0 top-0 z-50"
    >
      <Pressable
        className={`absolute bottom-0 left-0 right-0 top-0 z-50 ${Platform.OS === "android" ? "pb-16" : ""}`}
        onPress={p.onDismiss}
      >
        <Frame
          flow-vertical
          width-fill
          height-fill
          alignment-top-center={p.position === "top"}
          alignment-bottom-center={p.position === "bottom"}
          alignment-center={p.position === "center"}
          padding-horizontal-large
          padding-vertical-large
        >
          <Frame flow-vertical width-fill height-hug alignment-center>
            {p.children}
          </Frame>
        </Frame>
      </Pressable>
    </Animated.View>
  </>
)
