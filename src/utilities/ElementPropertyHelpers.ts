import type { ElementPropertiesReturn, PointerEventsWeb } from "../types/ElementProperties"

export const ElementComputePointerEvents = (p: PointerEventsWeb): ElementPropertiesReturn => {
  if (p["pointer-events-none"]) return { styles: { pointerEvents: "none" }, className: "pointer-events-none" }
  if (p["pointer-events-auto"]) return { styles: { pointerEvents: "auto" }, className: "pointer-events-auto" }

  return { styles: {}, className: "" }
}
