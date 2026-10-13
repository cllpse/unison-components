const SCRIM_STOPS: [position: number, alpha: number][] = [
  [0, 1],
  [19, 0.738],
  [34, 0.541],
  [47, 0.382],
  [56.5, 0.278],
  [65, 0.194],
  [73, 0.126],
  [80.2, 0.075],
  [86.1, 0.042],
  [91, 0.021],
  [95.2, 0.008],
  [98.2, 0.002],
  [100, 0],
]

type ScrimDirection = "to top" | "to bottom" | "to start" | "to end"

const PHYSICAL_DIRECTION: Record<ScrimDirection, string> = {
  "to top": "to top",
  "to bottom": "to bottom",
  "to start": "to left",
  "to end": "to right",
}

export const computeScrim = (color: string, direction: ScrimDirection) => {
  const stops = SCRIM_STOPS.map(
    ([position, alpha]) => `color-mix(in oklab, ${color} ${alpha * 100}%, transparent) ${position}%`,
  ).join(", ")

  return `linear-gradient(${PHYSICAL_DIRECTION[direction]}, ${stops})`
}
