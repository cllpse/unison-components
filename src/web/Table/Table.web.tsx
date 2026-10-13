// @ts-expect-error: side-effect CSS import resolved by the consuming bundler
import "./styles.css"
import {
  type ExpandedState,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type OnChangeFn,
  type Row,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { useEffect, useRef, useState } from "react"
import Frame from "../Frame.web"
import { formatters } from "./formatters"
import { applyHighlight } from "./highlighter"
import { clearPendingEdit, type PendingEdits, setPendingEdit } from "./pendingEdits"
import { composeRowId } from "./rowId"
import { coerceSortingState, fromSortingState, toSortingState } from "./sorting"
import Tbody from "./tbody"
import Thead from "./thead"
import type { Formatter, TableActions, TableInternal } from "./types"
import { useColumnLayout } from "./useColumnLayout"
import { useColumnResize } from "./useColumnResize"

type EditingCell = { rowId: string; columnId: string } | null

const Table = <T,>(p: TableInternal<T>) => {
  const [pendingEdits, setPendingEdits] = useState<PendingEdits>(() => new Map())
  const [editingCell, setEditingCell] = useState<EditingCell>(null)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [expanded, setExpanded] = useState<ExpandedState>(p.dataExpanded ?? {})

  // Drop optimistic overlays when consumer data identity changes — during render, not in an
  // effect, so we never paint a stale pending value over fresh `p.data` for a frame.
  const dataRef = useRef(p.data)
  if (dataRef.current !== p.data) {
    dataRef.current = p.data
    if (pendingEdits.size > 0) setPendingEdits(new Map())
  }

  const [resized, setResized] = useState<Record<string, number>>({})
  const [resizingCol, setResizingCol] = useState<string | null>(null)
  const [, setResizeTick] = useState(0)

  const defaultSorting = (): SortingState => [{ id: p.sortingKey as string, desc: p.sortingDirection === "desc" }]

  // Mount seed: restored persistence wins when present; otherwise the declared default.
  // `resetSorting()` always returns to `defaultSorting()`, never to `initialSorting`.
  const [sorting, setSorting] = useState<SortingState>(() =>
    p.initialSorting ? toSortingState(p.initialSorting) : defaultSorting(),
  )
  const sortingRef = useRef(sorting)

  sortingRef.current = sorting

  // Notify the consumer only when the user changes sort (TanStack calls this on header clicks / reset,
  // never on mount), so an untouched table never triggers a persistence write.
  // Resolve `next` outside the state updater — React may re-run updaters; consumer callbacks are not
  // idempotent, so the notify must not live inside `setSorting`.
  // Coerce empty → declared default so UI state and `onSortingChange` stay aligned (`enableSortingRemoval:
  // false` already prevents clearing; this keeps the public contract if that ever changes).
  const changeSorting: OnChangeFn<SortingState> = (updater) => {
    const prev = sortingRef.current
    const resolved = typeof updater === "function" ? updater(prev) : updater
    const next = coerceSortingState(resolved, defaultSorting())

    sortingRef.current = next
    setSorting(next)

    const notified = fromSortingState(next)

    if (notified) p.onSortingChange?.(notified)
  }

  const tableRef = useRef<HTMLTableElement>(null)
  const editScrollRef = useRef<Map<string, number>>(new Map())
  const wrapperRef = useRef<HTMLDivElement>(null)
  const onSelectRef = useRef(p.onSelect)
  const widthsRef = useRef<Record<string, number> | null>(
    p.initialColumnWidths && Object.keys(p.initialColumnWidths).length > 0 ? { ...p.initialColumnWidths } : null,
  )

  const { clampRef } = useColumnLayout({
    tableRef,
    wrapperRef,
    widthsRef,
    columns: p.columns,
    data: p.data,
    resized,
    setResizeTick,
  })

  const { startResize, resetResize } = useColumnResize({
    tableRef,
    wrapperRef,
    widthsRef,
    columns: p.columns,
    resized,
    onColumnWidthsChange: p.onColumnWidthsChange,
    setResized,
    setResizingCol,
    clampRef,
  })

  const columns = p.columns.map((c) => ({
    accessorKey: c.key,
    header: c.label,
    enableResizing: false,
    ...(c.sortValue
      ? {
          sortingFn: (rowA: Row<T>, rowB: Row<T>, columnId: string) => {
            const sortValue = c.sortValue
            if (sortValue == null) throw new Error("sortValue missing after guard")

            const a = sortValue(rowA.getValue(columnId))
            const b = sortValue(rowB.getValue(columnId))

            if (typeof a === "number" && typeof b === "number") return a - b

            return String(a).localeCompare(String(b))
          },
        }
      : {}),
    meta: {
      _collapse: c.width === "collapse",
      _formatter: (c.format === "custom" ? c.formatter : formatters[c.format]?.formatter) as Formatter<T>,
      _monospace: c.format === "custom" ? c.monospace : formatters[c.format]?.monospace === true,
      _editable: c.editable,
      _editor: c.editable === "custom" ? c.editor : undefined,
      _showTooltip: c.tooltipShow,
      _tooltipText: c.tooltipText,
      _skipSubrows: c.editableSkipSubrows,
    },
  }))

  const table = useReactTable({
    data: p.data,
    columns,

    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getSubRows: p.getSubRows ?? ((row) => (row as Record<string, unknown>).subRows as T[] | undefined),
    getRowId: (originalRow, _index, parent) => composeRowId(p.getRowId(originalRow), parent?.id),
    globalFilterFn: "includesString",
    filterFromLeafRows: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: changeSorting,
    enableRowSelection: true,
    enableSubRowSelection: p.selectSubrows ?? false,
    enableSortingRemoval: false,
    onExpandedChange: setExpanded,

    state: {
      rowSelection,
      expanded,
      sorting,
    },
  })

  const stopEditing = () => setEditingCell(null)
  const startEdit = (rowId: string, columnId: string) => setEditingCell({ rowId, columnId })

  const customEditorOpen =
    editingCell != null && p.columns.find((column) => column.key === editingCell.columnId)?.editable === "custom"

  // One document listener for custom editors (replaces per-cell pointerdown effects).
  // Built-in editors close via input blur — do not subscribe unless a custom column is editing.
  useEffect(() => {
    if (!customEditorOpen) return

    const onPointerDown = (e: PointerEvent) => {
      const node = e.target
      if (!(node instanceof Node)) return
      const el = node instanceof Element ? node : node.parentElement
      if (el?.closest(".frame__table__edit-custom")) return

      setEditingCell(null)
    }

    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [customEditorOpen])

  /** Write pending overlay, call onEdit; on rejection clear overlay and rethrow — do not swallow. */
  const commitEdit = async (row: Row<T>, columnId: string, value: unknown) => {
    setPendingEdits((pending) => setPendingEdit(pending, row.id, columnId, value))

    try {
      await p.onEdit?.(row, columnId, value)
    } catch (error) {
      setPendingEdits((pending) => clearPendingEdit(pending, row.id, columnId))
      throw error
    }
  }

  useEffect(() => {
    setExpanded(p.dataExpanded ?? {})
  }, [p.dataExpanded])

  useEffect(() => {
    table.setGlobalFilter(p.filter ?? "")
  }, [p.filter, table])

  useEffect(() => {
    return applyHighlight(tableRef.current, p.filter?.trim().toLowerCase() ?? "")
  }, [p.filter])

  onSelectRef.current = p.onSelect

  // biome-ignore lint/correctness/useExhaustiveDependencies: ...
  useEffect(() => {
    onSelectRef.current?.(table.getSelectedRowModel().rows)
  }, [rowSelection])

  if (p._actionsRef) {
    p._actionsRef.current = {
      resetSorting: () => changeSorting(defaultSorting()),

      clearSelection: () => setRowSelection({}),
      resetExpanded: () => setExpanded(p.dataExpanded ?? {}),
      getSelectedRows: () => table.getSelectedRowModel().rows,
      getData: () => table.getRowModel().rows,
    }
  }

  return (
    <Frame alignment-left width-fill height-hug flow-vertical loading={p.loading}>
      <div ref={wrapperRef} className={`frame__table__wrapper ${p.loading?.[0] ? "pointer-events-none" : ""}`}>
        <table ref={tableRef} className="frame__table">
          <Thead
            p={p}
            table={table}
            rowSelection={rowSelection}
            resizingCol={resizingCol}
            startResize={startResize}
            resetResize={resetResize}
          />

          <Tbody
            p={p}
            table={table}
            editingCell={editingCell}
            rowSelection={rowSelection}
            expanded={expanded}
            pendingEdits={pendingEdits}
            editScrollRef={editScrollRef}
            commitEdit={commitEdit}
            stopEditing={stopEditing}
            onStartEdit={startEdit}
          />
        </table>
      </div>
    </Frame>
  )
}

export const useTable = <T,>(p: TableInternal<T>) => {
  const actionsRef = useRef<TableActions<T>>({
    resetSorting: () => {},
    clearSelection: () => {},
    resetExpanded: () => {},
    getSelectedRows: () => [] as Row<T>[],
    getData: () => [] as Row<T>[],
  })

  const internal: TableInternal<T> = { ...p, _actionsRef: actionsRef }
  const element = <Table {...internal} />

  return {
    element,
    resetSorting: () => actionsRef.current.resetSorting(),
    clearSelection: () => actionsRef.current.clearSelection(),
    resetExpanded: () => actionsRef.current.resetExpanded(),
    getSelectedRows: () => actionsRef.current.getSelectedRows(),
    getData: () => actionsRef.current.getData(),
  }
}
