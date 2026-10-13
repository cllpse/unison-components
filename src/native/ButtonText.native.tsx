import type { FigmaFill } from "../types/FigmaProperties"
import Button, { type Button as ButtonType } from "./Button.native"
import Text from "./Text.native"

export type ButtonText = FigmaFill & {
  label: string
  disabled?: boolean
  loading?: boolean
  onPress?: ButtonType["onPress"]
}

export default (p: ButtonText) => {
  const { label, disabled, loading, onPress, ...figmaFillProperties } = p

  return (
    <Button onPress={onPress} _CLASSNAME="w-auto z-20" disabled={disabled} loading={loading}>
      <Text typography-body-wrap typography-decoration-underline {...figmaFillProperties}>
        {label}
      </Text>
    </Button>
  )
}
