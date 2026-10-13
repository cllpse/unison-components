// @ts-expect-error: side-effect CSS import resolved by the consuming bundler
import "./Tooltip.css"
import { type CSSProperties, type ReactNode, useLayoutEffect, useRef, useState } from "react"
import { COLORS } from "../constants/colors"
import { computeFill } from "../utilities/computeFill"
import { computeStroke } from "../utilities/computeStroke"
import { useId } from "../utilities/useId"
import Frame from "./Frame.web"
import {
  _PopOverPanel,
  hidePopoverById,
  openPopOverPanels,
  POPOVER_EXIT_MS,
  popoverElement,
  showPopoverById,
} from "./PopOver/PopOver.web"
import Text from "./Text.web"

export type TooltipShow = "on-hover" | "when-content-truncated" | "never"
type TooltipHint = "none" | "dotted-underline"
type TooltipColor = keyof typeof COLORS

export type Tooltip = {
  children: ReactNode
  label: string
  show: TooltipShow
  hint: TooltipHint
  color: TooltipColor
  truncate?: boolean
  disabled?: boolean
  className?: string
}

const HOVER_DELAY = 500
const MAX_LABEL_WORDS = 25

const isTruncated = (el: HTMLElement) => el.scrollWidth > el.clientWidth

const truncateLabel = (label: string) => {
  const words = label.trim().split(/\s+/).filter(Boolean)
  if (words.length <= MAX_LABEL_WORDS) return label
  return `${words.slice(0, MAX_LABEL_WORDS).join(" ")}…`
}

// Don't pop a tooltip while an app-level PopOver is open (unless the trigger
// lives inside it). PopOver panels carry `.frame__popover-panel`; tooltips don't,
// so neither mistakes the other for a blocker.
const blockedBy = (trigger: HTMLElement) => {
  const open = openPopOverPanels()
  return open.length > 0 && open.every((panel) => !panel.contains(trigger))
}

// Registry of tooltips that are pending-open or currently shown — not every
// mounted instance. Tables wrap many cells in tooltips; keeping the set small
// and using one document-level capture listener avoids per-instance fan-out.
type ActiveTooltip = {
  id: string
  trigger: { current: HTMLElement | null }
  hide: () => void
}

const activeTooltips = new Set<ActiveTooltip>()
let listening = false

const onDocumentToggle = (event: Event) => {
  const { newState, target } = event as ToggleEvent & { target: EventTarget | null }

  if (newState !== "open" || !(target instanceof HTMLElement)) return

  // App-level PopOver opened → dismiss tooltips outside it.
  if (target.classList.contains("frame__popover-panel")) {
    for (const { trigger, hide } of [...activeTooltips]) {
      const el = trigger.current
      if (!el || target.contains(el)) continue
      hide()
    }
    return
  }

  // Tooltip opened → exclusive: cancel every other pending/open tooltip.
  // Covers any open path (not only hover), matching `activateTooltip` on enter.
  if (target.classList.contains("frame__tooltip-content")) {
    const activeId = target.id.startsWith("popover-") ? target.id.slice("popover-".length) : ""
    if (!activeId) return
    for (const other of [...activeTooltips]) {
      if (other.id === activeId) continue
      other.hide()
    }
  }
}

/** Claim exclusivity: this tooltip is the active one; cancel all others. */
const activateTooltip = (tooltip: ActiveTooltip) => {
  for (const other of [...activeTooltips]) {
    if (other.id === tooltip.id) continue
    other.hide()
  }
  activeTooltips.add(tooltip)
  if (!listening) {
    // `toggle` doesn't bubble; catch it in the capture phase.
    document.addEventListener("toggle", onDocumentToggle, true)
    listening = true
  }
}

const deactivateTooltip = (tooltip: ActiveTooltip) => {
  activeTooltips.delete(tooltip)
  if (listening && activeTooltips.size === 0) {
    document.removeEventListener("toggle", onDocumentToggle, true)
    listening = false
  }
}

