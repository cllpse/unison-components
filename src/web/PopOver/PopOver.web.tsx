// @ts-expect-error: side-effect CSS import resolved by the consuming bundler
import "./PopOver.css"
import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactNode } from "react"
import { useLayoutEffect, useRef, useState } from "react"
import { createPortal, flushSync } from "react-dom"
import { UNITS } from "../../constants/units"
import { useId } from "../../utilities/useId"

type PopOver = {
  id?: string
  target: ReactNode
  content: ReactNode
  className?: string
}

/** Matches `--frame__popover-duration` so the panel can finish its exit transition. */
export const POPOVER_EXIT_MS = 120

/** Matches `--frame__popover-inset` (UNITS[4] / 16px). */
const VIEWPORT_NUDGE_PX = UNITS[4]

/** Which corner of the trigger the panel stays glued to. Default grows down-right. */
type Placement = { flipX: boolean; flipY: boolean }
type ToggleState = "opened" | "closed"

const DEFAULT_PLACEMENT: Placement = { flipX: false, flipY: false }

const toggleListeners = new Map<string, Set<(event: ToggleState) => void>>()
const openers = new Map<string, () => void>()
const closers = new Map<string, () => void>()

const subscribeToggle = (id: string, callback: (event: ToggleState) => void) => {
  const set = toggleListeners.get(id) ?? new Set<(event: ToggleState) => void>()
  toggleListeners.set(id, set)
  set.add(callback)
  return () => {
    set.delete(callback)
    if (!set.size) toggleListeners.delete(id)
  }
}

const emitToggle = (id: string, event: ToggleState) => {
  toggleListeners.get(id)?.forEach((callback) => {
    callback(event)
  })
}

export const popoverElement = (id: string) => document.getElementById(`popover-${id}`)

export const showPopoverById = (id: string) => {
  const element = popoverElement(id)
  if (!element) return false
  if (!element.matches(":popover-open")) element.showPopover()
  return true
}

export const hidePopoverById = (id: string) => {
  const element = popoverElement(id)
  if (element?.matches(":popover-open")) {
    element.hidePopover()
    return
  }
  // Panel isn't in the DOM (or isn't open yet) — cancel a pending `open` that
  // already set `mounted` / `pendingOpenRef` so the next layout effect doesn't
  // still `showPopover()`.
  closers.get(id)?.()
}

export const openPopOverPanels = () => {
  const nodes = document.getElementsByClassName("frame__popover-panel")
  const open: HTMLElement[] = []
  for (let i = 0; i < nodes.length; i++) {
    const element = nodes[i] as HTMLElement
    if (element.matches(":popover-open")) open.push(element)
  }
  return open
}

/** Tab cycle — InputText / InputTextarea only; clear buttons and other controls are skipped. */
const TEXT_FIELD_SELECTOR = ".frame__input-text input, .frame__input-textarea textarea"

const textFieldsIn = (panel: HTMLElement) => {
  const nodes = panel.querySelectorAll<HTMLElement>(TEXT_FIELD_SELECTOR)
  const fields: HTMLElement[] = []
  for (let i = 0; i < nodes.length; i++) {
    const field = nodes[i]
    if (field.matches(":disabled, [disabled], [aria-disabled='true']")) continue
    fields.push(field)
  }
  return fields
}

const currentTextFieldIndex = (fields: HTMLElement[], current: EventTarget | null) => {
  if (!(current instanceof HTMLElement)) return -1
  const direct = fields.indexOf(current)
  if (direct !== -1) return direct
  const wrapper = current.closest(".frame__input-text, .frame__input-textarea")
  const nested = wrapper?.querySelector("input, textarea")
  return nested instanceof HTMLElement ? fields.indexOf(nested) : -1
}

const nextTextField = (fields: HTMLElement[], current: EventTarget | null, reverse: boolean) => {
  if (!fields.length) return null

  const index = currentTextFieldIndex(fields, current)
  if (index !== -1) {
    return fields[(index + (reverse ? -1 : 1) + fields.length) % fields.length] ?? null
  }

  if (!(current instanceof Node)) return reverse ? (fields[fields.length - 1] ?? null) : (fields[0] ?? null)

  if (reverse) {
    for (let i = fields.length - 1; i >= 0; i--) {
      const field = fields[i]
      if (field && field.compareDocumentPosition(current) & Node.DOCUMENT_POSITION_FOLLOWING) {
        return field
      }
    }
    return fields[fields.length - 1] ?? null
  }

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i]
    if (field && field.compareDocumentPosition(current) & Node.DOCUMENT_POSITION_PRECEDING) {
      return field
    }
  }
  return fields[0] ?? null
}

