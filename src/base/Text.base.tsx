import { type TextProps, Text as TextReactNative } from "react-native"
import type { ClassName, StyleNative, StyleWeb } from "../types/ElementProperties"
import type {
  FigmaFill,
  FigmaFillHover,
  FigmaFrameWidth,
  FigmaTypography,
  FigmaTypographyAlignment,
  FigmaTypographyDecoration,
} from "../types/FigmaProperties"
import {
  FontFeatureStyle,
  TextComputeFill,
  TextComputeFillHover,
  TextComputeTypography,
  TextComputeTypographyAlignment,
  TextComputeTypographyDecoration,
} from "../utilities/FigmaPropertyHelpers"

export type Text = FigmaFill &
  FigmaFillHover &
  FigmaFrameWidth &
  FigmaTypography &
  FigmaTypographyAlignment &
  FigmaTypographyDecoration & {
    children?: TextProps["children"]
    style?: StyleNative & StyleWeb
    className?: ClassName
    "tailwind-group-hover-fill"?: boolean
  }

export default (p: Text) => {
  const { className: typography } = TextComputeTypography(p)
  const { className: fill } = TextComputeFill(p)
  const { className: fillHover } = TextComputeFillHover(p)
  const { className: alignment } = TextComputeTypographyAlignment(p)
  const { className: decoration } = TextComputeTypographyDecoration(p)

  const styles = [p.style, FontFeatureStyle]

  const classes = [
    "[&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-current",
    "[&_a]:transition-[text-decoration-color] [&_a]:duration-[120ms] [&_a]:ease-out",
    "[&_a:hover]:decoration-[color-mix(in_oklab,currentColor_0%,transparent)]",
    typography,
    alignment,
    decoration,
    fill,
    fillHover,
    p["tailwind-group-hover-fill"] ? `group-hover:${fillHover?.replace("hover:", "") ?? ""}` : "",
    p.className ?? "",
  ].join(" ")

  return (
    <TextReactNative
      style={[
        styles,
        {
          // @ts-expect-error ...
          $$css: true,
          className: classes,
        },
      ]}
    >
      {p.children}
    </TextReactNative>
  )
}
