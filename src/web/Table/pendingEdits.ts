export type PendingEdits = Map<string, unknown>

/** Collision-proof cell key — colon-join collides when either id contains `:`. */
export function pendingEditKey(rowId: string, columnId: string): string {
  return JSON.stringify([rowId, columnId])
}

export function setPendingEdit(pending: PendingEdits, rowId: string, columnId: string, value: unknown): PendingEdits {
  const next = new Map(pending)

  next.set(pendingEditKey(rowId, columnId), value)

  return next
}

export function clearPendingEdit(pending: PendingEdits, rowId: string, columnId: string): PendingEdits {
  const next = new Map(pending)

  next.delete(pendingEditKey(rowId, columnId))

  return next
}

/** Prefer a pending overlay value when present — including legitimate `null` / `undefined`. */
export function resolveCellValue(
  pending: PendingEdits,
  rowId: string,
  columnId: string,
  sourceValue: unknown,
): unknown {
  const key = pendingEditKey(rowId, columnId)

  if (pending.has(key)) return pending.get(key)

  return sourceValue
}