/**
 * Closed popovers are `display: none !important` in the UA sheet, so
 * offsetWidth is 0. Override just long enough to read the intrinsic box —
 * first-open flip must not fall back to the trigger size.
 */
const sizeWhileClosed = (panel: HTMLElement, content: HTMLElement) => {
  panel.style.setProperty("display", "block", "important")
  panel.style.visibility = "hidden"
  panel.style.pointerEvents = "none"
  panel.style.position = "fixed"
  panel.style.left = "0"
  panel.style.top = "0"

  try {
    return { width: content.offsetWidth, height: content.offsetHeight }
  } finally {
    panel.style.removeProperty("display")
    panel.style.removeProperty("visibility")
    panel.style.removeProperty("pointer-events")
    panel.style.removeProperty("position")
    panel.style.removeProperty("left")
    panel.style.removeProperty("top")
  }
}

/**
 * Keep one corner of the panel on the trigger. Default grows down-right from
 * the trigger's top-left. If that box would cross a viewport inset, flip that
 * axis so the panel grows the other way (still sharing the trigger's edge).
 * When both sides overflow, pick the side with more room.
 */
const viewportPlacementFor = (trigger: DOMRect, width: number, height: number): Placement => {
  const inset = VIEWPORT_NUDGE_PX
  const vw = window.innerWidth
  const vh = window.innerHeight
  const spaceRight = vw - inset - trigger.left
  const spaceBottom = vh - inset - trigger.top
  // Far edges can sit past the window; don't count those pixels as "room"
  // or the comparison can flip toward the side that hides more of the panel.
  const spaceLeft = Math.min(trigger.right, vw) - inset
  const spaceTop = Math.min(trigger.bottom, vh) - inset

  return {
    flipX: width > spaceRight && spaceLeft > spaceRight,
    flipY: height > spaceBottom && spaceTop > spaceBottom,
  }
}

/** Clip reveal origin — owned by React so commits keep it. Position flip is data-attrs. */
const panelPlacementStyle = (anchorName: string, placement: Placement): CSSProperties => {
  const clipH = "calc(100% - var(--frame__popover-anchor-h))"
  const clipW = "calc(100% - var(--frame__popover-anchor-w))"

  return {
    positionAnchor: anchorName,
    ["--frame__popover-clip-top" as string]: placement.flipY ? clipH : "0px",
    ["--frame__popover-clip-bottom" as string]: placement.flipY ? "0px" : clipH,
    ["--frame__popover-clip-left" as string]: placement.flipX ? clipW : "0px",
    ["--frame__popover-clip-right" as string]: placement.flipX ? "0px" : clipW,
  } as CSSProperties
}

/**
 * @deprecated Internal primitive. Use with caution.
 */
export const _PopOverPanel = (p: {
  id: string
  anchorName: string
  className?: string
  type?: "auto" | "manual"
  children: ReactNode
  /** Which trigger corner to grow from; omit for consumers that position themselves (tooltips). */
  placement?: Placement
}) => {
  if (typeof document === "undefined") return null

  return createPortal(
    <div
      id={`popover-${p.id}`}
      className={p.className}
      style={
        p.placement
          ? panelPlacementStyle(p.anchorName, p.placement)
          : ({ positionAnchor: p.anchorName } as CSSProperties)
      }
      {...(p.placement?.flipX ? { "data-flip-x": "" } : {})}
      {...(p.placement?.flipY ? { "data-flip-y": "" } : {})}
      {...{ popover: p.type ?? "auto" }}
    >
      {p.children}
    </div>,
    document.body,
  )
}

export const usePopOver = () => {
  const id = useId()

  return {
    id,
    open: (id: string) => {
      if (!showPopoverById(id)) openers.get(id)?.()
    },
    close: hidePopoverById,
    onEvent: subscribeToggle,
  }
}

