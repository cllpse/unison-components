import { Easing, type EasingFunction, type EasingFunctionFactory } from "react-native-reanimated"
import type {
  AnimationDuration,
  AnimationEasing,
  AnimationFill,
  AnimationFillActive,
  AnimationOpacity,
  AnimationPropertiesReturnError,
} from "../types/AnimationProperties"

export const ComputeAnimationDuration = (p: AnimationDuration): AnimationPropertiesReturnError & { value: number } => {
  if (p["animation-duration-walk"]) return { value: 800 }
  if (p["animation-duration-jog"]) return { value: 400 }
  if (p["animation-duration-run"]) return { value: 200 }
  if (p["animation-duration-sprint"]) return { value: 150 }

  return {
    value: 0,
    error: '<AnimateContentSize | AnimateOpacity | AnimateFill /> – missing "animation-duration-*" property',
  }
}

export const ComputeAnimationEasing = (
  p: AnimationEasing,
): AnimationPropertiesReturnError & { value: EasingFunction | EasingFunctionFactory } => {
  if (p["animation-easing-linear"]) return { value: Easing.linear }
  if (p["animation-easing-ease"]) return { value: Easing.ease }
  if (p["animation-easing-elastic"]) return { value: Easing.elastic(1.1) }

  return {
    value: Easing.linear,
    error: '<AnimateContentSize | AnimateOpacity | AnimateFill /> – missing "animation-easing-*" property',
  }
}

export const ComputeAnimationOpacity = (p: AnimationOpacity): AnimationPropertiesReturnError & { value: number } => {
  if (p["animation-opacity-opaque"]) return { value: 1 }
  if (p["animation-opacity-translucent"]) return { value: 0.4 }
  if (p["animation-opacity-transparent"]) return { value: 0 }

  return {
    value: 0,
    error: '<AnimateOpacity /> – missing "animation-opacity-*" property',
  }
}

