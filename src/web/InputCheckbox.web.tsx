import { type ComponentPropsWithRef, type MouseEvent, useEffect, useState } from "react"
import _Button, { _useButtonState } from "./_Button.web"
import Frame from "./Frame.web"
import Icon from "./Icon.web"
import Text from "./Text.web"

const ButtonContent = ({ value, label }: { value: boolean; label: string }) => {
  const { hovered } = _useButtonState()

  const inactive = (
    <Frame alignment-left width-fill height-fill gap-1 flow-horizontal>
      <Icon fill-neutral-700>check_box_outline_blank</Icon>

      <Text typography-align-left fill-neutral-700 typography-body-small-nowrap>
        {label}
      </Text>
    </Frame>
  )

  const hover = (
    <Frame alignment-left width-fill height-fill gap-1 flow-horizontal>
      <Icon fill-neutral-800>check_box_outline_blank</Icon>

      <Text typography-align-left fill-neutral-800 typography-body-small-nowrap>
        {label}
      </Text>
    </Frame>
  )

  const active = (
    <Frame alignment-left width-fill height-fill gap-1 flow-horizontal>
      <Icon fill-neutral-700>check_box</Icon>

      <Text typography-align-left fill-neutral-700 typography-body-small-nowrap>
        {label}
      </Text>
    </Frame>
  )

  const activeHover = (
    <Frame alignment-left width-fill height-fill gap-1 flow-horizontal>
      <Icon fill-neutral-800>check_box</Icon>

      <Text typography-align-left fill-neutral-800 typography-body-small-nowrap>
        {label}
      </Text>
    </Frame>
  )

  if (value) {
    if (hovered) {
      return activeHover
    }

    return active
  }

  if (hovered) {
    return hover
  }

  return inactive
}

export type InputCheckbox = Omit<ComponentPropsWithRef<"div">, "onChange" | "value"> & {
  id: string
  name: string
  label: string
  value: boolean
  onChange: (value: boolean, event?: MouseEvent<HTMLButtonElement>) => void
}

export default (p: InputCheckbox) => {
  const [_value, _setValue] = useState<boolean>(p.value)

  useEffect(() => {
    _setValue(p.value)
  }, [p.value])

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    _setValue(!_value)
    p.onChange(!_value, event)
  }

  return (
    <_Button
      id={p.id}
      onClick={(event) => onClick(event as unknown as MouseEvent<HTMLButtonElement>)}
      width-hug
      height-10
      className="frame__input-checkbox"
    >
      <ButtonContent value={_value} label={p.label} />
    </_Button>
  )
}
