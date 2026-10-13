import Button, { type Button as ButtonType } from "./Button.native"
import Frame from "./Frame.native"
import Text from "./Text.native"

export type TButtonPrimary = {
  label: string
  disabled?: boolean
  loading?: boolean
  destructive?: boolean
  onPress?: ButtonType["onPress"]
}

export default (p: TButtonPrimary) => (
  <Button onPress={p.onPress} _CLASSNAME="h-20 w-full" disabled={p.disabled} loading={p.loading}>
    <Frame flow-horizontal alignment-center width-fill height-fill>
      <Text typography-label-wrap fill-primary-700={!p.destructive} fill-negative-700={p.destructive}>
        {p.label}
      </Text>
    </Frame>
  </Button>
)
