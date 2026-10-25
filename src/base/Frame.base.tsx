import type { ComponentType } from "react"
import {
  Pressable,
  type PressableProps as PressableProperties,
  type ViewProps as ReactNativeViewProperties,
  type Role,
  View,
} from "react-native"
import type {
  Animate,
  ClassName,
  FrameState,
  Group,
  PointerEvents,
  Style,
  ViewAttributes,
  ViewReference,
} from "../../types/base"
import type {
  FigmaFill,
  FigmaFrameAlignment,
  FigmaFrameAutolayout,
  FigmaFrameCornerRadius,
  FigmaFrameCornerRadiusBottomLeft,
  FigmaFrameCornerRadiusBottomRight,
  FigmaFrameCornerRadiusTopLeft,
  FigmaFrameCornerRadiusTopRight,
  FigmaFrameEffectShadow,
  FigmaFrameFillState,
  FigmaFrameGap,
  FigmaFrameGroupFill,
  FigmaFrameGroupStroke,
  FigmaFrameHeight,
  FigmaFramePadding,
  FigmaFramePaddingBottom,
  FigmaFramePaddingHorizontal,
  FigmaFramePaddingLeft,
  FigmaFramePaddingRight,
  FigmaFramePaddingTop,
  FigmaFramePaddingVertical,
  FigmaFrameStrokeState,
  FigmaFrameWidth,
  FigmaFrameWrap,
  FigmaStroke,
  FigmaStrokeStyle,
  FigmaTransition,
  FigmaTransitionDelay,
  FigmaTransitionDuration,
  FigmaTransitionEasing,
} from "../../types/figma"
import {
  computeElementAnimate,
  computeElementPointerEvents,
  computeElementTransition,
  computeElementTransitionDelay,
  computeElementTransitionDuration,
  computeElementTransitionEasing,
  computeFrameAlignment,
  computeFrameAutolayout,
  computeFrameColorStates,
  computeFrameCornerRadius,
  computeFrameEffectShadow,
  computeFrameFill,
  computeFrameGap,
  computeFrameGroup,
  computeFramePadding,
  computeFramePaddingBottom,
  computeFramePaddingHorizontal,
  computeFramePaddingLeft,
  computeFramePaddingRight,
  computeFramePaddingTop,
  computeFramePaddingVertical,
  computeFrameSizing,
  computeFrameStateAttributes,
  computeFrameStroke,
  computeFrameWrap,
} from "../../utilities/computeProperties"

export type Frame = FigmaFrameAutolayout &
  FigmaFrameWidth &
  FigmaFrameHeight &
  FigmaFrameAlignment &
  FigmaFrameWrap &
  FigmaFrameGap &
  FigmaFramePadding &
  FigmaFramePaddingVertical &
  FigmaFramePaddingHorizontal &
  FigmaFramePaddingLeft &
  FigmaFramePaddingRight &
  FigmaFramePaddingTop &
  FigmaFramePaddingBottom &
  FigmaFill &
  FigmaStroke &
  FigmaStrokeStyle &
  FigmaFrameFillState &
  FigmaFrameStrokeState &
  FigmaFrameGroupFill &
  FigmaFrameGroupStroke &
  FigmaFrameCornerRadius &
  FigmaFrameCornerRadiusTopLeft &
  FigmaFrameCornerRadiusTopRight &
  FigmaFrameCornerRadiusBottomLeft &
  FigmaFrameCornerRadiusBottomRight &
  FigmaFrameEffectShadow &
  FigmaTransition &
  FigmaTransitionDuration &
  FigmaTransitionDelay &
  FigmaTransitionEasing &
  Animate &
  PointerEvents &
  Group &
  FrameState &
  ViewAttributes &
  ViewReference & {
    onTouchStart?: PressableProperties["onTouchStart"]
    onTouchEnd?: PressableProperties["onTouchEnd"]

    onPress?: PressableProperties["onPress"]
    onPressIn?: PressableProperties["onPressIn"]
    onPressOut?: PressableProperties["onPressOut"]

    style?: Style
    className?: ClassName

    children?: ReactNativeViewProperties["children"]

    /**
     * @deprecated Internal escape hatch for the native shell: the animated View and Pressable to render instead of
     * React Native's, with the motion carried in `style` rather than in classes (see computeElementMotion).
     */
    _animated?: Readonly<{ View: ComponentType<object>; Pressable: ComponentType<object> }>
  }

export default (p: Frame) => {
  const animated = p._animated

  const className = [
    "flex",
    computeFrameAutolayout(p).className,
    computeFrameWrap(p).className,
    computeFrameAlignment(p).className,
    computeFrameSizing(p).className,
    computeFrameGap(p).className,
    computeFramePadding(p).className,
    computeFramePaddingVertical(p).className,
    computeFramePaddingHorizontal(p).className,
    computeFramePaddingLeft(p).className,
    computeFramePaddingRight(p).className,
    computeFramePaddingTop(p).className,
    computeFramePaddingBottom(p).className,
    computeFrameFill(p).className,
    computeFrameStroke(p).className,
    computeFrameColorStates(p).className,
    computeFrameCornerRadius(p).className,
    computeFrameEffectShadow(p).className,
    computeElementPointerEvents(p).className,
    computeFrameGroup(p).className,
    // The animated components take the motion as styles; Uniwind would otherwise add an empty easing on top.
    animated ? undefined : computeElementTransition(p).className,
    animated ? undefined : computeElementTransitionDuration(p).className,
    animated ? undefined : computeElementTransitionDelay(p).className,
    animated ? undefined : computeElementTransitionEasing(p).className,
    animated ? undefined : computeElementAnimate(p).className,
    p.className,
  ]
    .filter(Boolean)
    .join(" ")

  const props = {
    id: p.id,
    ref: p.ref,
    role: p.role as Role,
    "aria-label": p["aria-label"],
    "aria-selected": p["aria-selected"],
    "aria-disabled": p.disabled,
    ...computeFrameStateAttributes(p),
    onTouchStart: p.onTouchStart,
    onTouchEnd: p.onTouchEnd,
    // React Native Web's className passthrough; React Native's style types don't know `$$css`. The animated components
    // only exist on iOS and Android, where the className prop does it, so they get the style alone.
    style: (animated ? p.style : [p.style, { $$css: true, className }]) as ReactNativeViewProperties["style"],
    className,
    pointerEvents: p.pointerEvents,
    children: p.children,
  }

  const FrameView = animated?.View ?? View
  const FramePressable = animated?.Pressable ?? Pressable

  if (p.onPress || p.onPressIn || p.onPressOut) {
    return (
      <FramePressable
        {...props}
        disabled={p.disabled}
        onPress={p.onPress}
        onPressIn={p.onPressIn}
        onPressOut={p.onPressOut}
      />
    )
  }

  return <FrameView {...props} />
}
