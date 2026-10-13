import type { ColorName, ColorNameAndShade } from "../constants/colors"
import type { FigmaFill } from "../types/FigmaProperties"
import { extractProperties } from "../utilities/extractProperties"
import _ButtonBase from "./_ButtonBase.web"
import type { _ButtonBaseColors, _ButtonBase as _ButtonBaseType } from "./_ButtonBase.web.tsx"

type ButtonSecondaryBase = {
  color: ColorName
  destructive?: boolean
  loading?: boolean
}

export type ButtonSecondary = Omit<_ButtonBaseType, keyof _ButtonBaseColors | "loading"> & ButtonSecondaryBase

export default (p: ButtonSecondary) => {
  const { fromType, fromRest } = extractProperties<ButtonSecondaryBase>()(p, ["color", "destructive", "loading"])

  const colorNameDestructive: ColorName = fromType.destructive ? "negative" : fromType.color

  const color: ColorNameAndShade = `${fromType.color}-100`
  const colorHover: ColorNameAndShade = `${colorNameDestructive}-200`
  const colorDisabled: ColorNameAndShade = `${fromType.color}-50`
  const colorLabel: ColorNameAndShade = `${fromType.color}-700`
  const colorLabelHover: ColorNameAndShade = `${colorNameDestructive}-800`
  const colorLabelDisabled: ColorNameAndShade = `${fromType.color}-400`
  const colorIconForeground: ColorNameAndShade = `${fromType.color}-700`
  const colorIconForegroundHover: ColorNameAndShade = `${colorNameDestructive}-800`
  const colorIconForegroundDisabled: ColorNameAndShade = `${fromType.color}-400`
  const colorLoading = `fill-${color}` as keyof FigmaFill

  const { className, ...rest } = fromRest

  return (
    <_ButtonBase
      {...rest}
      className={`frame__button-secondary ${className ?? ""}`}
      color={color}
      colorHover={colorHover}
      colorDisabled={colorDisabled}
      colorLabel={colorLabel}
      colorLabelHover={colorLabelHover}
      colorLabelDisabled={colorLabelDisabled}
      colorIconForeground={colorIconForeground}
      colorIconForegroundHover={colorIconForegroundHover}
      colorIconForegroundDisabled={colorIconForegroundDisabled}
      loading={[fromType.loading ?? false, colorLoading]}
    />
  )
}
