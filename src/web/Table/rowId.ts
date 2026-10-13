/**
 * Compose a stable TanStack row id from a consumer entity id and an optional parent row id.
 *
 * Separator is `|` — deliberately not TanStack's default `.` (ambiguous once ids stop being
 * numeric index paths), and not a character that appears in uuid / cuid-like database ids.
 */
export function composeRowId(localId: string, parentId?: string): string {
  if (parentId == null) return localId

  return `${parentId}|${localId}`
}
