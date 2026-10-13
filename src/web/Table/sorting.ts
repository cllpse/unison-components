import type { SortingState } from "@tanstack/react-table"
import type { TableSorting } from "./types"

export const toSortingState = (sorting: TableSorting): SortingState => [
  { id: sorting.key, desc: sorting.direction === "desc" },
]

export const fromSortingState = (sorting: SortingState): TableSorting | undefined => {
  const first = sorting[0]

  if (!first) return undefined

  return { key: first.id, direction: first.desc ? "desc" : "asc" }
}

/**
 * Table keeps a non-empty sort (`enableSortingRemoval: false`). If an updater
 * clears the array, fall back so UI state and `onSortingChange` stay aligned.
 */
export const coerceSortingState = (sorting: SortingState, fallback: SortingState): SortingState =>
  sorting[0] ? sorting : fallback
