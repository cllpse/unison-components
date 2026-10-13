import { type StyleProp, View, type ViewProps, type ViewStyle } from "react-native"
import DebugError from "../base/DebugError.base"
import type { FigmaFill } from "../types/FigmaProperties"
import { FrameComputeFill } from "../utilities/FigmaPropertyHelpers"

type Line = FigmaFill & {
  vertical?: boolean
  horizontal?: boolean
}

export default (p: Line) => {
  const fill = FrameComputeFill(p)

  if (!fill) {
    return <DebugError message='<Line /> – missing "fill-" property' />
  }

  if (!p.vertical && !p.horizontal) {
    return <DebugError message='<Line /> – missing "vertical" or "horizontal" prop' />
  }

  let style: ViewProps["style"] = { width: "100%", height: 1 }

  if (p.vertical) {
    style = { width: 1, height: "100%" }
  }

  return <View style={[{ display: "flex" }, fill.styles, style] as StyleProp<ViewStyle>[]} />
}