export const ComputeAnimationFill = (p: AnimationFill): AnimationPropertiesReturnError & { value: string } => {
  if (p["animation-fill-white"]) return { value: `bg-white` }
  if (p["animation-fill-black"]) return { value: `bg-black` }

  if (p["animation-fill-primary-50"]) return { value: `bg-primary-50` }
  if (p["animation-fill-primary-100"]) return { value: `bg-primary-100` }
  if (p["animation-fill-primary-200"]) return { value: `bg-primary-200` }
  if (p["animation-fill-primary-300"]) return { value: `bg-primary-300` }
  if (p["animation-fill-primary-400"]) return { value: `bg-primary-400` }
  if (p["animation-fill-primary-500"]) return { value: `bg-primary-500` }
  if (p["animation-fill-primary-600"]) return { value: `bg-primary-600` }
  if (p["animation-fill-primary-700"]) return { value: `bg-primary-700` }
  if (p["animation-fill-primary-800"]) return { value: `bg-primary-800` }
  if (p["animation-fill-primary-900"]) return { value: `bg-primary-900` }

  if (p["animation-fill-tentative-50"]) return { value: `bg-tentative-50` }
  if (p["animation-fill-tentative-100"]) return { value: `bg-tentative-100` }
  if (p["animation-fill-tentative-200"]) return { value: `bg-tentative-200` }
  if (p["animation-fill-tentative-300"]) return { value: `bg-tentative-300` }
  if (p["animation-fill-tentative-400"]) return { value: `bg-tentative-400` }
  if (p["animation-fill-tentative-500"]) return { value: `bg-tentative-500` }
  if (p["animation-fill-tentative-600"]) return { value: `bg-tentative-600` }
  if (p["animation-fill-tentative-700"]) return { value: `bg-tentative-700` }
  if (p["animation-fill-tentative-800"]) return { value: `bg-tentative-800` }
  if (p["animation-fill-tentative-900"]) return { value: `bg-tentative-900` }

  if (p["animation-fill-tertiary-50"]) return { value: `bg-tertiary-50` }
  if (p["animation-fill-tertiary-100"]) return { value: `bg-tertiary-100` }
  if (p["animation-fill-tertiary-200"]) return { value: `bg-tertiary-200` }
  if (p["animation-fill-tertiary-300"]) return { value: `bg-tertiary-300` }
  if (p["animation-fill-tertiary-400"]) return { value: `bg-tertiary-400` }
  if (p["animation-fill-tertiary-500"]) return { value: `bg-tertiary-500` }
  if (p["animation-fill-tertiary-600"]) return { value: `bg-tertiary-600` }
  if (p["animation-fill-tertiary-700"]) return { value: `bg-tertiary-700` }
  if (p["animation-fill-tertiary-800"]) return { value: `bg-tertiary-800` }
  if (p["animation-fill-tertiary-900"]) return { value: `bg-tertiary-900` }

  if (p["animation-fill-positive-50"]) return { value: `bg-positive-50` }
  if (p["animation-fill-positive-100"]) return { value: `bg-positive-100` }
  if (p["animation-fill-positive-200"]) return { value: `bg-positive-200` }
  if (p["animation-fill-positive-300"]) return { value: `bg-positive-300` }
  if (p["animation-fill-positive-400"]) return { value: `bg-positive-400` }
  if (p["animation-fill-positive-500"]) return { value: `bg-positive-500` }
  if (p["animation-fill-positive-600"]) return { value: `bg-positive-600` }
  if (p["animation-fill-positive-700"]) return { value: `bg-positive-700` }
  if (p["animation-fill-positive-800"]) return { value: `bg-positive-800` }
  if (p["animation-fill-positive-900"]) return { value: `bg-positive-900` }

  if (p["animation-fill-negative-50"]) return { value: `bg-negative-50` }
  if (p["animation-fill-negative-100"]) return { value: `bg-negative-100` }
  if (p["animation-fill-negative-200"]) return { value: `bg-negative-200` }
  if (p["animation-fill-negative-300"]) return { value: `bg-negative-300` }
  if (p["animation-fill-negative-400"]) return { value: `bg-negative-400` }
  if (p["animation-fill-negative-500"]) return { value: `bg-negative-500` }
  if (p["animation-fill-negative-600"]) return { value: `bg-negative-600` }
  if (p["animation-fill-negative-700"]) return { value: `bg-negative-700` }
  if (p["animation-fill-negative-800"]) return { value: `bg-negative-800` }
  if (p["animation-fill-negative-900"]) return { value: `bg-negative-900` }

  if (p["animation-fill-neutral-50"]) return { value: `bg-neutral-50` }
  if (p["animation-fill-neutral-100"]) return { value: `bg-neutral-100` }
  if (p["animation-fill-neutral-200"]) return { value: `bg-neutral-200` }
  if (p["animation-fill-neutral-300"]) return { value: `bg-neutral-300` }
  if (p["animation-fill-neutral-400"]) return { value: `bg-neutral-400` }
  if (p["animation-fill-neutral-500"]) return { value: `bg-neutral-500` }
  if (p["animation-fill-neutral-600"]) return { value: `bg-neutral-600` }
  if (p["animation-fill-neutral-700"]) return { value: `bg-neutral-700` }
  if (p["animation-fill-neutral-800"]) return { value: `bg-neutral-800` }
  if (p["animation-fill-neutral-900"]) return { value: `bg-neutral-900` }

  if (p["animation-fill-neutralsurface-50"]) return { value: `bg-neutralsurface-50` }
  if (p["animation-fill-neutralsurface-100"]) return { value: `bg-neutralsurface-100` }
  if (p["animation-fill-neutralsurface-200"]) return { value: `bg-neutralsurface-200` }
  if (p["animation-fill-neutralsurface-300"]) return { value: `bg-neutralsurface-300` }
  if (p["animation-fill-neutralsurface-400"]) return { value: `bg-neutralsurface-400` }
  if (p["animation-fill-neutralsurface-500"]) return { value: `bg-neutralsurface-500` }
  if (p["animation-fill-neutralsurface-600"]) return { value: `bg-neutralsurface-600` }
  if (p["animation-fill-neutralsurface-700"]) return { value: `bg-neutralsurface-700` }
  if (p["animation-fill-neutralsurface-800"]) return { value: `bg-neutralsurface-800` }
  if (p["animation-fill-neutralsurface-900"]) return { value: `bg-neutralsurface-900` }

  if (p["animation-fill-text-50"]) return { value: `bg-text-50` }
  if (p["animation-fill-text-100"]) return { value: `bg-text-100` }
  if (p["animation-fill-text-200"]) return { value: `bg-text-200` }
  if (p["animation-fill-text-300"]) return { value: `bg-text-300` }
  if (p["animation-fill-text-400"]) return { value: `bg-text-400` }
  if (p["animation-fill-text-500"]) return { value: `bg-text-500` }
  if (p["animation-fill-text-600"]) return { value: `bg-text-600` }
  if (p["animation-fill-text-700"]) return { value: `bg-text-700` }
  if (p["animation-fill-text-800"]) return { value: `bg-text-800` }
  if (p["animation-fill-text-900"]) return { value: `bg-text-900` }

  return {
    value: "",
    error: '<AnimateFill /> – missing "animation-fill-*" property',
  }
}

