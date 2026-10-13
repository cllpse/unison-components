import type { ColumnWidth } from "./types"

export const CELL_PADDING = 24
export const SIZE_BUFFER = 4

// The readability floor a column may be dragged down to, letting a resize shrink a column past its
// label so the header truncates with an ellipsis (see the `.frame__table__cell-content-label` rule) while
// still reserving room for the cell padding, a sliver of the label, and the sort indicator so a
// collapsed header never becomes unreadable. It is only ever applied as `min(MIN_COLUMN_WIDTH, …)`
// against a column's current/header-min width — a short-label column already narrower than this must
// never be snapped *wider* to it, which would grow the table (see `measureResizeLimits`).
export const MIN_COLUMN_WIDTH = 64

// Sub-pixel breathing room kept between the table (plus its trailing actions) and the viewport's
// right edge, so rounding never trips a horizontal page scrollbar.
const VIEWPORT_SAFETY = 2

type ColumnWidthInput = {
  key: string
  width: ColumnWidth
}

/**
 * Seam between *how we measure* and *what we decide* for column widths.
 * `domMeasurer` implements this against the real DOM; tests inject fixed values.
 */
export type Measurer = {
  available: () => number
  leading: () => number
  headerMin: (colId: string) => number
  /** Raw content width (px) of the widest cell label in a static column — no padding/buffer. */
  columnWidth: (colId: string) => number
}

const viewportWidth = (): number => {
  if (typeof document === "undefined") return Number.POSITIVE_INFINITY

  return document.documentElement.clientWidth
}

// Resolves the `--frame__table__unit-padding` CSS variable to pixels. The variable is authored via
// `theme("spacing.3")`, which the build resolves to a length token (e.g. `0.75rem`) that the browser
// keeps unresolved on custom properties, so `rem` values are converted against the root font-size.
const readUnitPadding = (tableEl: HTMLElement): number => {
  if (typeof document === "undefined") return 0

  const raw = getComputedStyle(tableEl).getPropertyValue("--frame__table__unit-padding").trim()

  if (!raw) return 0

  const value = Number.parseFloat(raw)

  if (!Number.isFinite(value)) return 0

  if (raw.endsWith("rem")) {
    const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16

    return value * rootFontSize
  }

  return value
}

// How far `renderRowTrailing` content extends past the table's right edge. The trailing cell is
// 0-width so the card outline stays on the content; slot content is positioned in the gutter and
// must be reserved when clamping so resize cannot push actions off-screen.
export const measureTrailingActions = (tableEl: HTMLElement): number => {
  const tableRight = tableEl.getBoundingClientRect().right

  let overhang = 0
  let hasActions = false

  for (const slot of Array.from(tableEl.querySelectorAll<HTMLElement>(".frame__table__cell--actions > *"))) {
    hasActions = true
    overhang = Math.max(overhang, slot.getBoundingClientRect().right - tableRight)
  }

  if (!hasActions) return 0

  return Math.max(0, overhang) + readUnitPadding(tableEl)
}

const intrinsicWidth = (label: HTMLElement | null | undefined): number => {
  if (!label) return 0

  const previous = label.style.width

  label.style.width = "max-content"
  const width = label.getBoundingClientRect().width
  label.style.width = previous

  return Math.ceil(width)
}

export const measureHeaderMinWidth = (tableEl: HTMLElement, colId: string): number => {
  const label = tableEl.querySelector<HTMLElement>(`thead th[data-col-id="${colId}"] .frame__table__cell-content-label`)

  return intrinsicWidth(label) + CELL_PADDING + SIZE_BUFFER
}

/** Pure drag floor: never above `startWidth` (auto-layout can size below `MIN_COLUMN_WIDTH`). */
export const resizeDragMin = (startWidth: number): number => Math.min(MIN_COLUMN_WIDTH, startWidth)

// The clamp range for a live drag. `min` is a small readability floor (not the header's intrinsic width)
// so a column can be dragged narrower than its label, which then truncates with an ellipsis. `max` lets the
// column — and therefore the table — grow past its immediate container (overflowing the wrapper, which
// stays `overflow: visible`) but not so far that the table's right edge, plus trailing actions, would
// cross the viewport's right edge.
//
// The floor is never allowed above `startWidth`: auto-layout (`applyColumnWidths` / `fitWidthsToViewport`)
// can size an unresized column to its header-min, which for a short label is below `MIN_COLUMN_WIDTH`.
// Flooring such a drag at the fixed minimum would snap the column *wider* on the first pointer move —
// even a shrink or no-op drag — pushing the table past the viewport when headroom is already zero.
export const measureResizeLimits = (
  tableEl: HTMLElement,
  startWidth: number,
  startTableWidth: number,
): { min: number; max: number } => {
  const min = resizeDragMin(startWidth)

  const tableLeft = tableEl.getBoundingClientRect().left
  const trailing = measureTrailingActions(tableEl)

  // Extra table width still available before the table + trailing actions reach the viewport edge.
  // The table grows rightward only (its left edge is fixed), so the whole budget goes to the dragged column.
  const headroom = viewportWidth() - tableLeft - startTableWidth - trailing - VIEWPORT_SAFETY
  const max = Math.max(min, startWidth + Math.max(0, headroom))

  return { min, max }
}

