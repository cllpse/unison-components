import type { ExpandedState, Table as ReactTableInstance, Row, RowSelectionState } from "@tanstack/react-table"
import { useWindowVirtualizer } from "@tanstack/react-virtual"
import { type CSSProperties, type RefObject, useLayoutEffect, useRef, useState } from "react"
import { UNITS } from "../../constants/units"
import _Button from "../_Button.web"
import Icon from "../Icon.web"
import Text from "../Text.web"
import TableCell from "./cell"
import type { PendingEdits } from "./pendingEdits"
import { resolveCellValue } from "./pendingEdits"
import type { TableInternal } from "./types"

type EditingCell = { rowId: string; columnId: string } | null

export const TABLE_VIRTUALIZATION = true

const ROW_HEIGHT_PX = UNITS[11]

const spacerCellStyle = (height: number): CSSProperties => ({
  height,
  padding: 0,
  border: "none",
  lineHeight: 0,
})

type TbodyProps<T> = {
  p: TableInternal<T>
  table: ReactTableInstance<T>
  editingCell: EditingCell
  rowSelection: RowSelectionState
  expanded: ExpandedState
  pendingEdits: PendingEdits
  editScrollRef: RefObject<Map<string, number>>
  commitEdit: (row: Row<T>, columnId: string, value: unknown) => Promise<void>
  stopEditing: () => void
  onStartEdit: (rowId: string, columnId: string) => void
}

const hasTrailingColumn = <T,>(p: TableInternal<T>) => p.renderRowTrailing !== undefined

const colSpanFor = <T,>(p: TableInternal<T>, table: ReactTableInstance<T>) =>
  table
    .getHeaderGroups()
    .map((headerGroup) => headerGroup.headers.length)
    .reduce((a, b) => a + b, 0) +
  1 +
  (hasTrailingColumn(p) ? 1 : 0)

const isRowExpanded = (rowId: string, expanded: ExpandedState): boolean => {
  if (expanded === true) return true

  return typeof expanded === "object" && !!expanded[rowId]
}

/**
 * Partial descendant selection (some but not all) — mirrors TanStack `getIsSomeSelected`,
 * but reads `rowSelection` from props so React Compiler cannot skip the paint.
 */
const descendantSelection = <T,>(row: Row<T>, rowSelection: RowSelectionState): false | "some" | "all" => {
  if (row.subRows.length === 0) return false

  let allChildrenSelected = true
  let someSelected = false

  for (const sub of row.subRows) {
    if (sub.getCanSelect()) {
      if (rowSelection[sub.id]) someSelected = true
      else allChildrenSelected = false
    }

    if (sub.subRows.length > 0) {
      const nested = descendantSelection(sub, rowSelection)
      if (nested === "all") {
        someSelected = true
      } else if (nested === "some") {
        someSelected = true
        allChildrenSelected = false
      } else {
        allChildrenSelected = false
      }
    }
  }

  return allChildrenSelected ? "all" : someSelected ? "some" : false
}

const isSomeDescendantSelected = <T,>(row: Row<T>, rowSelection: RowSelectionState): boolean =>
  descendantSelection(row, rowSelection) === "some"

const TableRow = <T,>({
  p,
  row,
  editingCell,
  rowSelection,
  expanded,
  pendingEdits,
  editScrollRef,
  commitEdit,
  stopEditing,
  onStartEdit,
}: Omit<TbodyProps<T>, "table"> & { row: Row<T> }) => {
  const selected = !!rowSelection[row.id]
  const expandedOpen = isRowExpanded(row.id, expanded)
  const someSelected = isSomeDescendantSelected(row, rowSelection)

  return (
    <tr className={`frame__table__row ${selected ? "frame__table__row--selected" : "frame__table__row--unselected"}`}>
      <td className="frame__table__cell">
        {p.dataExpanded !== undefined && row.getCanExpand() && (
          <_Button onClick={row.getToggleExpandedHandler()} width-full height-full>
            <Icon fill-black className="frame__table__cell-expand-toggle-icon">
              {expandedOpen ? "expand_less" : "expand_more"}
            </Icon>
          </_Button>
        )}

        {p.onSelect !== undefined && row.depth === 0 && (
          <input
            className="frame__table__cell-content-input"
            type="checkbox"
            checked={selected}
            disabled={!row.getCanSelect() || !!row.parentId}
            onChange={row.getToggleSelectedHandler()}
            ref={(el) => {
              if (el) el.indeterminate = row.getCanExpand() && someSelected
            }}
          />
        )}
      </td>

      {row.getVisibleCells().map((cell) => {
        const columnId = cell.column.id
        const header = cell.column.columnDef.header
        const columnLabel = typeof header === "string" ? header : columnId
        const meta = cell.column.columnDef.meta
        const sourceValue = cell.getValue()
        const displayValue = resolveCellValue(pendingEdits, row.id, columnId, sourceValue)
        const editing = editingCell?.rowId === row.id && editingCell?.columnId === columnId

        return (
          <td key={cell.id} className="frame__table__cell" data-column-id={columnId}>
            <TableCell
              row={row}
              columnId={columnId}
              columnLabel={columnLabel}
              displayValue={displayValue}
              editing={editing}
              selected={selected}
              monospace={meta?._monospace === true}
              editable={meta?._editable}
              editor={meta?._editor}
              formatter={meta?._formatter}
              showTooltip={meta?._showTooltip}
              tooltipText={meta?._tooltipText}
              skipSubrows={meta?._skipSubrows}
              editScrollRef={editScrollRef}
              commitEdit={commitEdit}
              stopEditing={stopEditing}
              onStartEdit={onStartEdit}
            />
          </td>
        )
      })}

      {hasTrailingColumn(p) && (
        <td className="frame__table__cell frame__table__cell--actions">{p.renderRowTrailing?.(row)}</td>
      )}
    </tr>
  )
}

