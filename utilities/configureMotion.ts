import type { ComponentType } from "react"

/** An easing as React Native's CSS animations take it, built from cubic-bezier control points. */
type CubicBezier = (x1: number, y1: number, x2: number, y2: number) => unknown

export type Motion = Readonly<{
  /** An animated View that resolves `className` itself, so its class styles reach the animation. */
  View: ComponentType<object>
  /** The same for Pressable, used when a Frame takes presses. */
  Pressable: ComponentType<object>
  /** Reanimated's `cubicBezier`, which turns the tokens' control points into an easing. */
  cubicBezier: CubicBezier
}>

/**
 * The animated components the native shells swap in when a motion flag is set, or `undefined` until
 * `configureMotion` runs. Without them, motion flags only add their Tailwind classes, which NativeWind animates and
 * Uniwind (outside Pro) drops.
 */
export const MOTION: { current?: Motion } = {}

/**
 * Turn on motion for iOS and Android: Frames with a `transition-` or `tailwind-animate-` flag render through these
 * animated components, with the easings, durations and keyframes from dist/motion-tokens.css as React Native styles.
 * Call it once before the first render; `unison-components/uniwind-motion` does it for Uniwind apps.
 * @example configureMotion({ View: withUniwind(Animated.View), Pressable: withUniwind(AnimatedPressable), cubicBezier })
 */
export const configureMotion = (motion: Motion) => {
  MOTION.current = motion
}
