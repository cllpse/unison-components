import type { ReactElement } from "react"
import type { ColorNameAndShade } from "../constants/colors"
import type { FigmaFrameAlignment, FigmaFrameWidth } from "../types/FigmaProperties"
import { extractProperties } from "../utilities/extractProperties"
import type { _Button as _ButtonType } from "./_Button.web"
import _Button from "./_Button.web"
import Frame, { type Frame as FrameType } from "./Frame.web"
import Icon from "./Icon.web"
import Text from "./Text.web"

type _ButtonBaseActions = ReactElement<_ButtonBase> | ReactElement<_ButtonBase>[]

export type _ButtonBaseColors = {
  color: ColorNameAndShade
  colorHover: ColorNameAndShade
  colorDisabled: ColorNameAndShade

  colorLabel: ColorNameAndShade
  colorLabelHover: ColorNameAndShade
  colorLabelDisabled: ColorNameAndShade

  colorIconForeground: ColorNameAndShade
  colorIconForegroundHover: ColorNameAndShade
  colorIconForegroundDisabled: ColorNameAndShade
}

type Base = _ButtonBaseColors & {
  loading?: FrameType["loading"]
  label?: string
  icon?: string
  actions?: _ButtonBaseActions
}

/**
 * @deprecated Internal component. Use with caution.
 * @remarks Use this component directly only if you know what you are doing. Otherwise, use ButtonPrimary or ButtonSecondary.
 * @see ButtonPrimary
 * @see ButtonSecondary
 */
export type _ButtonBase = Omit<_ButtonType, "children" | "loading"> & FigmaFrameWidth & FigmaFrameAlignment & Base

const ButtonContent = (p: {
  label?: _ButtonBase["label"]
  icon?: _ButtonBase["icon"]
  disabled?: _ButtonBase["disabled"]
  active?: _ButtonBase["active"]
  actions?: _ButtonBase["actions"]

  color: _ButtonBase["color"]
  colorHover: _ButtonBase["colorHover"]
  colorDisabled: _ButtonBase["colorDisabled"]

  colorLabel: _ButtonBase["colorLabel"]
  colorLabelHover: _ButtonBase["colorLabelHover"]
  colorLabelDisabled: _ButtonBase["colorLabelDisabled"]

  colorIconForeground: _ButtonBase["colorIconForeground"]
  colorIconForegroundHover: _ButtonBase["colorIconForegroundHover"]
  colorIconForegroundDisabled: _ButtonBase["colorIconForegroundDisabled"]

  alignment?: FigmaFrameAlignment
  loading?: FrameType["loading"]
}) => {
  const alignmentOverride = Object.keys(p.alignment ?? {}).length > 0 ? p.alignment : null

  let color = { [`fill-${p.color}`]: true }
  let colorHover = { [`fill-hover-${p.colorHover}`]: true }

  let colorLabel = { [`fill-${p.colorLabel}`]: true }
  let colorLabelHover = { [`fill-hover-${p.colorLabelHover}`]: true }

  let colorIcon = { [`fill-${p.colorIconForeground}`]: true }
  let colorIconHover = { [`fill-hover-${p.colorIconForegroundHover}`]: true }

  if (p.active) {
    color = { [`fill-${p.colorHover}`]: true }
    colorHover = { [`fill-hover-${p.colorHover}`]: true }

    colorLabel = { [`fill-${p.colorLabelHover}`]: true }
    colorLabelHover = { [`fill-hover-${p.colorLabelHover}`]: true }

    colorIcon = { [`fill-${p.colorIconForegroundHover}`]: true }
    colorIconHover = { [`fill-hover-${p.colorIconForegroundHover}`]: true }
  }

  if (p.disabled) {
    color = { [`fill-${p.colorDisabled}`]: true }
    colorHover = { [`fill-hover-${p.colorDisabled}`]: true }

    colorLabel = { [`fill-${p.colorLabelDisabled}`]: true }
    colorLabelHover = { [`fill-hover-${p.colorLabelDisabled}`]: true }

    colorIcon = { [`fill-${p.colorIconForegroundDisabled}`]: true }
    colorIconHover = { [`fill-hover-${p.colorIconForegroundDisabled}`]: true }
  }

  const label = (
    <Text
      typography-align-center
      typography-body-small-nowrap
      tailwind-group-hover-fill
      {...colorLabel}
      {...colorLabelHover}
    >
      {p.label}
    </Text>
  )

  const icon = (
    <Icon tailwind-group-hover-fill {...colorIcon} {...colorIconHover}>
      {p.icon}
    </Icon>
  )

  const withLabel = (
    <Frame
      alignment-center={alignmentOverride === null}
      corner-radius-full
      width-fill
      height-fill
      gap-1
      flow-horizontal
      padding-horizontal-3
      padding-vertical-1
      tailwind-group
      loading={p.loading}
      {...color}
      {...colorHover}
      {...alignmentOverride}
    >
      {label}
    </Frame>
  )

  const withIcon = (
    <Frame
      alignment-center
      corner-radius-full
      width-fill
      height-fill
      flow-horizontal
      padding-horizontal-1
      padding-vertical-1
      tailwind-group
      loading={p.loading}
      {...color}
      {...colorHover}
    >
      {icon}
    </Frame>
  )

  const withLabelAndIcon = (
    <Frame
      alignment-left={alignmentOverride === null}
      corner-radius-full
      width-fill
      height-fill
      gap-1
      flow-horizontal
      padding-left-2
      padding-right-3
      padding-vertical-1
      tailwind-group
      loading={p.loading}
      {...color}
      {...colorHover}
      {...alignmentOverride}
    >
      {icon}

      {label}
    </Frame>
  )

  const widthActions = (
    <Frame
      alignment-left
      corner-radius-full
      width-fill
      height-fill
      gap-2
      flow-horizontal
      padding-left-3
      padding-right-1
      padding-vertical-1
      tailwind-group
      loading={p.loading}
      {...color}
      {...colorHover}
    >
      <Frame alignment-left width-fill height-fill gap-2 flow-horizontal>
        {label}
      </Frame>

      {p.actions}
    </Frame>
  )

  if (p.label && p.icon && !p.actions) {
    return withLabelAndIcon
  }

  if (p.label && !p.icon && !p.actions) {
    return withLabel
  }

  if (!p.label && p.icon && !p.actions) {
    return withIcon
  }

  if (p.label && !p.icon && p.actions) {
    return widthActions
  }

  return null
}

