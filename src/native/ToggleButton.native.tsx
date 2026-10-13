import Button from "./Button.native"
import Frame from "./Frame.native"
import Text from "./Text.native"

export type ToggleButton = {
  disabled?: boolean
  onChange?: (value: string) => void
  values: string[]
  value: string
}

export default (p: ToggleButton) => {
  return (
    <Frame
      flow-horizontal
      width-hug
      height-hug
      alignment-center
      fill-primary-50
      corner-radius-full
      stroke-weight-large
      className="px-1 py-1"
    >
      {p.values.map((value) => (
        <Button key={value} onPress={() => p.onChange?.(value)}>
          <Frame
            key={value}
            flow-horizontal
            width-hug
            height-fill
            alignment-center
            corner-radius-full
            padding-horizontal-medium
            fill-primary-600={p.value === value}
            className="h-12"
          >
            <Text typography-label-wrap fill-white={p.value === value} fill-primary-600={p.value !== value}>
              {value}
            </Text>
          </Frame>
        </Button>
      ))}
    </Frame>
  )
}
