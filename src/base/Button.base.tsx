import type { ReactElement } from "react"
import type { ClassName, StyleNative, StyleWeb } from "../types/ElementProperties"
import Frame, { type Frame as FrameType } from "./Frame.base"

export type Button = {
  children?: ReactElement<FrameType>
  onPress?: () => void
  disabled?: boolean
  blockInteraction?: boolean
  loading?: boolean
  className?: ClassName
  style?: StyleNative & StyleWeb
}

export default (p: Button) => {
  const blockInteraction = p.blockInteraction || p.disabled || p.loading

  return (
    <Frame
      flow-horizontal
      width-hug
      height-hug
      alignment-center
      onPress={p.onPress}
      className={[blockInteraction ? "opacity-50" : "", p.className].join(" ")}
      style={p.style}
    >
      {p.children}
    </Frame>
  )
}
