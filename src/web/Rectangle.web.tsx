import type {
  FigmaFill,
  FigmaFrameBorderRadius,
  FigmaFrameCornerRadius,
  FigmaFrameCornerRadiusBottomLeft,
  FigmaFrameCornerRadiusBottomRight,
  FigmaFrameCornerRadiusTopLeft,
  FigmaFrameCornerRadiusTopRight,
  FigmaFrameHeight,
  FigmaStroke,
} from "../types/FigmaProperties"
import { FrameComputeCornerRadius, FrameComputeStroke, IconComputeFill } from "../utilities/FigmaPropertyHelpers"

type Rectangle = Omit<FigmaFrameHeight, "height-hug" | "height-fill"> &
  FigmaFill &
  FigmaFrameBorderRadius &
  FigmaFrameCornerRadius &
  FigmaFrameCornerRadiusTopLeft &
  FigmaFrameCornerRadiusTopRight &
  FigmaFrameCornerRadiusBottomLeft &
  FigmaFrameCornerRadiusBottomRight &
  FigmaStroke

export default (p: Rectangle) => {
  const fill = IconComputeFill(p).styles
  const cornerRadius = FrameComputeCornerRadius(p).styles
  const stroke = FrameComputeStroke(p).styles

  return (
    <div
      className="frame__rectangle"
      style={{
        display: "flex",
        flexGrow: 0,
        flexShrink: 0,
        aspectRatio: 1,
        ...fill,
        ...cornerRadius,
        ...stroke,
      }}
    />
  )
}
