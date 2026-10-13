import { type ComponentPropsWithRef, createContext, useContext, useState } from "react"
import type { FigmaFrameHeight, FigmaFrameWidth } from "../types/FigmaProperties"
import { extractProperties } from "../utilities/extractProperties"
import Frame from "./Frame.web"

type Base = ComponentPropsWithRef<"div"> & {
  disabled?: boolean
  loading?: boolean
  active?: boolean
  name?: string
}

export type _Button = Base & FigmaFrameWidth & FigmaFrameHeight

type ButtonState = {
  focused: boolean
  hovered: boolean
  disabled: boolean
  active: boolean
}

const ButtonContext = createContext<ButtonState>({
  focused: false,
  hovered: false,
  disabled: false,
  active: false,
})

export const _useButtonState = () => useContext(ButtonContext)

/**
 * @deprecated Internal component. Use with caution.
 * @remarks Use this component directly only if you know what you are doing. Otherwise, use ButtonPrimary or ButtonSecondary.
 * @see ButtonPrimary
 * @see ButtonSecondary
 */
export default (p: _Button) => {
  const { fromType, fromRest } = extractProperties<FigmaFrameWidth & FigmaFrameHeight>()(p, [
    "width-0",
    "width-1px",
    "width-05",
    "width-0p5",
    "width-1",
    "width-1p5",
    "width-2",
    "width-3",
    "width-4",
    "width-5",
    "width-6",
    "width-7",
    "width-8",
    "width-10",
    "width-11",
    "width-12",
    "width-14",
    "width-16",
    "width-20",
    "width-24",
    "width-28",
    "width-full",
    "width-fill",
    "width-hug",
    "height-0",
    "height-1px",
    "height-05",
    "height-0p5",
    "height-1",
    "height-1p5",
    "height-2",
    "height-3",
    "height-4",
    "height-5",
    "height-6",
    "height-7",
    "height-8",
    "height-10",
    "height-11",
    "height-12",
    "height-14",
    "height-16",
    "height-20",
    "height-24",
    "height-28",
    "height-full",
    "height-fill",
    "height-hug",
  ])

  const { children, className, disabled, loading, active, onClick, onKeyDown, tabIndex, role, ...rest } = fromRest

  const [focused, setFocused] = useState<boolean>(false)
  const [hovered, setHovered] = useState<boolean>(false)

  const isDisabled = disabled === true
  const isLoading = loading === true
  const isActive = active === true

  const onFocus = () => {
    if (isDisabled) return

    setFocused(true)
  }

  const onBlur = () => {
    if (isDisabled) return

    setFocused(false)
  }

  const onMouseEnter = () => {
    if (isDisabled) return

    setHovered(true)
  }

  const onMouseLeave = () => {
    if (isDisabled) return

    setHovered(false)
  }

  const handleClick: typeof onClick = (event) => {
    if (isDisabled || isLoading) return

    onClick?.(event)
  }

  const handleKeyDown: typeof onKeyDown = (event) => {
    // We're a `div role="button"`, not a native <button>, so the browser won't
    // map Enter/Space → activate — we have to. Only when this element is the
    // key event target (i.e. it has focus): React portals still bubble through
    // the React tree, so without that check a Space/Enter typed in portaled
    // content (e.g. a PopOver input) would click us.
    if (
      !isDisabled &&
      !isLoading &&
      onClick &&
      event.target === event.currentTarget &&
      (event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault()
      handleClick(event as unknown as Parameters<NonNullable<typeof onClick>>[0])
    }

    onKeyDown?.(event)
  }

  return (
    <Frame
      alignment-left
      flow-horizontal
      {...fromType}
      className={`frame__button select-none ${isDisabled ? "opacity-50" : ""} ${className}`}
    >
      <div
        {...rest}
        role={role ?? "button"}
        tabIndex={tabIndex ?? (isDisabled ? -1 : 0)}
        aria-disabled={isDisabled || undefined}
        aria-busy={isLoading || undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`
          ${isDisabled ? "cursor-not-allowed" : isLoading ? "cursor-wait" : "cursor-pointer"}
          appearance-none
          bg-transparent
          border-none
          outline-none
          shadow-none
          m-0
          p-0
          w-full
          h-full
          [display:inherit]
          [flex-grow:inherit]
          [flex-direction:inherit]
        `}
        onFocus={onFocus}
        onBlur={onBlur}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <ButtonContext.Provider value={{ focused, hovered, disabled: isDisabled, active: isActive }}>
          {children}
        </ButtonContext.Provider>
      </div>
    </Frame>
  )
}
