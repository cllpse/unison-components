import type { Text as TextType } from "../base/Text.base"
import type { ClassName, StyleWeb } from "../types/ElementProperties"
import type { FigmaFill, FigmaFillHover, FigmaFrameHeight } from "../types/FigmaProperties"
import { TextComputeFill, TextComputeFillHover } from "../utilities/FigmaPropertyHelpers"

type Icon = Omit<FigmaFrameHeight, "height-hug" | "height-fill"> &
  FigmaFill &
  FigmaFillHover & {
    className?: ClassName
    style?: StyleWeb
    children: TextType["children"]
    filled?: boolean
    "tailwind-group-hover-fill"?: boolean
  }

export default (p: Icon) => {
  const { className: fill } = TextComputeFill(p)
  const { className: fillHover } = TextComputeFillHover(p)

  return (
    <div
      className={[
        "frame__icon",
        "material-symbols-rounded",
        "flex grow-0 shrink-0 aspect-square items-center justify-center",
        fill,
        fillHover,
        p["tailwind-group-hover-fill"] ? `group-hover:${fillHover?.replace("hover:", "") ?? ""}` : "",
        p.className ?? "",
      ].join(" ")}
      style={p.filled ? { fontVariationSettings: "'FILL' 1", ...p.style } : p.style}
    >
      {p.children}
    </div>
  )
}
