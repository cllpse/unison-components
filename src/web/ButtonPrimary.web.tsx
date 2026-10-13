import type { ColorName, ColorNameAndShade } from "../constants/colors"
import type { FigmaFill } from "../types/FigmaProperties"
import { extractProperties } from "../utilities/extractProperties"
import _ButtonBase from "./_ButtonBase.web"
import type { _ButtonBaseColors, _ButtonBase as _ButtonBaseType } from "./_ButtonBase.web.tsx"

type ButtonPrimaryBase = {
  color: ColorName
  destructive?: boolean
  loading?: boolean
}

export type ButtonPrimary = Omit<_ButtonBaseType, keyof _ButtonBaseColors | "loading"> & ButtonPrimaryBase

export default (p: ButtonPrimary) => {
  const { fromType, fromRest } = extractProperties<ButtonPrimaryBase>()(p, ["color", "destructive", "loading"])

  const color: ColorNameAndShade = `${fromType.color}-700`
  const colorHover: ColorNameAndShade = `${fromType.destructive ? "negative" : fromType.color}-800`
  const colorDisabled: ColorNameAndShade = `${fromType.color}-500`
  const colorLabel: ColorNameAndShade = `white`
  const colorLabelHover: ColorNameAndShade = `white`
  const colorLabelDisabled: ColorNameAndShade = `${fromType.color}-200`
  const colorIconForeground: ColorNameAndShade = `white`
  const colorIconForegroundHover: ColorNameAndShade = `white`
  const colorIconForegroundDisabled: ColorNameAndShade = `${fromType.color}-200`
  const colorLoading = `fill-${color}` as keyof FigmaFill

  const { className, ...rest } = fromRest

  return (
    <_ButtonBase
      {...rest}
      className={`frame__button-primary ${className ?? ""}`}
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
