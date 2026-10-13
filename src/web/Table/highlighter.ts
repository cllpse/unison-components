const HIGHLIGHT_NAME = "frame-table-search"
const HIGHLIGHT_TEXT_SELECTOR = ".frame__text"

const getHighlights = (): Map<string, Highlight> | undefined => {
  if (typeof CSS === "undefined" || !("highlights" in CSS) || typeof Highlight === "undefined") return

  return CSS.highlights as unknown as Map<string, Highlight>
}

export const applyHighlight = (root: HTMLElement | null, needle: string): (() => void) | undefined => {
  const highlights = getHighlights()

  if (!highlights) return

  const clear = () => highlights.delete(HIGHLIGHT_NAME)
  const normalizedNeedle = needle.toLowerCase()

  if (!root || !normalizedNeedle) {
    clear()

    return
  }

  const paint = () => {
    const bodyRoot = root.matches("tbody") ? root : root.querySelector<HTMLElement>("tbody")

    if (!bodyRoot) {
      clear()

      return
    }

    const ranges: Range[] = []
    const walker = document.createTreeWalker(bodyRoot, NodeFilter.SHOW_TEXT)

    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentNode

      if (!(parent instanceof Element) || !parent.closest(HIGHLIGHT_TEXT_SELECTOR)) continue

      const text = (node.nodeValue ?? "").toLowerCase()

      for (
        let idx = text.indexOf(normalizedNeedle);
        idx !== -1;
        idx = text.indexOf(normalizedNeedle, idx + normalizedNeedle.length)
      ) {
        const range = new Range()

        range.setStart(node, idx)
        range.setEnd(node, idx + normalizedNeedle.length)

        ranges.push(range)
      }
    }

    if (ranges.length === 0) {
      clear()

      return
    }

    highlights.set(HIGHLIGHT_NAME, new Highlight(...ranges))
  }

  let frame = 0
  const schedulePaint = () => {
    if (frame) return

    frame = requestAnimationFrame(() => {
      frame = 0
      paint()
    })
  }

  const observer = typeof MutationObserver === "undefined" ? undefined : new MutationObserver(() => schedulePaint())

  observer?.observe(root, { childList: true, subtree: true, characterData: true })
  paint()

  return () => {
    if (frame) cancelAnimationFrame(frame)
    observer?.disconnect()
    clear()
  }
}
