import type { Row } from "@tanstack/react-table"
import type { ReactNode } from "react"
import Icon from "../Icon.web"
import Text from "../Text.web"
import type { TooltipShow } from "../Tooltip.web"
import Tooltip from "../Tooltip.web"
import type { Editable, Formatter } from "./types"

export type CellDisplayProps<T> = {
  row: Row<T>
  columnId: string
  columnLabel: string
  displayValue: unknown
  selected: boolean
  monospace: boolean
  editable: Editable | undefined
  formatter: Formatter<T> | undefined
  showTooltip: TooltipShow | undefined
  tooltipText: string | ((value: unknown) => string) | undefined
  skipSubrows: boolean | undefined
  onStartEdit?: (rowId: string, columnId: string) => void
}

export default function CellDisplay<T>({
  row,
  columnId,
  columnLabel,
  displayValue,
  selected,
  monospace,
  editable,
  formatter,
  showTooltip,
  tooltipText: tooltipTextProp,
  skipSubrows,
  onStartEdit,
}: CellDisplayProps<T>) {
  const formattedValue = formatter?.(displayValue, !!row.parentId, row) ?? displayValue
  const tooltipText = typeof tooltipTextProp === "function" ? tooltipTextProp(displayValue) : tooltipTextProp

  return (
    <Text
      className="frame__table__cell-content-label"
      typography-mono-nowrap={monospace}
      typography-body-nowrap={!monospace}
      typography-align-right={monospace}
      typography-align-left={!monospace}
      fill-black={!selected}
      fill-tertiary-900={selected}
    >
      {!showTooltip || showTooltip === "never" ? (
        (formattedValue as ReactNode)
      ) : (
        <Tooltip
          show={showTooltip}
          truncate
          color={selected ? "tertiary" : "neutral"}
          label={(tooltipText || formattedValue) as string}
          hint={showTooltip === "when-content-truncated" ? "dotted-underline" : "none"}
        >
          {formattedValue as ReactNode}
        </Tooltip>
      )}

      {editable && (!row.parentId || !skipSubrows) && (
        <button
          type="button"
          aria-label={`Edit ${columnLabel}`}
          className={`frame__table__cell-content-icon${monospace ? " frame__table__cell-content-icon-right" : ""}`}
          onClick={() => onStartEdit?.(row.id, columnId)}
        >
          <Icon fill-black>edit</Icon>
        </button>
      )}
    </Text>
  )
}
