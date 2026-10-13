import type { COLORS } from "../constants/colors"

export const computeFillHover = (color: keyof typeof COLORS, shade: number) => ({
  [`fill-hover-${color}-${shade}`]: true,
})
