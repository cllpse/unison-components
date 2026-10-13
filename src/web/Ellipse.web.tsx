import type {
  FigmaFill,
  FigmaFrameCornerRadius,
  FigmaFrameCornerRadiusBottomLeft,
  FigmaFrameCornerRadiusBottomRight,
  FigmaFrameCornerRadiusTopLeft,
  FigmaFrameCornerRadiusTopRight,
  FigmaFrameHeight,
  FigmaStroke,
} from "../types/FigmaProperties"
import { FrameComputeCornerRadius, FrameComputeFill, FrameComputeStroke } from "../utilities/FigmaPropertyHelpers"

type Ellipse = Omit<FigmaFrameHeight, "height-hug" | "height-fill"> &
  FigmaFill &
  FigmaFrameCornerRadius &
  FigmaFrameCornerRadiusTopLeft &
  FigmaFrameCornerRadiusTopRight &
  FigmaFrameCornerRadiusBottomLeft &
  FigmaFrameCornerRadiusBottomRight &
  FigmaStroke

export default (p: Ellipse) => {
  const fill = FrameComputeFill(p).styles
  const cornerRadius = FrameComputeCornerRadius(p).styles
  const stroke = FrameComputeStroke(p).styles

  return (
    <div
      className="frame__ellipse"
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
