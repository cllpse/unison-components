import type { MouseEvent } from "react"
import type { COLORS } from "../constants/colors"
import type { FigmaFrameWidth } from "../types/FigmaProperties"
import { computeFill } from "../utilities/computeFill"
import { computeFillHover } from "../utilities/computeFillHover"
import { extractProperties } from "../utilities/extractProperties"
import type { _Button as _ButtonType } from "./_Button.web"
import _Button, { _useButtonState } from "./_Button.web"
import Frame from "./Frame.web"

type Base = {
  color: keyof typeof COLORS
  active: boolean
  onChange: (active: boolean, event: MouseEvent<HTMLButtonElement>) => void
}

export type InputToggle = Base & Omit<_ButtonType, "children" | "onChange" | "active"> & FigmaFrameWidth

const ButtonContent = (p: { color: InputToggle["color"]; active: InputToggle["active"] }) => {
  const { disabled } = _useButtonState()

  let backgroundFill = {}
  let backgroundFillHover = {}

  if (disabled) {
    if (p.active) {
      backgroundFill = computeFill(p.color, 500)
    } else {
      backgroundFill = computeFill("neutral", 400)
    }
  } else if (p.active) {
    backgroundFill = computeFill(p.color, 700)
    backgroundFillHover = computeFillHover(p.color, 800)
  } else {
    backgroundFill = computeFill("neutral", 400)
    backgroundFillHover = computeFillHover("neutral", 500)
  }

  return (
    <Frame alignment-left width-fill height-fill padding-vertical-1 flow-vertical gap-1>
      <Frame
        alignment-left={!p.active}
        alignment-right={p.active}
        corner-radius-full
        width-fill
        height-fill
        gap-1
        flow-horizontal
        padding-horizontal-1
        padding-vertical-1
        {...backgroundFill}
        {...backgroundFillHover}
      >
        <Frame alignment-center corner-radius-full width-4 height-4 fill-white />
      </Frame>
    </Frame>
  )
}

export default (p: InputToggle) => {
  const { fromType, fromRest } = extractProperties<Base>()(p, ["color", "active", "onChange"])

  const { className, ...rest } = fromRest

  return (
    <_Button
      height-8
      width-10
      onClick={(event) => fromType.onChange(!fromType.active, event as unknown as MouseEvent<HTMLButtonElement>)}
      {...rest}
      className={`frame__input-toggle ${className ?? ""}`}
    >
      <ButtonContent color={fromType.color} active={fromType.active} />
    </_Button>
  )
}
