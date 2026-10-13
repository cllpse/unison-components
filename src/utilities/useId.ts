import { useId as useReactId } from "react"

export const useId = () => useReactId().replace(/[^a-zA-Z0-9_-]/g, "")
