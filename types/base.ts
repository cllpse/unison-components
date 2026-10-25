import type { CSSProperties, RefObject } from "react"
import type {
  ImageStyle,
  ViewProps as ReactNativeViewProperties,
  TextStyle,
  ViewInstance,
  ViewStyle,
} from "react-native"
import type { ANIMATIONS } from "../dist/design-tokens"
import type { NamedFlagName } from "../maps"

/** Inline styles React Native takes on iOS and Android. */
export type NativeStyle = ImageStyle & TextStyle & ViewStyle

/** Inline styles on web, plus `corner-shape`, which React's CSS types don't know yet. */
export type WebStyle = CSSProperties & { cornerShape?: "squircle" | "round" }

/** An inline style for either platform. */
export type Style = NativeStyle & WebStyle

/** Tailwind classes: applied by React Native Web on web and by Uniwind on iOS and Android. */
export type ClassName = string

/** A ref to the underlying View. */
export type ViewReference = {
  ref?: RefObject<ViewInstance | null>
}

/** The underlying View's id, how it takes touches, and the accessibility attributes React Native Web renders. */
export type ViewAttributes = {
  id?: ReactNativeViewProperties["id"]
  pointerEvents?: ReactNativeViewProperties["pointerEvents"]
  role?: ReactNativeViewProperties["role"]
  "aria-label"?: ReactNativeViewProperties["aria-label"]
}

/**
 * A Frame's disabled and selected states, which its `fill-disabled-` and `fill-selected-` flags follow on every
 * platform. A disabled Frame also takes no presses.
 */
export type FrameState = {
  disabled?: boolean
  "aria-selected"?: ReactNativeViewProperties["aria-selected"]
}

/** The `pointer-events-none` and `pointer-events-auto` flags, as on web. */
export type PointerEvents = { [key in NamedFlagName<"pointer-events">]?: boolean }

/** Makes the Frame the `group` whose state its descendants' `group-<state>-` flags follow, as Tailwind's `group` does. */
export type Group = { [key in NamedFlagName<"group">]?: boolean }

/** Runs an animation from motion-tokens.css in a loop (`animate-spin`), unless the viewer asks for reduced motion. */
export type Animate = { [key in keyof typeof ANIMATIONS as `animate-${key}`]?: boolean }

/** What a `compute*` helper returns: Tailwind classes, with inline styles only for what a class can't express. */
export type PropertiesResult = {
  styles?: Style
  className?: ClassName
}

// Lets `className` through to React Native's own props and to JSX, as React Native Web and Uniwind read it. Declared
// here rather than in a global .d.ts so it reaches consumers through the emitted declarations of every component.
declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      className?: string
    }
    interface IntrinsicClassAttributes<T> {
      className?: string
    }
  }
}

declare module "react-native" {
  interface ViewProps {
    className?: string
  }
  interface TextProps {
    className?: string
  }
}
