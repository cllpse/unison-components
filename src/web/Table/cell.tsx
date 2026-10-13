import type { Row } from "@tanstack/react-table"
import type { RefObject } from "react"
import type { TooltipShow } from "../Tooltip.web"
import CellDisplay from "./CellDisplay"
import CellEditorCustom from "./CellEditorCustom"
import CellEditorInput from "./CellEditorInput"
import type { Editable, Editor, Formatter } from "./types"

export type TableCellProps<T> = {
  row: Row<T>
  columnId: string
  columnLabel: string
  displayValue: unknown
  editing: boolean
  selected: boolean
  monospace: boolean
  editable: Editable | undefined
  editor: Editor<T> | undefined
  formatter: Formatter<T> | undefined
  showTooltip: TooltipShow | undefined
  tooltipText: string | ((value: unknown) => string) | undefined
  skipSubrows: boolean | undefined
  editScrollRef: RefObject<Map<string, number>>
  commitEdit: (row: Row<T>, columnId: string, value: unknown) => Promise<void>
  stopEditing: () => void
  onStartEdit: (rowId: string, columnId: string) => void
}

/**
 * Display stays mounted while idle; editors mount only while `editing` is true.
 * Unmounting the editor on close reseeds local state on the next open.
 */
export default function TableCell<T>({
  row,
  columnId,
  columnLabel,
  displayValue,
  editing,
  selected,
  monospace,
  editable,
  editor,
  formatter,
  showTooltip,
  tooltipText,
  skipSubrows,
  editScrollRef,
  commitEdit,
  stopEditing,
  onStartEdit,
}: TableCellProps<T>) {
  if (!editing) {
    return (
      <CellDisplay
        row={row}
        columnId={columnId}
        columnLabel={columnLabel}
        displayValue={displayValue}
        selected={selected}
        monospace={monospace}
        editable={editable}
        formatter={formatter}
        showTooltip={showTooltip}
        tooltipText={tooltipText}
        skipSubrows={skipSubrows}
        onStartEdit={onStartEdit}
      />
    )
  }

  if (editable === "custom") {
    return <CellEditorCustom row={row} columnId={columnId} editor={editor} editScrollRef={editScrollRef} />
  }

  return (
    <CellEditorInput
      row={row}
      columnId={columnId}
      displayValue={displayValue}
      monospace={monospace}
      formatter={formatter}
      commitEdit={commitEdit}
      stopEditing={stopEditing}
    />
  )
}
