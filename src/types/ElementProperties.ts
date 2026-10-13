import type { CSSProperties } from "react"
import type { ImageStyle, TextStyle, ViewProps, ViewStyle } from "react-native"

export type ElementPropertiesReturn = {
  styles?: StyleNative & StyleWeb
  className?: ClassName
}

export type StyleNative = ImageStyle & TextStyle & ViewStyle
export type StyleWeb = CSSProperties & { cornerShape?: "squircle" | "round" }
export type ClassName = ViewProps["className"]

export type PointerEventsWeb = {
  "pointer-events-none"?: boolean
  "pointer-events-auto"?: boolean
}
