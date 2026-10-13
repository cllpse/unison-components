import type { COLORS } from "../constants/colors"

export const computeStrokeHover = (color: keyof typeof COLORS, shade: number) => ({
  [`stroke-hover-${color}-${shade}`]: true,
})