// Guards a set of widths (freshly computed or restored from storage) against overflowing the viewport:
// flexible (`collapse`) columns are shrunk proportionally — never below their header-min width — until
// the table plus its leading cell and trailing actions fits inside the viewport's right edge. If even
// the minimum widths overflow there is nothing more to give, so the widths are returned unchanged.
//
// `pinned` (optional) is the column the user just resized: its width still counts toward the overflow
// total but it is excluded from the shrink pool, so the overflow is absorbed by the *other* flexible
// columns and the just-set width sticks. Without this, re-fitting after a resize could shrink the very
// column the drag just sized (its siblings' intents may still be wider than what's on screen).
export const fitWidthsToViewport = (
  tableEl: HTMLElement,
  columns: ColumnWidthInput[],
  widths: Record<string, number>,
  pinned?: string,
): Record<string, number> => {
  const tableLeft = tableEl.getBoundingClientRect().left
  const trailing = measureTrailingActions(tableEl)

  const leadingTh = tableEl.querySelector<HTMLElement>("thead th:first-child")
  const leadingWidth = leadingTh ? leadingTh.offsetWidth : 0

  const budget = viewportWidth() - tableLeft - leadingWidth - trailing - VIEWPORT_SAFETY
  const total = columns.reduce((sum, col) => sum + (widths[col.key] ?? 0), 0)

  const overflow = total - budget
  if (!Number.isFinite(overflow) || overflow <= 0) return widths

  const slack: Record<string, number> = {}
  let totalSlack = 0

  for (const col of columns) {
    if (col.width !== "collapse") continue
    if (col.key === pinned) continue

    const available = Math.max(0, (widths[col.key] ?? 0) - measureHeaderMinWidth(tableEl, col.key))

    if (available > 0) {
      slack[col.key] = available
      totalSlack += available
    }
  }

  if (totalSlack <= 0) return widths

  const reduction = Math.min(overflow, totalSlack)
  const next = { ...widths }

  // Distribute the reduction with error-diffusing (cumulative) rounding rather than rounding each
  // column's share independently. If every per-column delta rounded on its own (`Math.round(share)`),
  // a share under 0.5px — common with a small overflow or many `collapse` columns splitting the pool —
  // would round to 0 for *every* column, so the total width would never actually drop and the table
  // would stay past the budget. Rounding the running cumulative reduction instead lets those sub-pixel
  // shares accumulate into whole-pixel cuts, guaranteeing the applied total matches `Math.round(reduction)`.
  let appliedReduction = 0
  let cumulativeShare = 0

  for (const [colId, available] of Object.entries(slack)) {
    cumulativeShare += reduction * (available / totalSlack)

    const targetApplied = Math.round(cumulativeShare)
    const delta = targetApplied - appliedReduction

    appliedReduction = targetApplied
    next[colId] = widths[colId] - delta
  }

  return next
}

/**
 * DOM-backed measurer for `computeWidths`. Owns the absolute-position available-width trick and
 * intrinsic label measurements; decisions stay in `computeWidths`.
 */
export const domMeasurer = (tableEl: HTMLElement, wrapperEl: HTMLElement): Measurer => {
  return {
    available: () => {
      const previousPosition = tableEl.style.position

      tableEl.style.position = "absolute"
      const available = wrapperEl.clientWidth
      tableEl.style.position = previousPosition

      return available
    },

    leading: () => {
      const leadingTh = tableEl.querySelector<HTMLElement>("thead th:first-child")

      return leadingTh ? leadingTh.offsetWidth : 0
    },

    headerMin: (colId) => measureHeaderMinWidth(tableEl, colId),

    columnWidth: (colId) => {
      const cells = tableEl.querySelectorAll<HTMLElement>(
        `td[data-column-id="${colId}"] .frame__table__cell-content-label`,
      )

      let content = 0

      for (const cell of Array.from(cells)) {
        content = Math.max(content, intrinsicWidth(cell))
      }

      return content
    },
  }
}

/**
 * Pure width decisions over a `Measurer`. Primary-flex soak, header-min floors, and static sizing —
 * no DOM writes.
 */
