import type { Style, WebStyle } from "../../types/base"
import type { KnownAttributes, KnownOnly } from "../../types/utilities"
import FrameBase, { type Frame as FrameType } from "../base/Frame.base"

export type Frame = Omit<FrameType, "style"> & {
  style?: WebStyle
}

const FRAME_CLASSES = "unison-components__frame [corner-shape:round]"

export default <Given extends KnownAttributes<Frame>>(p: Given & KnownOnly<Frame, Given, "Frame">) => {
  const { style, className, ...rest } = p as Frame

  return (
    <FrameBase
      {...rest}
      className={className ? `${FRAME_CLASSES} ${className}` : FRAME_CLASSES}
      style={style as Style}
    />
  )
}
