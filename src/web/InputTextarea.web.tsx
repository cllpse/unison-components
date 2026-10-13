import { type ChangeEvent, type ComponentPropsWithRef, useEffect, useRef, useState } from "react"
import _Button, { _useButtonState } from "./_Button.web"
import Frame from "./Frame.web"
import Icon from "./Icon.web"
import Text from "./Text.web"

type LabelPosition = "inside" | "outside"

export type InputTextarea = Omit<ComponentPropsWithRef<"textarea">, "onChange" | "value"> & {
  label: [string, LabelPosition]
  value: string
  onChange: (value: string, event?: ChangeEvent<HTMLTextAreaElement>) => void
  clearable?: boolean
}

const ButtonContent = () => {
  const { hovered } = _useButtonState()

  return (
    <Frame
      alignment-center
      corner-radius-full
      width-full
      height-full
      flow-horizontal
      fill-neutral-200={hovered}
      fill-neutral-100={!hovered}
    >
      <Icon fill-neutral-800={hovered} fill-neutral-400={!hovered}>
        close_small
      </Icon>
    </Frame>
  )
}

export default (p: InputTextarea) => {
  const { label, placeholder, value, onChange, className, style, clearable, ...rest } = p

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [focused, setFocused] = useState<boolean>(false)
  const [hovered, setHovered] = useState<boolean>(false)
  const [_value, _setValue] = useState<string>(value ?? "")

  useEffect(() => {
    _setValue(value ?? "")
  }, [value])

  const focusAndSelect = () => {
    textareaRef.current?.focus()
    textareaRef.current?.select()
  }

  const clear = () => {
    _setValue("")
    onChange?.("")
    focusAndSelect()
  }

  const onFocus = () => {
    setFocused(true)
  }

  const onBlur = () => {
    setFocused(false)
  }

  const onMouseEnter = () => {
    setHovered(true)
  }

  const onMouseLeave = () => {
    setHovered(false)
  }

  let labelOutside = null
  let labelInside = null

  if (label[1] === "outside") {
    labelOutside = (
      <Frame alignment-left width-fill flow-vertical padding-left-1>
        <Text
          typography-align-left
          fill-neutral-700
          typography-body-small-nowrap
          className="overflow-visible [text-overflow:none]"
        >
          <label htmlFor={rest.id} className="cursor-pointer">
            {label[0]}
          </label>
        </Text>
      </Frame>
    )
  }

  if (label[1] === "inside") {
    labelInside = (
      <Text
        typography-align-left
        fill-neutral-700
        typography-label-small-nowrap
        className="overflow-visible [text-overflow:none]"
      >
        <label htmlFor={rest.id} className="cursor-pointer">
          {label[0]}
        </label>
      </Text>
    )
  }

  return (
    <Frame alignment-left width-fill flow-vertical gap-1 className="frame__input-textarea select-none">
      {labelOutside}

      <Frame alignment-left width-fill height-28 flow-horizontal className="cursor-text">
        <div
          style={{ all: "inherit" }}
          onMouseDown={(e) => {
            if (e.target instanceof Element && e.target.closest("textarea, [role='button']") !== null) {
              return
            }

            focusAndSelect()
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <Frame
            alignment-left
            corner-radius-4
            width-fill
            height-fill
            fill-white
            gap-1
            flow-horizontal
            padding-left-3
            padding-right-2
            padding-top-3
            padding-bottom-2
            stroke-neutral-700={focused || hovered}
            stroke-neutral-400={!focused && !hovered}
          >
            <Frame alignment-top-left width-fill height-fill gap-1 padding-bottom-1 flow-vertical className="relative">
              {clearable && _value !== "" && !rest.disabled && (
                <_Button
                  id={`${rest.id}-clear`}
                  onClick={clear}
                  width-8
                  height-8
                  className="absolute right-1 top-0"
                  style={{ transform: "translate(25%, -25%)" }}
                >
                  <ButtonContent />
                </_Button>
              )}

              {labelInside}

              <Text
                typography-align-left
                fill-neutral-800={!rest.disabled}
                fill-neutral-400={rest.disabled}
                typography-body-small-wrap
                className="w-full h-full overflow-hidden"
              >
                <textarea
                  ref={textareaRef}
                  className={`
                  w-full
                  h-full
                  resize-none
                  appearance-none
                  [background:none]
                  [border:none]
                  [outline:none]
                  [border:none]
                  [box-shadow:none]
                  m-0 p-0
                  [color:inherit]
                  [font:inherit]
                  [letter-spacing:inherit]
                  [line-height:inherit]
                  [text-align:inherit]
                  [box-shadow:none]
                  placeholder:text-neutral-400
                  selection:bg-neutral-200
                  [&::-webkit-scrollbar]:w-[5px]
                  [&::-webkit-scrollbar-track]:rounded-full
                  [&::-webkit-scrollbar-track]:bg-white
                  [&::-webkit-scrollbar-thumb]:rounded-full
                  ${hovered || focused ? "[&::-webkit-scrollbar-thumb]:bg-neutral-300" : "[&::-webkit-scrollbar-thumb]:bg-neutral-200"}
                  ${rest.disabled === true ? "cursor-not-allowed" : "cursor-text"}
                  ${className}
                `}
                  style={{ boxShadow: "none", padding: 0, ...style, userSelect: "text", WebkitUserSelect: "text" }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  placeholder={placeholder}
                  value={_value}
                  onChange={(e) => {
                    _setValue(e.target.value)
                    onChange?.(e.target.value, e)
                  }}
                  {...rest}
                />
              </Text>
            </Frame>
          </Frame>
        </div>
      </Frame>
    </Frame>
  )
}
