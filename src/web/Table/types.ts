import type { ExpandedState, Row, RowData } from "@tanstack/react-table"
import type { ReactNode, RefObject } from "react"
import type { LoadingOptions } from "../../base/Frame.base"
import type { TooltipShow } from "../Tooltip.web"
import type { formatters } from "./formatters"

declare module "@tanstack/react-table" {
  // biome-ignore lint/correctness/noUnusedVariables: ...
  interface ColumnMeta<TData extends RowData, TValue> {
    _collapse?: boolean
    _formatter?: Formatter<TData>
    _monospace?: boolean
    _editable?: Editable
    _editor?: Editor<TData>
    _showTooltip?: TooltipShow
    _tooltipText?: string | ((value: unknown) => string)
    _skipSubrows?: boolean
  }
}

export type Format = keyof typeof formatters
export type Formatter<T extends RowData> = (value: unknown, isSubrow: boolean, row: Row<T>) => string | ReactNode
export type Editable = false | "built-in" | "custom"
export type Editor<T> = (row: Row<T>) => ReactNode | null

export type ColumnWidth = "collapse" | "static"

/** Declared / restored sort — consumer-facing shape (not TanStack's `{ id, desc }`). */
export type TableSorting = {
  key: string
  direction: "asc" | "desc"
}

export type Headers<T> = {
  label: string
  width: ColumnWidth
  key: string
} & (
  | {
      format: Format
      tooltipShow: TooltipShow
      tooltipText?: never
      sortValue?: never
    }
  | {
      format: "custom"
      formatter: Formatter<T>
      sortValue?: (value: unknown) => number | string
      monospace: boolean
      tooltipShow: "on-hover" | "when-content-truncated"
      tooltipText: string | ((value: unknown) => string)
    }
  | {
      format: "custom"
      formatter: Formatter<T>
      sortValue?: (value: unknown) => number | string
      monospace: boolean
      tooltipShow: "never"
      tooltipText?: never
    }
) &
  (
    | {
        editable?: never
        editableSkipSubrows?: never
      }
    | {
        editable: "built-in"
        editableSkipSubrows: boolean
      }
    | {
        editable: "custom"
        editor: Editor<T>
        editableSkipSubrows: boolean
      }
  )

export type Table<T> = {
  columns: Headers<T>[]
  data: T[]
  filter?: string
  loading?: LoadingOptions
  /** Declared default sort and `resetSorting()` target. */
  sortingKey: keyof T
  sortingDirection: "asc" | "desc"
  dataExpanded?: ExpandedState

  // Composition slot for trailing row content (all depths — consumer decides who gets UI).
  // The trailing cell is 0-width so the table outline stays on the content card; slot content is
  // positioned in the gutter to the right. Hover-reveal is consumer-owned.
  renderRowTrailing?: (row: Row<T>) => ReactNode

  // Replaces the hardcoded "No results" empty body. Falls back to that text when undefined.
  emptyState?: ReactNode

  // Replaces the hardcoded `.subRows` data shape. Defaults to reading `row.subRows` when omitted.
  getSubRows?: (row: T) => T[] | undefined

  /**
   * Stable entity id for a row.
   * Must be unique among siblings that share a parent. Sub-row ids are composed with the
   * parent's id, so the same entity may legitimately appear under different parents.
   */
  getRowId: (row: T) => string

  // Persistence inversion: library never touches localStorage. Consumer seeds restored values
  // and owns writes via these callbacks. Callbacks fire only on real user action (sort change,
  // resize commit, resize reset) — never on mount.
  /** Mount-only sort seed (restored persistence). When set, overrides sortingKey/Direction for initial state only. */
  initialSorting?: TableSorting
  /** Mount-only column-width seed (restored persistence). */
  initialColumnWidths?: Record<string, number>
  /** User sort change / reset only — never mount. Always a defined sort matching table state (never cleared). */
  onSortingChange?: (sorting: TableSorting) => void
  onColumnWidthsChange?: (widths: Record<string, number>) => void

  onEdit?: (row: Row<T>, columnId: string, value: unknown) => void | Promise<void>
} & (
  | {
      onSelect: never
      selectSubrows: never
    }
  | {
      onSelect: (rows: Row<T>[]) => void
      selectSubrows: boolean
    }
)

export type TableActions<T> = {
  resetSorting: () => void
  clearSelection: () => void
  resetExpanded: () => void
  getSelectedRows: () => Row<T>[]
  getData: () => Row<T>[]
}

export type TableInternal<T> = Table<T> & {
  _actionsRef?: RefObject<TableActions<T>>
}
