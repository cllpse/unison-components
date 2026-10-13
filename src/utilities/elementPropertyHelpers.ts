import type { ElementPropertiesReturn, PointerEventsWeb } from "../types/elementProperties"

export const computeElementPointerEvents = (p: PointerEventsWeb): ElementPropertiesReturn => {
  if (p["pointer-events-none"]) return { styles: { pointerEvents: "none" }, className: "pointer-events-none" }
  if (p["pointer-events-auto"]) return { styles: { pointerEvents: "auto" }, className: "pointer-events-auto" }

  return { styles: {}, className: "" }
}
