import { View } from "react-native"
import Svg, { Path } from "react-native-svg"
import type { ClassName, StyleNative, StyleWeb } from "../types/elementProperties"
import type { FigmaFill, FigmaVectorHeight, FigmaVectorWidth } from "../types/figmaProperties"
import { computeVectorFill, computeVectorSize } from "../utilities/figmaPropertyHelpers"

export type Vector = FigmaFill &
  FigmaVectorWidth &
  FigmaVectorHeight & {
    /** SVG path data, as Figma exports it from the vector's fill geometry. */
    path: string
    /** The vector's bounds in path coordinates (`"minX minY width height"`); scaled to fit the `width-` / `height-` box. */
    viewBox: string
    /** Figma's winding rule for the path. Defaults to `"nonzero"`. */
    fillRule?: "nonzero" | "evenodd"

    style?: StyleNative & StyleWeb
    className?: ClassName
  }

export default (p: Vector) => {
  const fill = computeVectorFill(p)
  const size = computeVectorSize(p)

  if (size.error) throw new Error(size.error)

  const styles = [size.styles, p.style]

  const classes = [size.className, p.className ?? ""]

  // The Svg fills a View that carries the size and the className, because react-native-svg's web renderer does not
  // take React Native Web's `$$css` className passthrough.
  return (
    <View
      style={[
        styles,
        {
          // @ts-expect-error ...
          $$css: true,
          className: classes.join(" "),
        },
      ]}
    >
      <Svg width="100%" height="100%" viewBox={p.viewBox} color={fill.styles?.color as string}>
        <Path d={p.path} fill="currentColor" fillRule={p.fillRule ?? "nonzero"} />
      </Svg>
    </View>
  )
}