/**
 * @deprecated Internal component. Use with caution.
 * @remarks Use this component directly only if you know what you are doing. Otherwise, use ButtonPrimary or ButtonSecondary.
 * @see ButtonPrimary
 * @see ButtonSecondary
 */
export default (p: _ButtonBase) => {
  const { fromType, fromRest } = extractProperties<Base>()(p, [
    "label",
    "icon",
    "actions",
    "color",
    "colorHover",
    "colorLabel",
    "colorLabelHover",
    "colorIconForeground",
    "colorIconForegroundHover",
    "colorDisabled",
    "colorLabelDisabled",
    "colorIconForegroundDisabled",
    "loading",
  ])

  const { id, className, disabled, active, ...rest } = fromRest
  const isLoading = fromType.loading?.[0] === true

  const { fromType: fromAlignment, fromRest: _ } = extractProperties<FigmaFrameAlignment>()(fromRest, [
    "alignment-left",
    "alignment-center",
    "alignment-right",
    "alignment-top-left",
    "alignment-top-center",
    "alignment-top-right",
    "alignment-bottom-left",
    "alignment-bottom-center",
    "alignment-bottom-right",
  ])

  return (
    <_Button
      id={id}
      height-10
      width-10={!!(fromType.icon && !fromType.label)}
      disabled={disabled}
      active={active}
      {...rest}
      loading={isLoading}
      className={`frame__button-base ${className ?? ""}`}
    >
      <ButtonContent
        colorDisabled={fromType.colorDisabled}
        colorLabelDisabled={fromType.colorLabelDisabled}
        colorIconForegroundDisabled={fromType.colorIconForegroundDisabled}
        label={fromType.label}
        icon={fromType.icon}
        actions={fromType.actions}
        color={fromType.color}
        colorHover={fromType.colorHover}
        colorLabel={fromType.colorLabel}
        colorLabelHover={fromType.colorLabelHover}
        colorIconForeground={fromType.colorIconForeground}
        colorIconForegroundHover={fromType.colorIconForegroundHover}
        active={active}
        disabled={disabled}
        alignment={fromAlignment}
        loading={fromType.loading}
      />
    </_Button>
  )
}
