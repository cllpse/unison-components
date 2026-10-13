import type { ComponentPropsWithRef } from "react"
import { useEffect, useState } from "react"
import { COLORS } from "../constants/colors"
import { UNITS } from "../constants/units"
import type { FigmaFrameWidth } from "../types/FigmaProperties"
import { extractProperties } from "../utilities/extractProperties"
import Frame from "./Frame.web"

type Base = Omit<ComponentPropsWithRef<"input">, "min" | "max" | "step" | "value" | "onChange"> & {
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  onChangeDraft?: (value: number) => void
}

export type InputRangeSlider = Base & FigmaFrameWidth

export default (p: InputRangeSlider) => {
  const { fromType, fromRest } = extractProperties<FigmaFrameWidth>()(p, [
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
  ])

  const style = `
    .frame__input-range-slider input[type=range] {
      -webkit-appearance: none;
      width: 100%;
      padding: 0;
      margin: 0;
      height: ${UNITS[8]}px;
    }

    .frame__input-range-slider input[type=range]:focus {
      outline: none;
    }

    .frame__input-range-slider input[type=range]::-webkit-slider-runnable-track {
      width: inherit;
      height: ${UNITS[2]}px;
      cursor: pointer;
      background: ${COLORS.neutral[100]};
      border-radius: ${UNITS.full}px;
    }

    .frame__input-range-slider input[type=range]::-webkit-slider-thumb {
      width: ${UNITS[5]}px;
      height: ${UNITS[5]}px;
      margin-top: ${-1 - UNITS[5] / 2}px;
      background: ${COLORS.neutral[700]};
      cursor: pointer;
      -webkit-appearance: none;
      box-shadow: none;
    }

    .frame__input-range-slider input[type=range]:hover::-webkit-slider-runnable-track {
      background: ${COLORS.neutral[200]};
    }

    .frame__input-range-slider input[type=range]::-webkit-slider-thumb:hover {
      background: ${COLORS.neutral[800]};
    }

    .frame__input-range-slider input[type=range]::-moz-range-track {
    }

    .frame__input-range-slider input[type=range]::-moz-range-thumb {
    }

    .frame__input-range-slider input[type=range]::-ms-track {
    }

    .frame__input-range-slider input[type=range]::-ms-fill-lower {
    }

    .frame__input-range-slider input[type=range]::-ms-fill-upper {
    }

    .frame__input-range-slider input[type=range]::-ms-thumb {
    }
  `

  const { min, max, step, value, onChange, onChangeDraft, ...rest } = fromRest

  const [draftValue, setDraftValue] = useState(value)

  useEffect(() => {
    setDraftValue(value)
  }, [value])

  const commit = (next: number) => {
    if (next !== value) onChange?.(next)
  }

  return (
    <>
      <style>{style}</style>

      <Frame
        alignment-left
        flow-horizontal
        {...fromType}
        height-10
        className={`frame__input-range-slider select-none `}
      >
        <input
          {...rest}
          type="range"
          min={min}
          max={max}
          step={step}
          value={draftValue}
          onChange={(e) => {
            setDraftValue(e.target.valueAsNumber)
            onChangeDraft?.(e.target.valueAsNumber)
          }}
          onMouseUp={(e) => commit(e.currentTarget.valueAsNumber)}
          onTouchEnd={(e) => commit(e.currentTarget.valueAsNumber)}
          onKeyUp={(e) => commit(e.currentTarget.valueAsNumber)}
        />
      </Frame>
    </>
  )
}