export const computeWidths = (
  measurer: Measurer,
  columns: ColumnWidthInput[],
  resized: Record<string, number>,
): Record<string, number> => {
  const available = measurer.available()
  const leadingWidth = measurer.leading()

  // The trailing row actions live in a gutter to the right of the table and are allowed to overflow,
  // so column sizing ignores them entirely — the columns fill the full available width.
  const headerMin: Record<string, number> = {}
  const staticWidth: Record<string, number> = {}
  let staticTotal = 0

  for (const col of columns) {
    const min = measurer.headerMin(col.key)

    headerMin[col.key] = min

    if (col.width === "static") {
      const maxStaticContent = Math.max(min, Math.floor((available - leadingWidth) * 0.4))
      const content = Math.min(measurer.columnWidth(col.key), maxStaticContent)
      const width = Math.max(min, content + CELL_PADDING + SIZE_BUFFER)

      staticWidth[col.key] = width
      staticTotal += width
    }
  }

  let resizedTotal = 0
  const flexible: string[] = []

  for (const col of columns) {
    if (col.width !== "collapse") continue

    if (resized[col.key] != null) {
      resizedTotal += Math.max(Math.min(MIN_COLUMN_WIDTH, headerMin[col.key]), resized[col.key])
    } else {
      flexible.push(col.key)
    }
  }

  const remaining = available - leadingWidth - staticTotal - resizedTotal

  // The first flexible (unresized collapse) column is the table's primary column: it soaks up all of
  // the free width while the remaining flexible columns fall back to their header-min width, so it
  // ends up the widest — effectively stealing space from the other dynamic columns.
  const primaryFlexible = flexible[0] ?? null
  const secondaryFlexibleMin = flexible.slice(1).reduce((sum, key) => sum + headerMin[key], 0)
  const primaryFlexibleWidth =
    primaryFlexible == null ? 0 : Math.max(headerMin[primaryFlexible], remaining - secondaryFlexibleMin)

  const widths: Record<string, number> = {}

  for (const col of columns) {
    let width: number

    if (col.width === "static") {
      width = staticWidth[col.key]
    } else if (resized[col.key] != null) {
      width = Math.max(Math.min(MIN_COLUMN_WIDTH, headerMin[col.key]), resized[col.key])
    } else if (col.key === primaryFlexible) {
      width = primaryFlexibleWidth
    } else {
      width = headerMin[col.key]
    }

    widths[col.key] = width
  }

  return widths
}

// Applies a previously saved set of widths without measuring anything: it just writes each column's
// CSS variable and the table total. Used on every render once widths have been persisted, so the
// table restores its last layout immediately instead of re-flexing from scratch.
//
// Only the current `columns` are summed into the table total (and given a CSS variable). The `widths`
// map can retain stale entries for columns that were removed since they were measured; counting those
// would inflate the table beyond the budget `fitWidthsToViewport` fit it to — which sums over these
// same `columns` — and push the trailing actions gutter back past the viewport edge.
export const applyWidths = (
  tableEl: HTMLElement,
  columns: ColumnWidthInput[],
  widths: Record<string, number>,
): void => {
  const leadingTh = tableEl.querySelector<HTMLElement>("thead th:first-child")
  const leadingWidth = leadingTh ? leadingTh.offsetWidth : 0

  let dataTotal = 0

  for (const col of columns) {
    const width = widths[col.key]

    if (width == null) continue

    dataTotal += width
    tableEl.style.setProperty(`--frame__table__col-${col.key}-width`, `${width}px`)
  }

  tableEl.style.width = `${leadingWidth + dataTotal}px`
}

/** Measure → compute → apply. Same behaviour as the former monolithic `applyColumnWidths`. */
export const applyColumnWidths = (
  tableEl: HTMLElement,
  wrapperEl: HTMLElement,
  columns: ColumnWidthInput[],
  resized: Record<string, number>,
): Record<string, number> => {
  const widths = computeWidths(domMeasurer(tableEl, wrapperEl), columns, resized)

  applyWidths(tableEl, columns, widths)

  return widths
}

// Live drag path. Writes only the one CSS variable that drives the dragged column plus the table's
// total width — no measuring, no React state — so a resize stays at one DOM write per frame. Because
// the table is `table-layout: fixed` and every other column keeps its cached width, the table total
// shifts by exactly this column's delta, captured once at drag start.
export const previewColumnWidth = (
  tableEl: HTMLElement,
  colId: string,
  width: number,
  startWidth: number,
  startTableWidth: number,
): void => {
  tableEl.style.setProperty(`--frame__table__col-${colId}-width`, `${width}px`)
  tableEl.style.width = `${startTableWidth + (width - startWidth)}px`
}
