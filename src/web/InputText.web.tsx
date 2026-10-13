import {
  type ChangeEvent,
  type ComponentPropsWithRef,
  type MouseEvent,
  type ReactElement,
  useEffect,
  useRef,
  useState,
} from "react"
import type { Icon as IconType } from "../base/Icon.base"
import _Button, { _useButtonState } from "./_Button.web"
import Frame from "./Frame.web"
import Icon from "./Icon.web"
import Text from "./Text.web"

type LabelPosition = "inside" | "outside"

export type InputText = Omit<
  ComponentPropsWithRef<"input">,
  "onChange" | "value" | "id" | "name" | "onMouseEnter" | "onMouseLeave"
> & {
  id: string
  name: string
  value: string
  label: [string, LabelPosition]
  onMouseEnter?: (event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => void
  onMouseLeave?: (event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => void
  onChange: (value: string, event?: ChangeEvent<HTMLInputElement>) => void
  clearable?: boolean
  selectOnFocus?: boolean
  /**
   * @deprecated Internal property. Use with caution.
   * @remarks Use this component only if you know what you are doing.
   */
  _icon?: ReactElement<IconType>
} & (
    | {
        label?: [string, LabelPosition]
        /**
         * @deprecated Internal property. Use with caution.
         * @remarks Use this property only if you know what you are doing.
         */
        searchHack: boolean
      }
    | {
        label?: [string, LabelPosition]
        /**
         * @deprecated Internal property. Use with caution.
         * @remarks Use this property only if you know what you are doing.
         */
        searchHack?: never
      }
  )

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

export default (p: InputText) => {
  const {
    label,
    searchHack,
    placeholder,
    value,
    onChange,
    onFocus,
    onBlur,
    className,
    autoFocus,
    selectOnFocus,
    clearable,
    style,
    ...rest
  } = p

  const inputRef = useRef<HTMLInputElement>(null)

  const [focused, setFocused] = useState<boolean>(false)
  const [hovered, setHovered] = useState<boolean>(false)
  const [_value, _setValue] = useState<string>(value ?? "")

  useEffect(() => {
    _setValue(value ?? "")
  }, [value])

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [autoFocus])

  const focusAndSelect = () => {
    inputRef.current?.focus()

    if (selectOnFocus) {
      inputRef.current?.select()
    }
  }

  const clear = () => {
    _setValue("")
    focusAndSelect()
    onChange?.("")
  }

  let labelOutside = null
  let labelInside = null

  if (label?.[1] === "outside") {
    labelOutside = (
      <Frame alignment-left width-fill flow-vertical padding-left-2>
        <Text
          typography-align-left
          fill-neutral-700
          typography-body-small-nowrap
          style={{ overflow: "visible", textOverflow: "none" }}
        >
          <label htmlFor={rest.id} className="cursor-pointer">
            {label[0]}
          </label>
        </Text>
      </Frame>
    )
  }

  if (label?.[1] === "inside") {
    labelInside = (
      <Text
        typography-align-left
        fill-neutral-700
        typography-label-small-nowrap
        style={{ overflow: "visible", textOverflow: "none" }}
      >
        <label htmlFor={rest.id} className="cursor-pointer">
          {label[0]}
        </label>
      </Text>
    )
  }

  return (
    <Frame alignment-left width-fill flow-vertical gap-1 className="frame__input-text select-none">
      {labelOutside}

      <Frame
        alignment-left
        width-fill
        height-10={searchHack === undefined}
        height-12={searchHack !== undefined}
        flow-horizontal
        className="cursor-text"
      >
        <div
          style={{ all: "inherit" }}
          onMouseDown={(e) => {
            if (e.target instanceof Element && e.target.closest("input, [role='button']") !== null) {
              return
            }

            focusAndSelect()
          }}
          onMouseEnter={(e) => {
            setHovered(true)
            rest.onMouseEnter?.(e)
          }}
          onMouseLeave={(e) => {
            setHovered(false)
            rest.onMouseLeave?.(e)
          }}
        >
          <Frame
            alignment-left
            corner-radius-full
            width-fill
            height-fill
            fill-white
            gap-1
            flow-horizontal
            padding-left-3
            padding-right-1={clearable}
            padding-right-3={!clearable}
            stroke-neutral-400={!focused && !hovered && !searchHack}
            stroke-neutral-700={(focused && !searchHack) || (hovered && !searchHack)}
          >
            <Frame alignment-left width-fill height-fill gap-2 flow-horizontal>
              {p._icon && p._icon}

              {labelInside}

              <Frame alignment-left width-fill height-hug flow-horizontal>
                <Text
                  typography-align-left
                  fill-neutral-800={!rest.disabled}
                  fill-neutral-400={rest.disabled}
                  typography-body-small-nowrap
                  className="w-full"
                >
                  <input
                    ref={inputRef}
                    style={{ ...style, userSelect: "text", WebkitUserSelect: "text" }}
                    className={`
                    w-full
                    appearance-none
                    [background:none]
                    [border:none]
                    [outline:none]
                    [box-shadow:none]
                    m-0 p-0
                    [color:inherit]
                    [font:inherit]
                    [letter-spacing:inherit]
                    [line-height:inherit]
                    [text-align:inherit]
                    placeholder:text-neutral-400
                    selection:bg-neutral-200
                    ${rest.disabled === true ? "cursor-not-allowed" : "cursor-text"}
                    ${className}
                  `}
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    onFocus={(e) => {
                      setFocused(true)
                      if (selectOnFocus) {
                        e.currentTarget.select()
                      }
                      onFocus?.(e)
                    }}
                    onBlur={(e) => {
                      setFocused(false)
                      onBlur?.(e)
                    }}
                    type="text"
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

              {clearable && (
                <_Button
                  id={`${rest.id}-clear`}
                  onClick={clear}
                  disabled={rest.disabled}
                  tabIndex={_value.length > 0 && !rest.disabled ? 0 : -1}
                  width-8={searchHack === undefined}
                  height-8={searchHack === undefined}
                  width-10={searchHack !== undefined}
                  height-10={searchHack !== undefined}
                  className={`${_value.length > 0 && !rest.disabled ? "opacity-100" : "opacity-0"} transition-opacity duration-150 ease-out`}
                >
                  <ButtonContent />
                </_Button>
              )}
            </Frame>
          </Frame>
        </div>
      </Frame>
    </Frame>
  )
}
