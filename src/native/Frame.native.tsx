import type { ViewAttributes } from "../../types/base"
import type { KnownOnly } from "../../types/utilities"
import FrameBase, { type Frame as FrameType } from "../base/Frame.base"

export type Frame = Omit<FrameType, keyof ViewAttributes>

// `borderCurve: "continuous"` is iOS's squircle corner, the native counterpart of web's `corner-shape: round`.
export default <Given,>(p: Given & KnownOnly<Frame, Given, "Frame">) => {
  const { style, ...rest } = p as Frame

  return <FrameBase {...rest} style={{ borderCurve: "continuous", ...style }} />
}
