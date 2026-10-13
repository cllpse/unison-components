import type { FigmaFill } from "./FigmaProperties"

export type AnimationPropertiesReturnError = {
  error?: string
}

export type AnimationDuration = {
  "animation-duration-walk"?: boolean
  "animation-duration-jog"?: boolean
  "animation-duration-run"?: boolean
  "animation-duration-sprint"?: boolean // TODO: @cllpse: consider renaming to "Ymir"
}

export type AnimationEasing = {
  "animation-easing-linear"?: boolean
  "animation-easing-ease"?: boolean
  "animation-easing-elastic"?: boolean
}

export type AnimationOpacity = {
  "animation-opacity-opaque"?: boolean
  "animation-opacity-translucent"?: boolean
  "animation-opacity-transparent"?: boolean
}

export type AnimationFill = {
  [K in keyof FigmaFill as `animation-${string & K}`]?: FigmaFill[K]
}

export type AnimationFillActive = {
  [K in keyof FigmaFill as `animation-${string & K}-active`]?: FigmaFill[K]
}
