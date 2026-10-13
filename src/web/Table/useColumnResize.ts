import type { MutableRefObject, PointerEvent as ReactPointerEvent, RefObject } from "react"
import { applyColumnWidths, measureResizeLimits, previewColumnWidth } from "./resizer"
import type { Headers } from "./types"

type UseColumnResizeArgs<T> = {
  tableRef: RefObject<HTMLTableElement | null>
  wrapperRef: RefObject<HTMLDivElement | null>
  widthsRef: MutableRefObject<Record<string, number> | null>
  columns: Headers<T>[]
  resized: Record<string, number>
  onColumnWidthsChange?: (widths: Record<string, number>) => void
  setResized: (updater: (prev: Record<string, number>) => Record<string, number>) => void
  setResizingCol: (colId: string | null) => void
  clampRef: MutableRefObject<(pinned?: string) => void>
}

/**
 * Pointer-drag column resize gesture: document-level listeners, body style mutation, commit/reset.
 *
 * Width persistence is consumer-owned. Commits (drag end and reset) notify via
 * `onColumnWidthsChange` — never on mount, never on a no-op click.
 */
export const useColumnResize = <T>({
  tableRef,
  wrapperRef,
  widthsRef,
  columns,
  resized,
  onColumnWidthsChange,
  setResized,
  setResizingCol,
  clampRef,
}: UseColumnResizeArgs<T>) => {
  const startResize = (colId: string) => (event: ReactPointerEvent) => {
    const tableEl = tableRef.current
    const wrapperEl = wrapperRef.current

    if (!tableEl || !wrapperEl) return

    event.preventDefault()
    event.stopPropagation()

    const th = tableEl.querySelector<HTMLElement>(`thead th[data-col-id="${colId}"]`)
    const startWidth = th ? th.offsetWidth : 0
    const startTableWidth = tableEl.offsetWidth
    const startX = event.clientX
    const { min, max } = measureResizeLimits(tableEl, startWidth, startTableWidth)

    setResizingCol(colId)

    // Suppress text selection and force the resize cursor for the whole drag. Without this the
    // browser runs selection hit-testing/range updates on every pointer move as it sweeps across the
    // page's selectable text, which is a major source of the "sluggish" drag feel.
    const prevUserSelect = document.body.style.userSelect
    const prevCursor = document.body.style.cursor

    document.body.style.userSelect = "none"
    document.body.style.cursor = "col-resize"

    let frame = 0
    let latestWidth = startWidth

    const flush = () => {
      frame = 0
      previewColumnWidth(tableEl, colId, latestWidth, startWidth, startTableWidth)
    }

    const onMove = (moveEvent: PointerEvent) => {
      latestWidth = Math.min(max, Math.max(min, startWidth + (moveEvent.clientX - startX)))
      if (!frame) frame = requestAnimationFrame(flush)
    }

    // Runs on both `pointerup` and `pointercancel` (browser interruption, lost capture, etc.) so the
    // body styles and listeners are always torn down, even when the gesture never ends with a normal
    // `pointerup`.
    const onUp = () => {
      if (frame) cancelAnimationFrame(frame)
      setResizingCol(null)

      document.body.style.userSelect = prevUserSelect
      document.body.style.cursor = prevCursor

      // Only commit when the drag actually moved the handle. `latestWidth` starts at the live DOM
      // width and is reassigned solely by `onMove`, so a no-op click leaves it equal to `startWidth`.
      // That DOM width is the viewport-clamped copy from `fitWidthsToViewport`, not the intent held in
      // `widthsRef`; notifying the consumer on a no-op would overwrite the user's wider intended width
      // and stop a later viewport widen from restoring it.
      if (latestWidth !== startWidth) {
        widthsRef.current = { ...(widthsRef.current ?? {}), [colId]: latestWidth }
        onColumnWidthsChange?.(widthsRef.current)
        setResized((prev) => ({ ...prev, [colId]: latestWidth }))

        // Re-fit against the freshly updated intent. Shrinking this column frees budget, and other
        // columns may currently be clamped below their intended widths; `fitWidthsToViewport` (via
        // `clampRef`) redistributes that freed space now. The layout effect can't: it diffs `resized`
        // against `widthsRef`, which we just made equal, so it sees no change and skips the re-fit.
        // Pin `colId` so the re-fit preserves the width the user just set and shrinks the *other*
        // flexible columns (whose intents may still be wider than what's on screen) to make room.
        clampRef.current(colId)
      } else {
        // No committed change, but an earlier flushed `onMove` preview may have painted an
        // intermediate width straight to the DOM (inline col var + table width) before the pointer
        // returned to `startWidth`. The final `startWidth` flush was cancelled above, and with
        // `resized`/`widthsRef` unchanged the layout effect diff skips its re-fit — so without this
        // the column would stay stuck at that stale preview. Re-apply the intended widths to snap it
        // back to where it started.
        clampRef.current()
      }

      document.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerup", onUp)
      document.removeEventListener("pointercancel", onUp)
    }

    document.addEventListener("pointermove", onMove)
    document.addEventListener("pointerup", onUp)
    document.addEventListener("pointercancel", onUp)
  }

  const resetResize = (colId: string) => () => {
    // After a reload, saved widths live in `widthsRef` while `resized` is still empty (restore only
    // seeds the ref). If we rebuilt from that empty map we'd re-flex every column. Prefer the
    // session overrides when present; otherwise retain the restored layout.
    const base = Object.keys(resized).length > 0 ? resized : (widthsRef.current ?? {})
    const next = { ...base }

    delete next[colId]
    setResized(() => next)

    // Side effects stay outside the state updater — React may re-run updaters; consumer callbacks
    // and DOM measure/clamp are not safe to duplicate.
    const tableEl = tableRef.current
    const wrapperEl = wrapperRef.current

    if (tableEl && wrapperEl) {
      widthsRef.current = applyColumnWidths(tableEl, wrapperEl, columns, next)
      onColumnWidthsChange?.(widthsRef.current)

      // `applyColumnWidths` sizes to the wrapper and ignores the trailing actions gutter, so the
      // freshly rebuilt widths can push the row actions past the viewport edge. Re-fit against the
      // viewport now (the layout effect won't: it diffs `resized` against `widthsRef`, which
      // `applyColumnWidths` just made consistent, so it sees no change and skips the re-fit).
      clampRef.current()
    }
  }

  return { startResize, resetResize }
}
