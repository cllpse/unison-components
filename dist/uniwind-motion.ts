// Turns on motion for iOS and Android in apps styled with Uniwind: import it once, before the first render
// (`import "unison-components/uniwind-motion"`). Uniwind outside Pro drops easings and keyframes, so Frames with a
// `transition-` or `animate-` flag render through Reanimated's animated components instead, wrapped with
// `withUniwind` so their classes resolve to styles Reanimated sees. NativeWind animates the classes itself, so apps
// using it leave this out.
import { Pressable } from "react-native"
import Animated, { cubicBezier } from "react-native-reanimated"
import { withUniwind } from "uniwind"
import { configureMotion } from "../utilities/configureMotion"

configureMotion({
  View: withUniwind(Animated.View) as never,
  Pressable: withUniwind(Animated.createAnimatedComponent(Pressable)) as never,
  cubicBezier,
})
