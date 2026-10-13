import FrameBase, { type Frame as FrameType } from "../base/Frame.base"
import type { COLORS } from "../constants/colors"
import { UNITS } from "../constants/units"
import type { StyleNative, StyleWeb } from "../types/ElementProperties"
import { FrameComputeCornerRadius } from "../utilities/FigmaPropertyHelpers"

export type Frame = Omit<FrameType, "style"> & {
  style?: StyleWeb
}

type LoadingProps = {
  options?: FrameType["loading"]
  cornerRadius?: StyleWeb
  cornerShape?: StyleWeb["cornerShape"]
}

/** 0.6s spring to 360°, 0.5s rest. Ease: `1 - cos(t·π/2)³ · cos(t·1.1π)`. */
const loadingSpinStyle = `
  @keyframes frame-frame-loader-spin {
    0% { transform: rotate(0deg); }
    2.27% { transform: rotate(6.01deg); }
    4.55% { transform: rotate(23.61deg); }
    6.82% { transform: rotate(51.55deg); }
    9.09% { transform: rotate(87.9deg); }
    11.36% { transform: rotate(130.18deg); }
    13.64% { transform: rotate(175.63deg); }
    15.91% { transform: rotate(221.41deg); }
    18.18% { transform: rotate(264.89deg); }
    20.45% { transform: rotate(303.83deg); }
    22.73% { transform: rotate(336.54deg); }
    25% { transform: rotate(362deg); }
    27.27% { transform: rotate(379.91deg); }
    29.55% { transform: rotate(390.6deg); }
    31.82% { transform: rotate(394.96deg); }
    34.09% { transform: rotate(394.3deg); }
    36.36% { transform: rotate(390.11deg); }
    38.64% { transform: rotate(383.95deg); }
    40.91% { transform: rotate(377.2deg); }
    43.18% { transform: rotate(370.99deg); }
    45.45% { transform: rotate(366.03deg); }
    47.73% { transform: rotate(362.65deg); }
    50% { transform: rotate(360.8deg); }
    52.27% { transform: rotate(360.1deg); }
    54.55%, 100% { transform: rotate(360deg); }
  }
  .frame__frame-loader-icon { animation: frame-frame-loader-spin 1.1s linear infinite; }
`

const Loading = ({ cornerRadius, cornerShape, options: p }: LoadingProps) => {
  const split = p?.[1]?.split("-")
  const color = (split?.[1] ?? "transparent") as keyof typeof COLORS
  const shade = parseInt(split?.[2] ?? "0", 10)
  const named = color !== "transparent" && color !== "white"
  const colorForeground = named ? `fill-${color}-700` : "fill-black"
  const colorBackground = named ? `bg-${color}-${shade}` : "bg-white"
  const blur = p?.[2] === "blur-on"
  const smallMaxHeight = UNITS[10]

  return (
    <div
      className="z-50 absolute inset-0 flex items-center justify-center [container-type:size] cursor-wait"
      style={{ ...cornerRadius, cornerShape, overflow: "hidden" } as StyleWeb}
    >
      <style>{loadingSpinStyle}</style>
      {blur ? <div className="absolute inset-0" style={{ backdropFilter: `blur(${UNITS[10]}px)` }} /> : null}
      <div className={`absolute inset-0 bg-solid ${colorBackground} opacity-75`} />
      <div className="opacity-75 frame__frame-loader-icon">
        <svg
          className={`${colorForeground} w-7 h-7 [@container_(max-height:${smallMaxHeight}px)]:hidden`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 42 26"
          fill="inherit"
        >
          <path
            fill="inherit"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M39 0a3 3 0 0 1 3 3v20a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3zM12 8a5 5 0 1 0 0 10 5 5 0 0 0 0-10m18 0a5 5 0 1 0 0 10 5 5 0 0 0 0-10"
          />
        </svg>

        <svg
          className={`${colorForeground} hidden w-6 h-6 [@container_(max-height:${smallMaxHeight}px)]:block`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          fill="inherit"
        >
          <path
            fill="inherit"
            d="M325-111.5q-73-31.5-127.5-86t-86-127.5Q80-398 80-480.5t31.5-155q31.5-72.5 86-127t127.5-86Q398-880 480-880q17 0 28.5 11.5T520-840q0 17-11.5 28.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-17 11.5-28.5T840-520q17 0 28.5 11.5T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480.5-80Q398-80 325-111.5Z"
          />
        </svg>
      </div>
    </div>
  )
}

export default (p: Frame) => {
  const { children, style, className, loading, ...rest } = p
  // const cornerShape = p["corner-radius-full"] || p["corner-radius-huge"] ? "round" : "squircle"
  const cornerShape = "round"

  return (
    <FrameBase
      className={`frame__frame transition-[outline-color,background-color] duration-[120ms] ease-out ${className ?? ""}`}
      style={
        {
          ...style,
          cornerShape,
        } as StyleWeb & StyleNative
      }
      elementLoader={
        loading?.[0] === true ? (
          <Loading options={loading} cornerRadius={FrameComputeCornerRadius(p).styles} cornerShape={cornerShape} />
        ) : undefined
      }
      {...rest}
    >
      {children}
    </FrameBase>
  )
}
