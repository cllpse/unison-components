import { type ReactNode, useEffect, useRef, useState } from "react"
import type { View } from "react-native"
import { COLORS } from "../constants/colors"
import { UNITS } from "../constants/units"
import type {
  FigmaFill,
  FigmaFrameAlignment,
  FigmaFrameFlow,
  FigmaFrameGap,
  FigmaPadding,
  FigmaPaddingBottom,
  FigmaPaddingHorizontal,
  FigmaPaddingLeft,
  FigmaPaddingRight,
  FigmaPaddingTop,
  FigmaPaddingVertical,
} from "../types/FigmaProperties"
import { computeScrim } from "../utilities/computeScrim"
import { extractProperties } from "../utilities/extractProperties"
import { FrameComputeCornerRadius, FrameComputeFill } from "../utilities/FigmaPropertyHelpers"
import { useId } from "../utilities/useId"
import Frame, { type Frame as FrameType } from "./Frame.web"

type Base = {
  children: ReactNode
}

export type OverflowContainer = Base &
  FrameType &
  FigmaFrameFlow &
  FigmaFill &
  FigmaFrameAlignment &
  FigmaFrameGap &
  FigmaPadding &
  FigmaPaddingVertical &
  FigmaPaddingHorizontal &
  FigmaPaddingLeft &
  FigmaPaddingRight &
  FigmaPaddingTop &
  FigmaPaddingBottom

const computeScrollbarColors = (p: FigmaFill) => {
  const className = FrameComputeFill(p).className

  if (!className) return { thumbInactive: "", thumbActive: "" }

  if (className === "bg-white") {
    return { thumbInactive: COLORS.neutral[100], thumbActive: COLORS.neutral[200], track: "white" }
  }

  const split = className.split("-")
  const color = split[1]
  const shade = parseInt(split[2], 10)

  return {
    // @ts-expect-error TODO: @cllpse: implement standard functionality for color manipulation.
    track: COLORS[color][shade],
    // @ts-expect-error TODO: @cllpse: implement standard functionality for color manipulation.
    thumbInactive: COLORS[color][shade === 50 ? 200 : shade + 200],
    // @ts-expect-error TODO: @cllpse: implement standard functionality for color manipulation.
    thumbActive: COLORS[color][shade === 50 ? 300 : shade + 300],
  }
}

type ScrollPaddingProps = FigmaPadding & FigmaPaddingHorizontal & FigmaPaddingLeft & FigmaPaddingRight

const PADDING_SIDE_PREFIXES = [
  "padding-vertical-",
  "padding-horizontal-",
  "padding-left-",
  "padding-right-",
  "padding-top-",
  "padding-bottom-",
] as const

const paddingUnitFromKey = (key: string): keyof typeof UNITS | undefined => {
  for (const prefix of PADDING_SIDE_PREFIXES) {
    if (key.startsWith(prefix)) {
      const unit = key.slice(prefix.length)
      return unit in UNITS ? (unit as keyof typeof UNITS) : undefined
    }
  }

  if (key.startsWith("padding-")) {
    const unit = key.slice("padding-".length)
    return unit in UNITS ? (unit as keyof typeof UNITS) : undefined
  }

  return undefined
}

const isUniformPaddingKey = (key: string) => {
  if (!key.startsWith("padding-")) return false
  if (PADDING_SIDE_PREFIXES.some((prefix) => key.startsWith(prefix))) return false

  return key.slice("padding-".length) in UNITS
}

const computeScrollProperties = (p: ScrollPaddingProps) => {
  const { paddingLeft, paddingRight } = Object.keys(p)
    .map((key) => {
      const unit = paddingUnitFromKey(key)
      const n = unit === undefined ? 0 : UNITS[unit]

      if (isUniformPaddingKey(key) || key.startsWith(`padding-horizontal-`)) {
        return {
          paddingLeft: n,
          paddingRight: n,
        }
      }

      if (key.startsWith(`padding-left-`)) {
        return {
          paddingLeft: n,
          paddingRight: 0,
        }
      }

      if (key.startsWith(`padding-right-`)) {
        return {
          paddingLeft: 0,
          paddingRight: n,
        }
      }

      return {
        paddingLeft: 0,
        paddingRight: 0,
      }
    })
    .reduce(
      (acc, curr) => {
        return {
          paddingLeft: acc.paddingLeft + curr.paddingLeft,
          paddingRight: acc.paddingRight + curr.paddingRight,
        }
      },
      { paddingLeft: 0, paddingRight: 0 },
    )

  const width = UNITS[1] * 1.25
  const shouldUseOverlay = width * 2 > paddingRight

  return {
    width,
    shouldUseOverlay,
    paddingLeft: paddingLeft,
    paddingRight: shouldUseOverlay ? paddingRight : paddingRight / 2 - width / 2 - 1,
    marginRight: shouldUseOverlay ? 0 : paddingRight / 2 - width / 2 + 1,
  }
}

