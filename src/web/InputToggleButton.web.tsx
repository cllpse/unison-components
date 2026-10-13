import type { MouseEvent } from "react"
import type { COLORS } from "../constants/colors"
import type { FigmaFrameWidth } from "../types/FigmaProperties"
import { computeFill } from "../utilities/computeFill"
import { computeFillHover } from "../utilities/computeFillHover"
import { extractProperties } from "../utilities/extractProperties"
import type { _Button as _ButtonType } from "./_Button.web"
import _Button, { _useButtonState } from "./_Button.web"
import Frame from "./Frame.web"
import Icon from "./Icon.web"
import Text from "./Text.web"

type Base = {
  color: keyof typeof COLORS
  active: boolean
  labelActive: string
  labelInactive: string
  iconActive: string
  iconInactive: string
  onChange: (active: boolean, event: MouseEvent<HTMLButtonElement>) => void
}

export type ButtonToggle = Base & Omit<_ButtonType, "children" | "onChange" | "active"> & FigmaFrameWidth

const ButtonContent = (p: {
  labelActive: ButtonToggle["labelActive"]
  labelInactive: ButtonToggle["labelInactive"]
  iconActive: ButtonToggle["iconActive"]
  iconInactive: ButtonToggle["iconInactive"]
  color: ButtonToggle["color"]
  active: ButtonToggle["active"]
}) => {
  const { disabled } = _useButtonState()

  let foregroundFill = {}
  let backgroundFill = {}
  let foregroundFillHover = {}
  let backgroundFillHover = {}

  if (disabled) {
    foregroundFill = computeFill(p.color, 400)
    backgroundFill = computeFill(p.color, 100)
  } else if (p.active) {
    foregroundFill = computeFill(p.color, 50)
    backgroundFill = computeFill(p.color, 600)
    foregroundFillHover = computeFillHover(p.color, 100)
    backgroundFillHover = computeFillHover(p.color, 700)
  } else {
    foregroundFill = computeFill(p.color, 700)
    backgroundFill = computeFill(p.color, 100)
    foregroundFillHover = computeFillHover(p.color, 800)
    backgroundFillHover = computeFillHover(p.color, 200)
  }

  return (
    <Frame
      alignment-left
      corner-radius-full
      width-fill
      height-fill
      gap-1
      flow-horizontal
      padding-left-2
      padding-right-3
      padding-vertical-1
      tailwind-group
      {...backgroundFill}
      {...backgroundFillHover}
    >
      <Icon tailwind-group-hover-fill {...foregroundFill} {...foregroundFillHover}>
        {p.active ? p.iconActive : p.iconInactive}
      </Icon>

      <Text
        typography-align-center
        typography-body-small-nowrap
        tailwind-group-hover-fill
        {...foregroundFill}
        {...foregroundFillHover}
      >
        {p.active ? p.labelActive : p.labelInactive}
      </Text>
    </Frame>
  )
}

export default (p: ButtonToggle) => {
  const { fromType, fromRest } = extractProperties<Base>()(p, [
    "color",
    "active",
    "labelActive",
    "labelInactive",
    "iconActive",
    "iconInactive",
    "onChange",
  ])

  const { className, ...rest } = fromRest

  return (
    <_Button
      height-10
      onClick={(event) => fromType.onChange(!fromType.active, event as unknown as MouseEvent<HTMLButtonElement>)}
      {...rest}
      className={`frame__input-toggle-button ${className ?? ""}`}
    >
      <ButtonContent
        labelActive={fromType.labelActive}
        labelInactive={fromType.labelInactive}
        iconActive={fromType.iconActive}
        iconInactive={fromType.iconInactive}
        color={fromType.color}
        active={fromType.active}
      />
    </_Button>
  )
}
