import FrameBase, { type Frame as FrameType } from "../base/Frame.base"
import type { StyleNative, StyleWeb } from "../types/ElementProperties"

export type Frame = Omit<FrameType, "style"> & {
  style?: StyleWeb
}

export default (p: Frame) => {
  const { children, style, className, ...rest } = p
  // const cornerShape = p["corner-radius-full"] || p["corner-radius-huge"] ? "round" : "squircle"
  const cornerShape = "round"

  return (
    <FrameBase
      className={`frame__frame transition-[outline-color,background-color] duration-[120ms] ease-out ${className ?? ""}`}
      style={
        {
          ...style,
          cornerShape,
        } as StyleWeb & StyleNative
      }
      {...rest}
    >
      {children}
    </FrameBase>
  )
}
