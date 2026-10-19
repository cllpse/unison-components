import { View } from "react-native"
import Svg, { Path } from "react-native-svg"
import type { ClassName, Style } from "../../types/baseProperties"
import type { FigmaFill, FigmaVectorHeight, FigmaVectorWidth } from "../../types/figmaProperties"
import { computeVectorFill, computeVectorSize } from "../../utilities/computeProperties"

export type Vector = FigmaFill &
  FigmaVectorWidth &
  FigmaVectorHeight & {
    /** SVG path data, as Figma exports it from the vector's fill geometry. */
    path: string
    /** The vector's bounds in path coordinates (`"minX minY width height"`); scaled to fit the `width-` / `height-` box. */
    viewBox: string
    /** Figma's winding rule for the path. Defaults to `"nonzero"`. */
    fillRule?: "nonzero" | "evenodd"

    style?: Style
    className?: ClassName
  }

export default (p: Vector) => {
  const className = [computeVectorSize(p).className, p.className].filter(Boolean).join(" ")

  // The Svg fills a View that carries the size and the className, because react-native-svg's web renderer does not
  // take React Native Web's `$$css` className passthrough. The `className` prop is for Uniwind on iOS and Android;
  // React Native Web drops it.
  return (
    <View
      style={[
        p.style,
        {
          // @ts-expect-error React Native Web's className passthrough
          $$css: true,
          className,
        },
      ]}
      className={className}
    >
      <Svg width="100%" height="100%" viewBox={p.viewBox} color={computeVectorFill(p)}>
        <Path d={p.path} fill="currentColor" fillRule={p.fillRule ?? "nonzero"} />
      </Svg>
    </View>
  )
}
