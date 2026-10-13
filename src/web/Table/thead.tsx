import type { Table as ReactTableInstance, RowSelectionState } from "@tanstack/react-table"
import type { PointerEvent as ReactPointerEvent } from "react"
import _Button from "../_Button.web"
import Icon from "../Icon.web"
import Text from "../Text.web"
import type { TableInternal } from "./types"

type Thead<T> = {
  p: TableInternal<T>
  table: ReactTableInstance<T>
  rowSelection: RowSelectionState
  resizingCol: string | null
  startResize: (colId: string) => (event: ReactPointerEvent) => void
  resetResize: (colId: string) => () => void
}

export default <T,>({ p, table, rowSelection, resizingCol, startResize, resetResize }: Thead<T>) => {
  return (
    <thead className="frame__table__head">
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id} className="frame__table__row frame__table__row--header">
          <th className="frame__table__cell frame__table__cell--header" style={{ width: 0 }}>
            {p.dataExpanded !== undefined && table.getCanSomeRowsExpand() && (
              <_Button onClick={table.getToggleAllRowsExpandedHandler()}>
                <Icon fill-black className="frame__table__cell-expand-toggle-icon opacity-0">
                  {table.getIsAllRowsExpanded() ? "collapse_all" : "expand_all"}
                </Icon>
              </_Button>
            )}

            {p.onSelect !== undefined && (
              <input
                ref={(el) => {
                  if (el) el.indeterminate = table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
                }}
                key={Object.keys(rowSelection).length}
                className="frame__table__cell-content-input"
                type="checkbox"
                checked={table.getIsAllRowsSelected()}
                onChange={table.getToggleAllRowsSelectedHandler()}
              />
            )}
          </th>

          {headerGroup.headers.map((header) => (
            <th
              key={header.id}
              className="frame__table__cell frame__table__cell--header"
              data-col-id={header.column.id}
              colSpan={header.colSpan}
              style={{
                width: `var(--frame__table__col-${header.column.id}-width, auto)`,
                cursor: header.column.getCanSort() ? "pointer" : undefined,
              }}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest(".frame__table__resizer")) return
                header.column.getToggleSortingHandler()?.(e)
              }}
            >
              {header.isPlaceholder ? null : (
                <Text
                  className="frame__table__cell-content-label"
                  key={header.id}
                  typography-label-small-nowrap
                  fill-black
                  typography-align-right={header.column.columnDef.meta?._monospace}
                  typography-align-left={!header.column.columnDef.meta?._monospace}
                >
                  {header.column.columnDef.header as string}

                  {header.column.getIsSorted() && (
                    <Icon fill-black className="frame__table__sort-indicator">
                      {header.column.getIsSorted() === "asc" ? "arrow_upward_alt" : "arrow_downward_alt"}
                    </Icon>
                  )}
                </Text>
              )}

              {header.column.columnDef.meta?._collapse && (
                <div
                  role="none"
                  onDoubleClick={resetResize(header.column.id)}
                  onPointerDown={startResize(header.column.id)}
                  className={`frame__table__resizer${resizingCol === header.column.id ? " frame__table__resizer--active" : ""}`}
                />
              )}
            </th>
          ))}

          {p.renderRowTrailing !== undefined && (
            <th className="frame__table__cell frame__table__cell--header frame__table__cell--actions" />
          )}
        </tr>
      ))}
    </thead>
  )
}
