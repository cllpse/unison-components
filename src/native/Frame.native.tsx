import type { ViewAttributes } from "../../types/base"
import type { KnownAttributes, KnownOnly } from "../../types/utilities"
import { computeElementMotion } from "../../utilities/computeProperties"
import { MOTION } from "../../utilities/configureMotion"
import FrameBase, { type Frame as FrameType } from "../base/Frame.base"

export type Frame = Omit<FrameType, keyof ViewAttributes | "_animated">

// `borderCurve: "continuous"` is iOS's squircle corner, the native counterpart of web's `corner-shape: round`. A Frame
// with a motion flag renders through the animated components once `configureMotion` has run, with its motion as
// styles; every other Frame stays a plain View.
export default <Given extends KnownAttributes<Frame>>(p: Given & KnownOnly<Frame, Given, "Frame">) => {
  const { style, ...rest } = p as Frame
  const motion = computeElementMotion(p as Frame)

  if (motion.styles === undefined) return <FrameBase {...rest} style={{ borderCurve: "continuous", ...style }} />

  return (
    <FrameBase {...rest} _animated={MOTION.current} style={{ borderCurve: "continuous", ...style, ...motion.styles }} />
  )
}
