import { useEffect, useRef, useState } from "react"
import type { View } from "react-native"
import Frame from "../native/Frame.native"

export type ProgressBar = {
  progress: `${number}%`
}

export default (p: ProgressBar) => {
  const ref = useRef<View | null>(null)

  const [progressAsWidth, setProgressAsWidth] = useState(0)
  const [progressAsNumber, setProgressAsNumber] = useState(0)

  useEffect(() => {
    const n = parseInt(p.progress, 10)

    setProgressAsNumber(n)

    ref.current?.measure((_, __, w) => {
      setProgressAsWidth(Math.floor((w * n) / 100))
    })
  }, [p.progress])

  return (
    <Frame
      ref={ref}
      flow-horizontal
      width-fill
      height-hug
      alignment-left
      fill-positive-100={progressAsNumber <= 50}
      fill-tentative-100={progressAsNumber > 50 && progressAsNumber < 75}
      fill-negative-100={progressAsNumber > 75}
      corner-radius-full
      stroke-primary-700
    >
      <Frame
        flow-horizontal
        width-hug
        height-4
        alignment-left
        fill-positive-700={progressAsNumber <= 50}
        fill-tentative-700={progressAsNumber > 50 && progressAsNumber < 75}
        fill-negative-700={progressAsNumber > 75}
        corner-radius-full
        corner-radius-top-right-0
        corner-radius-bottom-right-0
        _STYLE={{ width: progressAsWidth }}
      />
    </Frame>
  )
}
