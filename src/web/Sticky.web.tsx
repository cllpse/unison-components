import { type ComponentProps, createContext, type ReactElement, useContext, useEffect, useRef, useState } from "react"
import { UNITS } from "../constants/units"
import type { ClassName, StyleWeb } from "../types/ElementProperties"
import type { FigmaFill, FigmaFrameAlignment, FigmaFrameHeight, FigmaFrameWidth } from "../types/FigmaProperties"
import { extractProperties } from "../utilities/extractProperties"
import Frame, { type Frame as FrameType } from "./Frame.web"

type Base = {
  enabled?: boolean
  scrim?: {
    vertical?: `${number}px`
    horizontal?: `${number}px` | "cover"
  }
  offset: keyof typeof UNITS
  children: ReactElement<FrameType>
  style?: StyleWeb
  className?: ClassName
}

export type Sticky = Base &
  Pick<FigmaFrameWidth, "width-fill" | "width-hug"> &
  Pick<FigmaFrameHeight, "height-fill" | "height-hug"> &
  FigmaFill &
  FigmaFrameAlignment

type StickyState = {
  sticky: boolean
}

const StickyContext = createContext<StickyState>({
  sticky: false,
})

export const useStickyState = () => useContext(StickyContext)

export default (p: Sticky) => {
  const { fromType, fromRest } = extractProperties<Base>()(p, [
    "enabled",
    "children",
    "scrim",
    "offset",
    "style",
    "className",
  ])

  const [sticky, setSticky] = useState<boolean>(false)

  const frameRef = useRef<HTMLDivElement>(null)

  const cover = fromType.scrim?.horizontal === "cover"
  const scrimVertical = fromType.scrim?.vertical ?? "0px"
  const scrimHorizontal = cover ? "0px" : (fromType.scrim?.horizontal ?? "0px")
  const scrimWidth = cover ? "100vw" : "100%"
  const offset = UNITS[fromType.offset]

  const id = `${cover}-${scrimVertical}-${scrimHorizontal}-${scrimWidth}-${offset}`

  useEffect(() => {
    const frame = frameRef.current

    if (fromType.enabled === false || !frame) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const stuck = entry.intersectionRatio < 1

        frame.toggleAttribute("data-stuck", stuck)

        setSticky(stuck)
      },
      { threshold: [1], rootMargin: `-${offset + 1}px 0px 0px 0px` },
    )

    observer.observe(frame)

    return () => observer.disconnect()
  }, [fromType.enabled, offset])

  return (
    <>
      <style>
        {`
        .frame__sticky-${id} {
          top: var(--sticky-offset, 0px);
          border-radius: inherit;
        }

        .frame__sticky-${id}[data-stuck] {
          z-index: 20;
        }

        .frame__sticky-${id}:before {
          position: absolute;
          z-index: -1;
          pointer-events: none;
          top: -999px;
          left: 50%;
          transform: translate(calc(-50% + var(--sticky-scrim-horizontal, 0px)${cover ? " + 40px" : ""}), calc(-50% + var(--sticky-scrim-vertical, 0px)));
          width: ${cover ? "calc(100% - 80px)" : "100%"};
          height: calc(100% + var(--sticky-offset, 0px) * 2);
          border-radius: inherit;
          background-color: white;
          box-shadow: 0 4px 40px 20px white;
        }

        .frame__sticky-${id}[data-stuck]:before {
          content: " ";
          top: calc(50% - var(--sticky-offset, 0px));
        }
      `}
      </style>

      <Frame
        {...fromRest}
        ref={frameRef as unknown as ComponentProps<typeof Frame>["ref"]}
        style={
          {
            ...fromType.style,
            "--sticky-scrim-vertical": scrimVertical,
            "--sticky-scrim-horizontal": scrimHorizontal,
            "--sticky-scrim-width": scrimWidth,
            "--sticky-offset": `${offset}px`,
          } as StyleWeb
        }
        className={`${fromType.className} frame__sticky frame__sticky-${id} ${fromType.enabled ? `sticky z-20` : ""}
      `}
      >
        <StickyContext.Provider value={{ sticky }}>{fromType.children}</StickyContext.Provider>
      </Frame>
    </>
  )
}