export default (p: Tooltip) => {
  // Mint the anchor id locally with `useId()` rather than reading it off the
  // `usePopOver()` object. Every trigger needs a *unique* anchor-name for CSS
  // anchor positioning; sourcing it indirectly risked an undefined id, which
  // collapsed every tooltip onto the same `--tooltip-undefined` anchor and
  // broke alignment.
  const id = useId()
  const name = `--tooltip-${id}`
  const triggerRef = useRef<HTMLElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [mounted, setMounted] = useState(false)
  const self = useRef<ActiveTooltip | null>(null)

  const dottedUnderline = p.hint === "dotted-underline"
  const truncateHint = dottedUnderline && p.show === "when-content-truncated"

  const clearTimer = () => {
    clearTimeout(timer.current ?? undefined)
    timer.current = null
  }

  const hide = () => {
    clearTimer()
    if (self.current) deactivateTooltip(self.current)
    // Panel not mounted yet — still clear a pending `setMounted(true)` from the hover delay.
    if (!popoverElement(id)) {
      setMounted(false)
      return
    }
    hidePopoverById(id)
    timer.current = setTimeout(() => {
      timer.current = null
      setMounted(false)
    }, POPOVER_EXIT_MS)
  }

  const enter = () => {
    const el = triggerRef.current
    if (!el || p.disabled || p.show === "never") return
    if (blockedBy(el)) return
    if (p.show === "when-content-truncated" && !isTruncated(el)) return

    clearTimer()
    if (!self.current) self.current = { id, trigger: triggerRef, hide }
    self.current.hide = hide
    activateTooltip(self.current)

    if (popoverElement(id)) {
      showPopoverById(id)
      return
    }

    timer.current = setTimeout(() => {
      timer.current = null
      if (blockedBy(el)) {
        hide()
        return
      }
      setMounted(true)
    }, HOVER_DELAY)
  }

  useLayoutEffect(() => {
    if (p.disabled) {
      clearTimeout(timer.current ?? undefined)
      timer.current = null
      hidePopoverById(id)
      setMounted(false)
      return
    }
    if (mounted) showPopoverById(id)
  }, [mounted, p.disabled, id])

  // Only the "underline only when the text is actually clipped" hint needs live
  // measurement; every other tooltip skips the observer entirely.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure when content changes
  useLayoutEffect(() => {
    const el = triggerRef.current
    if (!el || !truncateHint) return

    const check = () => {
      el.dataset.truncated = isTruncated(el) ? "true" : "false"
    }

    check()

    const observer = new ResizeObserver(check)
    observer.observe(el)

    return () => observer.disconnect()
  }, [p.children, truncateHint])

  useLayoutEffect(
    () => () => {
      clearTimeout(timer.current ?? undefined)
      timer.current = null
      if (self.current) deactivateTooltip(self.current)
    },
    [],
  )

  const className = [
    "frame__tooltip",
    dottedUnderline && "frame__tooltip--dotted-underline",
    truncateHint && "frame__tooltip--truncate-hint",
    p.truncate && "block min-w-0 max-w-full !overflow-hidden text-ellipsis whitespace-nowrap",
    p.className,
  ]
    .filter(Boolean)
    .join(" ")

  const palette = COLORS[p.color]
  const style = {
    ...(mounted ? { anchorName: name } : {}),
    ...(dottedUnderline ? { textDecorationColor: typeof palette === "object" ? palette[500] : palette } : {}),
  } as CSSProperties

  return (
    <abbr
      ref={triggerRef}
      className={className}
      style={mounted || dottedUnderline ? style : undefined}
      {...(truncateHint ? { "data-truncated": "false" } : {})}
      onMouseEnter={enter}
      onMouseLeave={hide}
    >
      {p.children}

      {mounted && !p.disabled && (
        <_PopOverPanel id={id} anchorName={name} type="manual" className="frame__tooltip-content">
          <Frame
            alignment-left
            corner-radius-2
            width-hug
            height-hug
            flow-vertical
            padding-horizontal-2
            padding-vertical-2
            effect-shadow-small
            {...computeFill(p.color, 50)}
            {...computeStroke(p.color, 300)}
          >
            <Text typography-body-small-wrap {...computeFill(p.color, 800)}>
              {truncateLabel(p.label)}
            </Text>
          </Frame>
        </_PopOverPanel>
      )}
    </abbr>
  )
}