export default (p: OverflowContainer) => {
  const id = useId()

  const scrollRef = useRef<View | null>(null)
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(false)

  useEffect(() => {
    const el = scrollRef.current as unknown as HTMLElement | null

    if (!el) return

    let frame = 0
    let prevUp = false
    let prevDown = false

    const update = () => {
      frame = 0

      const { scrollTop, scrollHeight, clientHeight } = el

      const up = scrollTop > 1
      const down = scrollTop + clientHeight < scrollHeight - 1

      if (up !== prevUp) {
        prevUp = up
        setCanScrollUp(up)
      }
      if (down !== prevDown) {
        prevDown = down
        setCanScrollDown(down)
      }
    }

    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    update()

    el.addEventListener("scroll", schedule, { passive: true })

    const observer = new ResizeObserver(schedule)
    observer.observe(el)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      el.removeEventListener("scroll", schedule)
      observer.disconnect()
    }
  }, [])

  const { fromType, fromRest } = extractProperties<Base>()(p, ["children"])

  const { width, shouldUseOverlay, paddingLeft, paddingRight, marginRight } = computeScrollProperties(fromRest)
  const { thumbInactive, thumbActive, track } = computeScrollbarColors(fromRest)

  const cornerRadius = FrameComputeCornerRadius(fromRest).styles ?? {}
  const borderRadius = cornerRadius.borderRadius ?? 0
  const borderTopLeftRadius = cornerRadius.borderTopLeftRadius ?? borderRadius
  const borderTopRightRadius = cornerRadius.borderTopRightRadius ?? borderRadius
  const borderBottomRightRadius = cornerRadius.borderBottomRightRadius ?? borderRadius
  const borderBottomLeftRadius = cornerRadius.borderBottomLeftRadius ?? borderRadius

  const filtered = { ...fromRest }
  const verticalFromUniform: Array<keyof typeof UNITS> = []

  for (const key in filtered) {
    if (!shouldUseOverlay && isUniformPaddingKey(key)) {
      const unit = paddingUnitFromKey(key)
      if (unit !== undefined) verticalFromUniform.push(unit)
      delete filtered[key as keyof typeof filtered]
      continue
    }

    if (
      (!shouldUseOverlay &&
        (key.startsWith("padding-horizontal-") ||
          key.startsWith("padding-right-") ||
          key.startsWith("padding-left-"))) ||
      key.startsWith("fill-")
    ) {
      delete filtered[key as keyof typeof filtered]
    }
  }

  for (const unit of verticalFromUniform) {
    ;(filtered as Record<string, unknown>)[`padding-vertical-${unit}`] = true
  }

  const { className, ...rest } = filtered

  return (
    <>
      <style>
        {`
          .frame__overflow-wrapper-${id} {
            position: relative;
            display: flex;
            width: 100%;
            min-width: 0;
            height: 100%;
          }

          .frame__overflow-scrim-${id} {
            position: absolute;
            inset: 0;
            pointer-events: none;
            overflow: hidden;
            border-radius: ${borderTopLeftRadius}px ${borderTopRightRadius}px ${borderBottomRightRadius}px ${borderBottomLeftRadius}px;
            corner-shape: squircle;
            z-index: 1;
          }

          .frame__overflow-scrim-${id}::before,
          .frame__overflow-scrim-${id}::after {
            content: "";
            position: absolute;
            left: ${paddingLeft}px;
            right: ${marginRight + paddingRight + width}px;
            height: ${UNITS[8]}px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 120ms ease-out;
          }

          .frame__overflow-scrim-${id}::before {
            top: 0;
            background: ${computeScrim(track ?? "transparent", "to bottom")};
          }

          .frame__overflow-scrim-${id}::after {
            bottom: 0;
            background: ${computeScrim(track ?? "transparent", "to top")};
          }

          .frame__overflow-scrim-${id}[data-scrolled-top="true"]::before {
            opacity: 1;
          }

          .frame__overflow-scrim-${id}[data-scrolled-bottom="true"]::after {
            opacity: 1;
          }

          .frame__overflow-container-${id} {
            overflow: hidden;
            overflow-y: auto;
            scroll-behavior: smooth;
            overscroll-behavior: contain;
            scrollbar-gutter: stable;
            width: calc(100% - ${marginRight}px);
            padding-left: ${paddingLeft}px;
            padding-right: ${paddingRight}px;

            ${
              shouldUseOverlay
                ? `
                  scrollbar-color: ${thumbInactive} transparent;
                  scrollbar-width: thin;

                  &:hover {
                    scrollbar-color: ${thumbActive} transparent;
                  }
                `
                : `
                  &::-webkit-scrollbar {
                    width: ${width}px;
                  }

                  &::-webkit-scrollbar-track {
                    border-radius: ${width}px;
                    background-color: ${track};
                  }

                  &::-webkit-scrollbar-thumb {
                    background-color: ${thumbInactive};
                    border-radius: ${width}px;
                  }

                  &:hover {
                    &::-webkit-scrollbar-thumb {
                      background-color: ${thumbActive};
                    }
                  }
                `
            }
          }
        `}
      </style>

      <div className={`frame__overflow-wrapper-${id}`}>
        <Frame ref={scrollRef} className={`frame__overflow-container-${id} ${className}`} {...rest}>
          {fromType.children}
        </Frame>

        <div
          className={`frame__overflow-scrim-${id}`}
          data-scrolled-top={canScrollUp}
          data-scrolled-bottom={canScrollDown}
        />
      </div>
    </>
  )
}
