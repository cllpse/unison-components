import { type ComponentPropsWithRef, createContext, type MouseEvent, useContext, useEffect, useState } from "react"
import type { COLORS } from "../constants/colors"
import { computeFill } from "../utilities/computeFill"
import _Button, { _useButtonState } from "./_Button.web"
import Frame from "./Frame.web"
import Icon from "./Icon.web"
import Text from "./Text.web"

const ButtonContent = ({
  value,
  label,
  mode,
  color,
}: {
  value: boolean
  label: string
  // biome-ignore lint/suspicious/noExplicitAny: ...
  mode: InputSelectionList<any>["mode"]
  // biome-ignore lint/suspicious/noExplicitAny: ...
  color: InputSelectionList<any>["color"]
}) => {
  const { hovered } = _useButtonState()

  const colorFill200 = computeFill(color, 200)
  const colorFill600 = computeFill(color, 600)
  const colorFill700 = computeFill(color, 700)
  const colorFill800 = computeFill(color, 800)

  const inactiveCheckbox = (
    <Frame
      alignment-left
      corner-radius-full
      width-fill
      height-10
      gap-1
      flow-horizontal
      padding-left-2
      padding-right-3
      padding-vertical-1
    >
      <Icon {...colorFill700}>check_box_outline_blank</Icon>

      <Text {...colorFill700} typography-align-left typography-body-small-nowrap>
        {label}
      </Text>
    </Frame>
  )

  const inactiveRadio = (
    <Frame
      alignment-left
      corner-radius-full
      width-fill
      height-10
      gap-1
      flow-horizontal
      padding-left-2
      padding-right-3
      padding-vertical-1
    >
      <Icon {...colorFill700}>radio_button_unchecked</Icon>

      <Text {...colorFill700} typography-align-left typography-body-small-nowrap>
        {label}
      </Text>
    </Frame>
  )

  const inactiveCheckboxHovered = (
    <Frame
      alignment-left
      corner-radius-full
      width-fill
      height-10
      {...colorFill200}
      gap-1
      flow-horizontal
      padding-left-2
      padding-right-3
      padding-vertical-1
    >
      <Icon {...colorFill800}>check_box_outline_blank</Icon>

      <Text {...colorFill800} typography-align-left typography-body-small-nowrap>
        {label}
      </Text>
    </Frame>
  )

  const inactiveRadioHovered = (
    <Frame
      alignment-left
      corner-radius-full
      width-fill
      height-10
      {...colorFill200}
      gap-1
      flow-horizontal
      padding-left-2
      padding-right-3
      padding-vertical-1
    >
      <Icon {...colorFill800}>radio_button_unchecked</Icon>

      <Text {...colorFill800} typography-align-left typography-body-small-nowrap>
        {label}
      </Text>
    </Frame>
  )

  const activeCheckbox = (
    <Frame
      alignment-left
      corner-radius-full
      width-fill
      height-10
      gap-1
      flow-horizontal
      padding-left-2
      padding-right-3
      padding-vertical-1
    >
      <Icon {...colorFill700}>check_box</Icon>

      <Text {...colorFill700} typography-align-left typography-body-small-nowrap>
        {label}
      </Text>
    </Frame>
  )

  const activeRadio = (
    <Frame
      alignment-left
      corner-radius-full
      width-fill
      height-10
      gap-1
      flow-horizontal
      padding-left-2
      padding-right-3
      padding-vertical-1
    >
      <Icon {...colorFill700}>radio_button_checked</Icon>

      <Text {...colorFill700} typography-align-left typography-body-small-nowrap>
        {label}
      </Text>
    </Frame>
  )

  const activeCheckboxHovered = (
    <Frame
      alignment-left
      corner-radius-full
      width-fill
      height-10
      {...colorFill200}
      gap-1
      flow-horizontal
      padding-left-2
      padding-right-3
      padding-vertical-1
    >
      <Icon {...colorFill800}>check_box</Icon>

      <Text {...colorFill800} typography-align-left typography-body-small-nowrap>
        {label}
      </Text>
    </Frame>
  )

  const activeRadioHovered = (
    <Frame
      alignment-left
      corner-radius-full
      width-fill
      height-10
      {...colorFill200}
      gap-1
      flow-horizontal
      padding-left-2
      padding-right-3
      padding-vertical-1
    >
      <Icon {...colorFill800}>radio_button_checked</Icon>

      <Text {...colorFill800} typography-align-left typography-body-small-nowrap>
        {label}
      </Text>
    </Frame>
  )

  if (value) {
    if (hovered) {
      if (mode === "checkbox") return activeCheckboxHovered
      return activeRadioHovered
    }

    if (mode === "checkbox") return activeCheckbox
    return activeRadio
  }

  if (hovered) {
    if (mode === "checkbox") return inactiveCheckboxHovered
    return inactiveRadioHovered
  }

  if (mode === "checkbox") return inactiveCheckbox
  return inactiveRadio
}

type InputSelectionListItemKey<T> = T | null
type InputSelectionListItemValue<T> = T | null

export type InputSelectionListItemData<T> = {
  label: InputSelectionListItemKey<T>
  value: InputSelectionListItemValue<T>
}

export type InputSelectionList<T> = Omit<ComponentPropsWithRef<"div">, "onChange"> & {
  color: keyof typeof COLORS
  id: string
  name: string
  items: InputSelectionListItemData<T>[]
  value: InputSelectionListItemValue<T> | InputSelectionListItemValue<T>[]
  onChange: (value: InputSelectionListState<T>, event?: MouseEvent<HTMLDivElement>) => void
  mode: "radio" | "checkbox"
}

export type InputSelectionListState<T> = InputSelectionListItemValue<T>[]

// biome-ignore lint/suspicious/noExplicitAny: ...
const InputSelectionListContext = createContext<InputSelectionListState<any>>([])

export const useInputSelectionListState = () => useContext(InputSelectionListContext)

const normalizeValue = <T,>(
  value: InputSelectionListItemValue<T> | InputSelectionListItemValue<T>[],
): InputSelectionListState<T> => (Array.isArray(value) ? value : value === null ? [] : [value])

export default <T,>(p: InputSelectionList<T>) => {
  const [_value, _setValue] = useState<InputSelectionListState<T>>(() => normalizeValue(p.value))

  const controlledKey = JSON.stringify(normalizeValue(p.value))

  // biome-ignore lint/correctness/useExhaustiveDependencies: sync internal selection when the controlled value changes
  useEffect(() => {
    _setValue(normalizeValue(p.value))
  }, [controlledKey])

  const onClick = (item: InputSelectionListItemData<T>, event: MouseEvent<HTMLDivElement>) => {
    const newValues =
      p.mode === "checkbox"
        ? _value.includes(item.value)
          ? _value.filter((value) => value !== item.value)
          : [..._value, item.value]
        : [item.value]

    _setValue(newValues)

    p.onChange(newValues, event)
  }

  return (
    <InputSelectionListContext.Provider value={_value}>
      {p.items.map((item) => (
        <_Button
          key={String(item.value)}
          id={String(item.value)}
          onClick={(event) => onClick(item, event)}
          width-fill
          height-10
          className="frame__input-selection-list"
        >
          <ButtonContent value={_value.includes(item.value)} label={String(item.label)} mode={p.mode} color={p.color} />
        </_Button>
      ))}
    </InputSelectionListContext.Provider>
  )
}
