import type { COLORS } from "../constants/colors"

export const computeStroke = (color: keyof typeof COLORS, shade: number) => ({ [`stroke-${color}-${shade}`]: true })
