import { View } from "react-native"
import Svg, { Path } from "react-native-svg"
import type { ClassName, Style } from "../../types/base"
import type { FigmaFill, FigmaVectorGroupFill, FigmaVectorHeight, FigmaVectorWidth } from "../../types/figma"
import {
  computeVectorColor,
  computeVectorColorStates,
  computeVectorFill,
  computeVectorSize,
} from "../../utilities/computeProperties"

export type Vector = FigmaFill &
  FigmaVectorGroupFill &
  FigmaVectorWidth &
  FigmaVectorHeight & {
    /** SVG path data, as Figma exports it from the vector's fill geometry. */
    path: string
    /**
     * The vector's bounds in path coordinates (`"minX minY width height"`). With both a `width-` and a `height-` flag
     * it is scaled to fit that box; with one, the other side follows its aspect ratio; with neither, the vector
     * stretches to its container and keeps the aspect ratio.
     */
    viewBox: string
    /** Figma's winding rule for the path. Defaults to `"nonzero"`. */
    fillRule?: "nonzero" | "evenodd"

    style?: Style
    className?: ClassName
  }

export default (p: Vector) => {
  const size = computeVectorSize(p)

  const className = [size.className, computeVectorFill(p).className, computeVectorColorStates(p).className, p.className]
    .filter(Boolean)
    .join(" ")

  // The Svg fills a View that carries the size and the className, because react-native-svg's web renderer does not
  // take React Native Web's `$$css` className passthrough. The `className` prop is for Uniwind on iOS and Android;
  // React Native Web drops it.
  return (
    <View
      style={[
        size.styles,
        p.style,
        {
          // @ts-expect-error React Native Web's className passthrough
          $$css: true,
          className,
        },
      ]}
      className={className}
    >
      <Svg width="100%" height="100%" viewBox={p.viewBox} color={computeVectorColor(p)}>
        <Path d={p.path} fill="currentColor" fillRule={p.fillRule ?? "nonzero"} />
      </Svg>
    </View>
  )
}