export default (p: PopOver) => {
  const generatedId = useId()
  const id = p.id ?? generatedId
  const contentRef = useRef<HTMLDivElement>(null)
  const sizeRef = useRef({ width: 0, height: 0 })
  const pendingOpenRef = useRef(false)
  const unmountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [mounted, setMounted] = useState(false)
  const [placement, setPlacement] = useState<Placement>(DEFAULT_PLACEMENT)

  const anchor = `--frame__popover-${id}`

  const clearUnmount = () => {
    clearTimeout(unmountTimerRef.current ?? undefined)
    unmountTimerRef.current = null
  }

  const mountPanel = () => {
    clearUnmount()
    if (showPopoverById(id)) return
    pendingOpenRef.current = true
    setMounted(true)
  }

  const cancelPendingOpen = () => {
    if (!pendingOpenRef.current) return
    pendingOpenRef.current = false
    clearUnmount()
    setMounted(false)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: opener/closer read live refs
  useLayoutEffect(() => {
    openers.set(id, mountPanel)
    closers.set(id, cancelPendingOpen)
    return () => {
      if (openers.get(id) === mountPanel) openers.delete(id)
      if (closers.get(id) === cancelPendingOpen) closers.delete(id)
      clearUnmount()
    }
  }, [id])

  // Stay glued to the trigger; flip the growth axis when the default down-right
  // box would cross a viewport inset. Placement is React state (not imperative
  // `element.style`) so the next render can't wipe the correction. Origin/clip
  // and last content size live on this instance (not the panel) so a close-unmount
  // doesn't forget them. `beforetoggle` flushSyncs the next open placement
  // before @starting-style samples.
  // biome-ignore lint/correctness/useExhaustiveDependencies: listeners read live refs
  useLayoutEffect(() => {
    if (!mounted) return

    const panel = popoverElement(id)
    const content = contentRef.current
    const trigger = document.getElementById(`popover-${id}-button`)?.closest(".frame__popover") as HTMLElement | null

    if (!panel || !content || !trigger) return

    let raf = 0

    const place = (next: Placement, sync = false) => {
      const apply = () =>
        setPlacement((prev) => (prev.flipX === next.flipX && prev.flipY === next.flipY ? prev : next))

      // `beforetoggle` / pre-`showPopover` need the clip vars in the DOM before
      // the open transition samples @starting-style; flush so we don't wait
      // for the next frame (which is a visible jump from the default origin).
      if (sync) flushSync(apply)
      else apply()
    }

    /**
     * Trigger box + content size. A still-closed popover is `display: none`
     * (size 0). Prefer the last open size; on first open force a hidden
     * layout pass so we don't treat the panel as trigger-sized and skip a
     * flip that the real content needs.
     */
    const measure = (): Placement => {
      const anchorRect = trigger.getBoundingClientRect()
      let width = content.offsetWidth || sizeRef.current.width
      let height = content.offsetHeight || sizeRef.current.height

      if (!width || !height) {
        const hidden = sizeWhileClosed(panel, content)
        width = hidden.width
        height = hidden.height
      }

      if (width && height) {
        sizeRef.current = { width, height }
      }

      return viewportPlacementFor(anchorRect, width || anchorRect.width, height || anchorRect.height)
    }

    const onBeforeToggle = (event: Event) => {
      if ((event as ToggleEvent).newState === "open") place(measure(), true)
    }

    const onToggle = (event: Event) => {
      const state = (event as ToggleEvent).newState
      if (state === "open") {
        clearUnmount()
        emitToggle(id, "opened")
        raf = requestAnimationFrame(() => place(measure()))
        return
      }
      if (state !== "closed") return
      if (content.offsetWidth && content.offsetHeight) {
        sizeRef.current = { width: content.offsetWidth, height: content.offsetHeight }
      }
      emitToggle(id, "closed")
      clearUnmount()
      unmountTimerRef.current = setTimeout(() => {
        unmountTimerRef.current = null
        setMounted(false)
      }, POPOVER_EXIT_MS)
    }

    const onResize = () => {
      if (panel.matches(":popover-open")) place(measure())
    }

    // Native auto-popover Escape dismiss only fires reliably when the close
    // request targets the popover. Our invoker is activated with a programmatic
    // `.click()` on a `pointer-events-none` button, so focus often stays on the
    // trigger/`target` and Escape does nothing. Close the topmost open panel
    // ourselves — same stacking rule as the UA light-dismiss path.
    //
    // Auto popovers also light-dismiss when focus leaves. Tab from the last
    // field (or onto a clear button) would close the panel. Cycle Tab through
    // InputText / InputTextarea only so a form popover stays open.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
      if (!panel.matches(":popover-open")) return
      if (openPopOverPanels().at(-1) !== panel) return

      if (event.key === "Escape") {
        panel.hidePopover()
        return
      }

      if (event.key !== "Tab") return

      const fields = textFieldsIn(panel)
      if (!fields.length) return
      if (!panel.contains((event.target as Node | null) ?? document.activeElement)) return

      event.preventDefault()
      nextTextField(fields, event.target, event.shiftKey)?.focus()
    }

    panel.addEventListener("beforetoggle", onBeforeToggle)
    panel.addEventListener("toggle", onToggle)
    window.addEventListener("resize", onResize)
    document.addEventListener("keydown", onKeyDown)

    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(onResize)
    observer?.observe(content)

    if (pendingOpenRef.current) {
      pendingOpenRef.current = false
      // Remounted panel is still closed (size 0). Commit last-known origin
      // before `showPopover()` so @starting-style doesn't sample the defaults.
      place(measure(), true)
      if (!panel.matches(":popover-open")) panel.showPopover()
    }

    return () => {
      cancelAnimationFrame(raf)
      panel.removeEventListener("beforetoggle", onBeforeToggle)
      panel.removeEventListener("toggle", onToggle)
      window.removeEventListener("resize", onResize)
      document.removeEventListener("keydown", onKeyDown)
      observer?.disconnect()
    }
  }, [id, mounted])

  // The invoker button is `pointer-events-none` so it never sits on top of
  // `target` and steals hit-testing — hover styles, mouseenter handlers, and
  // clicks on interactive children inside `target` all keep working. Instead of
  // being clicked directly, it's activated programmatically from the wrapper's
  // click handler; `.click()` still triggers the button's native `popovertarget`
  // toggle, so the panel opens/closes with no manual show/hide logic.
  const click = () => document.getElementById(`popover-${id}-button`)?.click()

  // Catch-all disabled handling. Every button variant (_Button, ButtonPrimary,
  // ButtonSecondary) and native controls expose their disabled state through
  // `aria-disabled`/`disabled` in the DOM, so we don't couple to any concrete
  // component. When a click originates inside a disabled control we block the
  // interaction in the capture phase — before the wrapper toggle, the native
  // invoker, or light-dismiss can see it — rather than conditionally skipping
  // the manual open, which only guards this one path.
  const block = (event: ReactMouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement | null)?.closest('[aria-disabled="true"],[disabled]')) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  return (
    <>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: the click bridges to a native popover invoker; the button below carries the semantics. */}
      <div
        className={`frame__popover relative w-fit h-fit select-none ${p.className ?? ""}`}
        style={mounted ? ({ anchorName: anchor } as CSSProperties) : undefined}
        onClickCapture={block}
        onClick={click}
      >
        {p.target}

        {/* Native trigger: `popovertarget` toggles the panel with no JS. It's
            kept `pointer-events-none` so it doesn't overlay `target`; the
            wrapper's onClick activates it instead. */}
        <button
          id={`popover-${id}-button`}
          type="button"
          className={`
            pointer-events-none
            cursor-pointer
            absolute
            inset-0
            w-full
            h-full
            appearance-none
            [background:none]
            [border:none]
            [outline:none]
            [box-shadow:none]
            m-0 p-0
          `}
          {...{ popoverTarget: `popover-${id}` }}
          onClick={(event) => {
            if (popoverElement(id)) return
            event.preventDefault()
            mountPanel()
          }}
        />
      </div>

      {mounted && (
        <_PopOverPanel
          id={id}
          anchorName={anchor}
          className="frame__popover-panel [display:inherit] [flex-direction:inherit] w-fit h-fit"
          placement={placement}
        >
          <div ref={contentRef} className="[display:inherit] [flex-direction:inherit] w-fit h-fit overflow-visible">
            {p.content}
          </div>
        </_PopOverPanel>
      )}
    </>
  )
}
