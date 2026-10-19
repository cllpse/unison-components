import { type TextProps as TextProperties, Text as TextReactNative } from "react-native"
import type { ClassName, Style, TailwindGroupHoverFill } from "../../types/baseProperties"
import type {
  FigmaFill,
  FigmaFillHover,
  FigmaFrameWidth,
  FigmaTypography,
  FigmaTypographyAlignment,
  FigmaTypographyDecoration,
} from "../../types/figmaProperties"
import {
  computeTextFill,
  computeTextFillHover,
  computeTextTailwindGroupHoverFill,
  computeTextTypography,
  computeTextTypographyAlignment,
  computeTextTypographyDecoration,
  FONT_FEATURE_STYLE,
} from "../../utilities/computeProperties"

export type Text = FigmaFill &
  FigmaFillHover &
  FigmaFrameWidth &
  FigmaTypography &
  FigmaTypographyAlignment &
  FigmaTypographyDecoration &
  TailwindGroupHoverFill & {
    children?: TextProperties["children"]
    style?: Style
    className?: ClassName
  }

export default (p: Text) => {
  const className = [
    computeTextTypography(p).className,
    computeTextTypographyAlignment(p).className,
    computeTextTypographyDecoration(p).className,
    computeTextFill(p).className,
    computeTextFillHover(p).className,
    computeTextTailwindGroupHoverFill(p).className,
    p.className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <TextReactNative
      style={[
        p.style,
        FONT_FEATURE_STYLE,
        {
          // @ts-expect-error React Native Web's className passthrough
          $$css: true,
          className,
        },
      ]}
      className={className}
    >
      {p.children}
    </TextReactNative>
  )
}
