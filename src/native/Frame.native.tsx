import FrameBase, { type Frame as FrameType } from "../base/Frame.base"
import type { StyleNative } from "../types/elementProperties"

export type Frame = Omit<FrameType, "role" | "aria-label" | "aria-selected"> & {
  _STYLE?: StyleNative
}

export default (p: Frame) => {
  return (
    <FrameBase {...p} style={{ borderCurve: "continuous" }}>
      {p.children}
    </FrameBase>
  )
}
