import { type RefObject, useEffect, useLayoutEffect, useRef } from "react"
import { applyColumnWidths, applyWidths, fitWidthsToViewport } from "./resizer"
import type { Headers } from "./types"

type UseColumnLayoutArgs<T> = {
  tableRef: RefObject<HTMLTableElement | null>
  wrapperRef: RefObject<HTMLDivElement | null>
  widthsRef: RefObject<Record<string, number> | null>
  columns: Headers<T>[]
  data: T[]
  resized: Record<string, number>
  setResizeTick: (updater: (tick: number) => number) => void
}

/**
 * Width layout effects: initial measure/restore, resized merge, viewport clamp,
 * data-keyed re-clamp, ResizeObserver, and window resize.
 *
 * Persistence is consumer-owned. `widthsRef` may be pre-seeded with `initialColumnWidths`;
 * this hook never writes widths back to the consumer — resize commits do that via `onColumnWidthsChange`.
 */
export const useColumnLayout = <T>({
  tableRef,
  wrapperRef,
  widthsRef,
  columns,
  data,
  resized,
  setResizeTick,
}: UseColumnLayoutArgs<T>) => {
  // Restored `initialColumnWidths` pre-seed `widthsRef` before the first layout pass. Track whether
  // we've applied once so that seed still paints (the old storage path set `firstApply` on restore).
  const hasAppliedRef = useRef(false)

  useLayoutEffect(() => {
    const tableEl = tableRef.current
    const wrapperEl = wrapperRef.current

    if (!tableEl || !wrapperEl) return

    let shouldApply = false

    if (!widthsRef.current) {
      if (wrapperEl.clientWidth === 0) return

      // Compute and apply the initial layout. Do not notify the consumer: widths are only reported
      // once the user actively resizes a column.
      widthsRef.current = applyColumnWidths(tableEl, wrapperEl, columns, resized)
      shouldApply = true
    } else if (!hasAppliedRef.current) {
      shouldApply = true
    }

    const widths = { ...widthsRef.current }
    let resizedChanged = false

    for (const [colId, width] of Object.entries(resized)) {
      if (widths[colId] !== width) {
        widths[colId] = width
        resizedChanged = true
      }
    }

    if (resizedChanged) {
      widthsRef.current = widths
      shouldApply = true
    }

    // The column-width CSS variables persist on the table element across renders, so re-applying them
    // (which forces a synchronous reflow via offsetWidth) is only needed when widths actually change.
    // `widthsRef` keeps the user's intended widths; the DOM shows a viewport-clamped copy so restored
    // sizes from a wider viewport never push the table off-screen (and are restored if it widens again).
    if (shouldApply) {
      hasAppliedRef.current = true
      applyWidths(tableEl, columns, fitWidthsToViewport(tableEl, columns, widths))
    }
  })

  // Re-clamp the intended widths to whatever the current viewport allows. Reads the untouched intent
  // from `widthsRef`, so shrinking the viewport narrows columns and widening it restores them. When a
  // column was just resized its id is passed as `pinned` so the re-fit keeps that exact width and lets
  // the other flexible columns absorb any remaining overflow instead.
  const clampWidthsToViewport = (pinned?: string) => {
    const tableEl = tableRef.current

    if (!tableEl || !widthsRef.current) return

    applyWidths(tableEl, columns, fitWidthsToViewport(tableEl, columns, widthsRef.current, pinned))
  }

  const clampRef = useRef(clampWidthsToViewport)

  clampRef.current = clampWidthsToViewport

  // Re-fit once rows (and therefore the trailing actions gutter) appear or change. The actions gutter
  // is absent from an empty/"No results" body, so the initial fit runs with a zero-width gutter; and
  // the wrapper's ResizeObserver does not fire when the overflowing table grows, so neither the main
  // layout effect nor the observer would otherwise re-clamp. Keying on `data` covers that gap so the
  // table never stays too wide and pushes the row actions past the viewport.
  // biome-ignore lint/correctness/useExhaustiveDependencies: clamp reads live refs, `data` is the trigger.
  useLayoutEffect(() => {
    clampRef.current()
  }, [data])

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-once observer; reads live refs.
  useEffect(() => {
    const wrapperEl = wrapperRef.current

    if (!wrapperEl || typeof ResizeObserver === "undefined") return

    const observer = new ResizeObserver(() => {
      setResizeTick((tick) => tick + 1)
      clampRef.current()
    })

    observer.observe(wrapperEl)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const onResize = () => clampRef.current()

    window.addEventListener("resize", onResize)

    return () => window.removeEventListener("resize", onResize)
  }, [])

  return { clampRef }
}
