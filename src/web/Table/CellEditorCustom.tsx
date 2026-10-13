import type { Row } from "@tanstack/react-table"
import { motion } from "framer-motion"
import { type RefObject, useLayoutEffect, useRef } from "react"
import type { Editor } from "./types"

export type CellEditorCustomProps<T> = {
  row: Row<T>
  columnId: string
  editor: Editor<T> | undefined
  editScrollRef: RefObject<Map<string, number>>
}

export default function CellEditorCustom<T>({ row, columnId, editor, editScrollRef }: CellEditorCustomProps<T>) {
  const editorRef = useRef<HTMLDivElement>(null)
  const cellKey = JSON.stringify([row.id, columnId])

  useLayoutEffect(() => {
    const el = editorRef.current
    if (el == null) return

    const saved = editScrollRef.current.get(cellKey)
    if (saved != null) el.scrollTo({ top: saved, behavior: "instant" })
  })

  return (
    <motion.div
      ref={editorRef}
      className="frame__table__edit-custom"
      initial={{ scale: 1, opacity: 0.4 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      onScroll={(e) => {
        editScrollRef.current.set(cellKey, e.currentTarget.scrollTop)
      }}
    >
      {editor?.(row)}
    </motion.div>
  )
}
