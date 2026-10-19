import type { Style, WebStyle } from "../../types/base"
import type { KnownOnly } from "../../types/utilities"
import FrameBase, { type Frame as FrameType } from "../base/Frame.base"

export type Frame = Omit<FrameType, "style"> & {
  style?: WebStyle
}

const FRAME_CLASSES =
  "unison-components__frame [corner-shape:round] transition-[outline-color,background-color] duration-[120ms] ease-out"

export default <Given,>(p: Given & KnownOnly<Frame, Given, "Frame">) => {
  const { style, className, ...rest } = p as Frame

  return (
    <FrameBase
      {...rest}
      className={className ? `${FRAME_CLASSES} ${className}` : FRAME_CLASSES}
      style={style as Style}
    />
  )
}