const EmptyRow = <T,>({ p, table }: { p: TableInternal<T>; table: ReactTableInstance<T> }) => (
  <tr className="frame__table__row">
    <td className="frame__table__cell" colSpan={colSpanFor(p, table)} style={{ textAlign: "center" }}>
      {p.emptyState ?? (
        <Text fill-black typography-body-nowrap>
          No results
        </Text>
      )}
    </td>
  </tr>
)

const SpacerRow = ({ height, colSpan }: { height: number; colSpan: number }) => {
  if (height <= 0) return null

  return (
    <tr className="frame__table__row frame__table__row--spacer">
      <td colSpan={colSpan} style={spacerCellStyle(height)} />
    </tr>
  )
}

const VirtualizedRows = <T,>({
  p,
  table,
  rows,
  editingCell,
  rowSelection,
  expanded,
  pendingEdits,
  editScrollRef,
  commitEdit,
  stopEditing,
  onStartEdit,
}: TbodyProps<T> & { rows: Row<T>[] }) => {
  // React Compiler caches `getVirtualItems()` against the stable virtualizer
  // instance (interior mutability). `useWindowVirtualizer` is not in the
  // compiler's known-incompatible list yet (only `useVirtualizer` is), so
  // scroll updates the virtualizer but not the paint until another state
  // change (e.g. row selection) invalidates a shared reactive scope.
  // See https://github.com/TanStack/virtual/issues/736
  "use no memo"

  const tbodyRef = useRef<HTMLTableSectionElement>(null)
  const [scrollMargin, setScrollMargin] = useState(0)

  useLayoutEffect(() => {
    const el = tbodyRef.current

    if (!el || typeof window === "undefined") return

    const measure = () => {
      setScrollMargin(el.getBoundingClientRect().top + window.scrollY)
    }

    measure()
    window.addEventListener("resize", measure)

    return () => window.removeEventListener("resize", measure)
  }, [])

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_HEIGHT_PX,
    overscan: 10,
    scrollMargin,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const colSpan = colSpanFor(p, table)

  const paddingTop = virtualItems.length > 0 ? Math.max(0, virtualItems[0].start - scrollMargin) : 0
  const paddingBottom =
    virtualItems.length > 0
      ? Math.max(0, virtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1].end - scrollMargin))
      : 0

  return (
    <tbody ref={tbodyRef} className="frame__table__body">
      <SpacerRow height={paddingTop} colSpan={colSpan} />

      {virtualItems.map((item) => {
        const row = rows[item.index]
        if (row == null) throw new Error(`VirtualizedRows: missing row at index ${item.index}`)

        return (
          <TableRow
            key={row.id}
            p={p}
            row={row}
            editingCell={editingCell}
            rowSelection={rowSelection}
            expanded={expanded}
            pendingEdits={pendingEdits}
            editScrollRef={editScrollRef}
            commitEdit={commitEdit}
            stopEditing={stopEditing}
            onStartEdit={onStartEdit}
          />
        )
      })}

      <SpacerRow height={paddingBottom} colSpan={colSpan} />
    </tbody>
  )
}

const FullRows = <T,>({
  p,
  rows,
  editingCell,
  rowSelection,
  expanded,
  pendingEdits,
  editScrollRef,
  commitEdit,
  stopEditing,
  onStartEdit,
}: Omit<TbodyProps<T>, "table"> & { rows: Row<T>[] }) => (
  <tbody className="frame__table__body">
    {rows.map((row) => (
      <TableRow
        key={row.id}
        p={p}
        row={row}
        editingCell={editingCell}
        rowSelection={rowSelection}
        expanded={expanded}
        pendingEdits={pendingEdits}
        editScrollRef={editScrollRef}
        commitEdit={commitEdit}
        stopEditing={stopEditing}
        onStartEdit={onStartEdit}
      />
    ))}
  </tbody>
)

export default <T,>({
  p,
  table,
  editingCell,
  rowSelection,
  expanded,
  pendingEdits,
  editScrollRef,
  commitEdit,
  stopEditing,
  onStartEdit,
}: TbodyProps<T>) => {
  const rows = table.getRowModel().rows

  if (rows.length === 0) {
    return (
      <tbody className="frame__table__body">
        <EmptyRow p={p} table={table} />
      </tbody>
    )
  }

  if (TABLE_VIRTUALIZATION) {
    return (
      <VirtualizedRows
        p={p}
        table={table}
        rows={rows}
        editingCell={editingCell}
        rowSelection={rowSelection}
        expanded={expanded}
        pendingEdits={pendingEdits}
        editScrollRef={editScrollRef}
        commitEdit={commitEdit}
        stopEditing={stopEditing}
        onStartEdit={onStartEdit}
      />
    )
  }

  return (
    <FullRows
      p={p}
      rows={rows}
      editingCell={editingCell}
      rowSelection={rowSelection}
      expanded={expanded}
      pendingEdits={pendingEdits}
      editScrollRef={editScrollRef}
      commitEdit={commitEdit}
      stopEditing={stopEditing}
      onStartEdit={onStartEdit}
    />
  )
}
