import type { COLORS } from "../constants/colors"

export const computeFill = (color: keyof typeof COLORS, shade: number) => ({ [`fill-${color}-${shade}`]: true })
