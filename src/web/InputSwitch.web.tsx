import type { ComponentPropsWithRef, MouseEvent } from "react"
import type { COLORS } from "../constants/colors"
import { computeFill } from "../utilities/computeFill"
import { computeFillHover } from "../utilities/computeFillHover"
import { extractProperties } from "../utilities/extractProperties"
import _Button, { _useButtonState } from "./_Button.web"
import Frame from "./Frame.web"
import Text from "./Text.web"

export type InputSwitchSide = "left" | "right"

type Base = {
  color: keyof typeof COLORS
  leftLabel: string
  rightLabel: string
  value: InputSwitchSide
  onChange: (side: InputSwitchSide, event: MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
}

export type InputSwitch = Base & Omit<ComponentPropsWithRef<"div">, "onChange" | "color">

const SegmentContent = (p: {
  label: string
  active: boolean
  color: keyof typeof COLORS
}) => {
  const { disabled } = _useButtonState()

  let foregroundFill = {}
  let backgroundFill = {}
  let foregroundFillHover = {}
  let colorforegroundActive = {}

  if (disabled) {
    foregroundFill = computeFill(p.color, 400)
    backgroundFill = p.active ? computeFill(p.color, 500) : computeFill(p.color, 700)
  } else if (p.active) {
    backgroundFill = { "fill-white": true }
    colorforegroundActive = {"text-700": true}
  } else {
    foregroundFill = { "fill-white": true }
    foregroundFillHover = computeFillHover("primary", 50)
  }

  return (
    <Frame
      alignment-center
      corner-radius-full
      width-hug
      height-fill
      flow-horizontal
      padding-horizontal-2
      padding-vertical-1
      tailwind-group
      {...backgroundFill}
    >
      <Text
      {...colorforegroundActive}
        typography-align-center
        typography-body-small-nowrap
        tailwind-group-hover-fill
        {...foregroundFill}
        {...foregroundFillHover}
      >
        {p.label}
      </Text>
    </Frame>
  )
}

const Segment = (p: {
  label: string
  side: InputSwitchSide
  active: boolean
  color: keyof typeof COLORS
  disabled: boolean
  onChange: Base["onChange"]
}) => (
  <_Button
    role="tab"
    aria-selected={p.active}
    disabled={p.disabled}
    height-fill
    width-hug
    active={p.active}
    onClick={(event) => {
      if (p.disabled || p.active) return
      p.onChange(p.side, event as unknown as MouseEvent<HTMLButtonElement>)
    }}
    className="frame__input-switch__segment"
  >
    <SegmentContent label={p.label} active={p.active} color={p.color} />
  </_Button>
)

export default (p: InputSwitch) => {
  const { fromType, fromRest } = extractProperties<Base>()(p, [
    "color",
    "leftLabel",
    "rightLabel",
    "value",
    "onChange",
    "disabled",
  ])

  const { className } = fromRest
  const isDisabled = fromType.disabled === true
  const trackFill = isDisabled ? computeFill(fromType.color, 400) : computeFill(fromType.color, 700)
  const backgroundFillHover = computeFillHover(fromType.color, 800)

  return (
    <Frame
      role="tablist"
      aria-orientation="horizontal"
      type-frame
      alignment-center
      corner-radius-full
      width-hug
      height-10
      gap-1
      flow-horizontal
      padding-horizontal-1
      padding-vertical-1
      {...backgroundFillHover}
      {...trackFill}
      className={`frame__input-switch select-none ${className ?? ""}`}
    >
      <Segment
        label={fromType.leftLabel}
        side="left"
        active={fromType.value === "left"}
        color={fromType.color}
        disabled={isDisabled}
        onChange={fromType.onChange}
      />
      <Segment
        label={fromType.rightLabel}
        side="right"
        active={fromType.value === "right"}
        color={fromType.color}
        disabled={isDisabled}
        onChange={fromType.onChange}
      />
    </Frame>
  )
}
