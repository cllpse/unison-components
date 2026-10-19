import FrameBase, { type Frame as FrameType } from "../base/Frame.base"
import type { ViewAttributes } from "../types/baseProperties"

export type Frame = Omit<FrameType, keyof ViewAttributes>

// `borderCurve: "continuous"` is iOS's squircle corner, the native counterpart of web's `corner-shape: round`.
export default (p: Frame) => <FrameBase {...p} style={{ borderCurve: "continuous", ...p.style }} />
