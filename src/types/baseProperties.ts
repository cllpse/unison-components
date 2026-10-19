import type { CSSProperties, RefObject } from "react"
import type {
  ImageStyle,
  ViewProps as ReactNativeViewProperties,
  TextStyle,
  ViewInstance,
  ViewStyle,
} from "react-native"
import type { NamedFlagName } from "../maps"

/** Inline styles React Native takes on iOS and Android. */
export type NativeStyle = ImageStyle & TextStyle & ViewStyle

/** Inline styles on web, plus `corner-shape`, which React's CSS types don't know yet. */
export type WebStyle = CSSProperties & { cornerShape?: "squircle" | "round" }

/** An inline style for either platform. */
export type Style = NativeStyle & WebStyle

/** Tailwind classes: applied by React Native Web on web and by Uniwind on iOS and Android. */
export type ClassName = string

/** The underlying View's id, ref and how it takes touches. */
export type ViewElement = {
  id?: ReactNativeViewProperties["id"]
  ref?: RefObject<ViewInstance | null>
  pointerEvents?: ReactNativeViewProperties["pointerEvents"]
}

/** Accessibility props React Native Web renders as HTML attributes; the native shells omit them. */
export type ViewAttributes = {
  role?: ReactNativeViewProperties["role"]
  "aria-label"?: ReactNativeViewProperties["aria-label"]
  "aria-selected"?: ReactNativeViewProperties["aria-selected"]
}

/** The `pointer-events-none` and `pointer-events-auto` flags, as on web. */
export type PointerEvents = { [key in NamedFlagName<"pointer-events">]?: boolean }

/** Marks the element as a Tailwind `group`, so descendants can style off its hover (`group-hover:`). */
export type TailwindGroup = {
  "tailwind-group"?: boolean
}

/** Gives text its `fill-hover-` color when its Tailwind group is hovered, not only itself (`group-hover:`). */
export type TailwindGroupHoverFill = {
  "tailwind-group-hover-fill"?: boolean
}

/** What a `compute*` helper returns: Tailwind classes, with inline styles only for what a class can't express. */
export type PropertiesResult = {
  styles?: Style
  className?: ClassName
}