export const ComputeAnimationFillActive = (
  p: AnimationFillActive,
): AnimationPropertiesReturnError & { value: string } => {
  if (p["animation-fill-white-active"]) return { value: `bg-white` }
  if (p["animation-fill-black-active"]) return { value: `bg-black` }

  if (p["animation-fill-primary-50-active"]) return { value: `bg-primary-50` }
  if (p["animation-fill-primary-100-active"]) return { value: `bg-primary-100` }
  if (p["animation-fill-primary-200-active"]) return { value: `bg-primary-200` }
  if (p["animation-fill-primary-300-active"]) return { value: `bg-primary-300` }
  if (p["animation-fill-primary-400-active"]) return { value: `bg-primary-400` }
  if (p["animation-fill-primary-500-active"]) return { value: `bg-primary-500` }
  if (p["animation-fill-primary-600-active"]) return { value: `bg-primary-600` }
  if (p["animation-fill-primary-700-active"]) return { value: `bg-primary-700` }
  if (p["animation-fill-primary-800-active"]) return { value: `bg-primary-800` }
  if (p["animation-fill-primary-900-active"]) return { value: `bg-primary-900` }

  if (p["animation-fill-tentative-50-active"]) return { value: `bg-tentative-50` }
  if (p["animation-fill-tentative-100-active"]) return { value: `bg-tentative-100` }
  if (p["animation-fill-tentative-200-active"]) return { value: `bg-tentative-200` }
  if (p["animation-fill-tentative-300-active"]) return { value: `bg-tentative-300` }
  if (p["animation-fill-tentative-400-active"]) return { value: `bg-tentative-400` }
  if (p["animation-fill-tentative-500-active"]) return { value: `bg-tentative-500` }
  if (p["animation-fill-tentative-600-active"]) return { value: `bg-tentative-600` }
  if (p["animation-fill-tentative-700-active"]) return { value: `bg-tentative-700` }
  if (p["animation-fill-tentative-800-active"]) return { value: `bg-tentative-800` }
  if (p["animation-fill-tentative-900-active"]) return { value: `bg-tentative-900` }

  if (p["animation-fill-tertiary-50-active"]) return { value: `bg-tertiary-50` }
  if (p["animation-fill-tertiary-100-active"]) return { value: `bg-tertiary-100` }
  if (p["animation-fill-tertiary-200-active"]) return { value: `bg-tertiary-200` }
  if (p["animation-fill-tertiary-300-active"]) return { value: `bg-tertiary-300` }
  if (p["animation-fill-tertiary-400-active"]) return { value: `bg-tertiary-400` }
  if (p["animation-fill-tertiary-500-active"]) return { value: `bg-tertiary-500` }
  if (p["animation-fill-tertiary-600-active"]) return { value: `bg-tertiary-600` }
  if (p["animation-fill-tertiary-700-active"]) return { value: `bg-tertiary-700` }
  if (p["animation-fill-tertiary-800-active"]) return { value: `bg-tertiary-800` }
  if (p["animation-fill-tertiary-900-active"]) return { value: `bg-tertiary-900` }

  if (p["animation-fill-positive-50-active"]) return { value: `bg-positive-50` }
  if (p["animation-fill-positive-100-active"]) return { value: `bg-positive-100` }
  if (p["animation-fill-positive-200-active"]) return { value: `bg-positive-200` }
  if (p["animation-fill-positive-300-active"]) return { value: `bg-positive-300` }
  if (p["animation-fill-positive-400-active"]) return { value: `bg-positive-400` }
  if (p["animation-fill-positive-500-active"]) return { value: `bg-positive-500` }
  if (p["animation-fill-positive-600-active"]) return { value: `bg-positive-600` }
  if (p["animation-fill-positive-700-active"]) return { value: `bg-positive-700` }
  if (p["animation-fill-positive-800-active"]) return { value: `bg-positive-800` }
  if (p["animation-fill-positive-900-active"]) return { value: `bg-positive-900` }

  if (p["animation-fill-negative-50-active"]) return { value: `bg-negative-50` }
  if (p["animation-fill-negative-100-active"]) return { value: `bg-negative-100` }
  if (p["animation-fill-negative-200-active"]) return { value: `bg-negative-200` }
  if (p["animation-fill-negative-300-active"]) return { value: `bg-negative-300` }
  if (p["animation-fill-negative-400-active"]) return { value: `bg-negative-400` }
  if (p["animation-fill-negative-500-active"]) return { value: `bg-negative-500` }
  if (p["animation-fill-negative-600-active"]) return { value: `bg-negative-600` }
  if (p["animation-fill-negative-700-active"]) return { value: `bg-negative-700` }
  if (p["animation-fill-negative-800-active"]) return { value: `bg-negative-800` }
  if (p["animation-fill-negative-900-active"]) return { value: `bg-negative-900` }

  if (p["animation-fill-neutral-50-active"]) return { value: `bg-neutral-50` }
  if (p["animation-fill-neutral-100-active"]) return { value: `bg-neutral-100` }
  if (p["animation-fill-neutral-200-active"]) return { value: `bg-neutral-200` }
  if (p["animation-fill-neutral-300-active"]) return { value: `bg-neutral-300` }
  if (p["animation-fill-neutral-400-active"]) return { value: `bg-neutral-400` }
  if (p["animation-fill-neutral-500-active"]) return { value: `bg-neutral-500` }
  if (p["animation-fill-neutral-600-active"]) return { value: `bg-neutral-600` }
  if (p["animation-fill-neutral-700-active"]) return { value: `bg-neutral-700` }
  if (p["animation-fill-neutral-800-active"]) return { value: `bg-neutral-800` }
  if (p["animation-fill-neutral-900-active"]) return { value: `bg-neutral-900` }

  if (p["animation-fill-neutralsurface-50-active"]) return { value: `bg-neutralsurface-50` }
  if (p["animation-fill-neutralsurface-100-active"]) return { value: `bg-neutralsurface-100` }
  if (p["animation-fill-neutralsurface-200-active"]) return { value: `bg-neutralsurface-200` }
  if (p["animation-fill-neutralsurface-300-active"]) return { value: `bg-neutralsurface-300` }
  if (p["animation-fill-neutralsurface-400-active"]) return { value: `bg-neutralsurface-400` }
  if (p["animation-fill-neutralsurface-500-active"]) return { value: `bg-neutralsurface-500` }
  if (p["animation-fill-neutralsurface-600-active"]) return { value: `bg-neutralsurface-600` }
  if (p["animation-fill-neutralsurface-700-active"]) return { value: `bg-neutralsurface-700` }
  if (p["animation-fill-neutralsurface-800-active"]) return { value: `bg-neutralsurface-800` }
  if (p["animation-fill-neutralsurface-900-active"]) return { value: `bg-neutralsurface-900` }

  if (p["animation-fill-text-50-active"]) return { value: `bg-text-50` }
  if (p["animation-fill-text-100-active"]) return { value: `bg-text-100` }
  if (p["animation-fill-text-200-active"]) return { value: `bg-text-200` }
  if (p["animation-fill-text-300-active"]) return { value: `bg-text-300` }
  if (p["animation-fill-text-400-active"]) return { value: `bg-text-400` }
  if (p["animation-fill-text-500-active"]) return { value: `bg-text-500` }
  if (p["animation-fill-text-600-active"]) return { value: `bg-text-600` }
  if (p["animation-fill-text-700-active"]) return { value: `bg-text-700` }
  if (p["animation-fill-text-800-active"]) return { value: `bg-text-800` }
  if (p["animation-fill-text-900-active"]) return { value: `bg-text-900` }

  return {
    value: "",
    error: '<AnimateFill /> – missing "animation-fill-*-active" property',
  }
}
