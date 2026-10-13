import type { Row } from "@tanstack/react-table"
import { motion } from "framer-motion"
import { useLayoutEffect, useRef, useState } from "react"
import Text from "../Text.web"
import type { Formatter } from "./types"

export type CellEditorInputProps<T> = {
  row: Row<T>
  columnId: string
  displayValue: unknown
  monospace: boolean
  formatter: Formatter<T> | undefined
  commitEdit: (row: Row<T>, columnId: string, value: unknown) => Promise<void>
  stopEditing: () => void
}

export default function CellEditorInput<T>({
  row,
  columnId,
  displayValue,
  monospace,
  formatter,
  commitEdit,
  stopEditing,
}: CellEditorInputProps<T>) {
  // TableCell remounts this when editing starts, so useState seeds from displayValue at open.
  // Failed commit resets to current displayValue (pending overlay already cleared). Escape unmounts.
  const [value, setValue] = useState(displayValue)
  const inputRef = useRef<HTMLInputElement>(null)

  useLayoutEffect(() => {
    const input = inputRef.current
    if (input == null) return

    input.focus()
    input.select()
  }, [])

  const formattedValue = formatter?.(value, !!row.parentId, row) ?? value

  const commit = async () => {
    if (value === displayValue) return

    await commitEdit(row, columnId, value)
  }

  const commitAndClose = async () => {
    try {
      await commit()
      stopEditing()
    } catch (error) {
      // commitEdit already cleared pending; re-report so hosts see the failure (event handlers can't usefully rethrow).
      console.error(error)
      setValue(displayValue)
    }
  }

  return (
    <Text
      className="frame__table__cell-content-label"
      typography-mono-nowrap={monospace}
      typography-body-nowrap={!monospace}
      typography-align-right={monospace}
      typography-align-left={!monospace}
      fill-black
    >
      <motion.input
        className="frame__table__cell-content-input"
        initial={{ scale: 1, opacity: 0.4 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.12, ease: "easeOut" }}
        type="text"
        ref={inputRef}
        value={typeof formattedValue === "object" ? (value as string) : (formattedValue as string)}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commitAndClose}
        autoComplete="off"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            void commitAndClose()
          } else if (e.key === "Escape") {
            stopEditing()
          }
        }}
      />
    </Text>
  )
}
