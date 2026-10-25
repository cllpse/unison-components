import { type TextProps as TextProperties, Text as TextReactNative } from "react-native"
import type { ClassName, Style } from "../../types/base"
import type {
  FigmaFill,
  FigmaFrameWidth,
  FigmaTextFillState,
  FigmaTextGroupFill,
  FigmaTypography,
  FigmaTypographyAlignment,
  FigmaTypographyDecoration,
  FigmaTypographySettings,
} from "../../types/figma"
import {
  computeTextColorStates,
  computeTextFill,
  computeTextTypography,
  computeTextTypographyAlignment,
  computeTextTypographyDecoration,
  computeTextTypographySettings,
  FONT_FEATURE_STYLE,
} from "../../utilities/computeProperties"

export type Text = FigmaFill &
  FigmaTextFillState &
  FigmaTextGroupFill &
  FigmaFrameWidth &
  FigmaTypography &
  FigmaTypographyAlignment &
  FigmaTypographyDecoration &
  FigmaTypographySettings & {
    children?: TextProperties["children"]
    style?: Style
    className?: ClassName
  }

export default (p: Text) => {
  const className = [
    computeTextTypography(p).className,
    computeTextTypographyAlignment(p).className,
    computeTextTypographyDecoration(p).className,
    computeTextTypographySettings(p).className,
    computeTextFill(p).className,
    computeTextColorStates(p).className,
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
