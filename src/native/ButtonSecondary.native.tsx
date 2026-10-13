import Button, { type Button as ButtonType } from "./Button.native"
import Frame from "./Frame.native"
import Text from "./Text.native"

export type ButtonSecondary = {
  label: string
  disabled?: boolean
  loading?: boolean
  destructive?: boolean
  onPress?: ButtonType["onPress"]
}

export default (p: ButtonSecondary) => (
  <Button onPress={p.onPress} _CLASSNAME="h-20 w-full" disabled={p.disabled} loading={p.loading}>
    <Frame flow-horizontal alignment-center width-fill height-fill padding-horizontal-large>
      <Text typography-body-nowrap fill-black={!p.destructive} fill-negative-700={p.destructive}>
        {p.label}
      </Text>
    </Frame>
  </Button>
)
