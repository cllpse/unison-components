import type { ReactElement, ReactNode } from "react"
import { Children, isValidElement, useLayoutEffect, useRef } from "react"
import type { View } from "react-native"
import type { Frame as FrameType } from "../../base/Frame.base"
import ButtonPrimary, { type ButtonPrimary as ButtonPrimaryType } from "../ButtonPrimary.web"
import ButtonSecondary, { type ButtonSecondary as ButtonSecondaryType } from "../ButtonSecondary.web"
import Frame from "../Frame.web"
import OverflowContainer from "../OverflowContainer.web"

export type StackPane = {
  id: string

  buttonNext?: {
    paneId: string
    label: ButtonSecondaryType["label"]
    icon?: ButtonSecondaryType["icon"]
    color?: ButtonSecondaryType["color"]
    destructive?: ButtonSecondaryType["destructive"]
  }

  buttonAccept?: {
    label: ButtonPrimaryType["label"]
    icon?: ButtonPrimaryType["icon"]
    color?: ButtonPrimaryType["color"]
    onClick?: ButtonPrimaryType["onClick"]
    destructive?: ButtonPrimaryType["destructive"]
  }

  buttonDismiss?: {
    label: ButtonSecondaryType["label"]
    onClick?: ButtonSecondaryType["onClick"]
    destructive?: ButtonSecondaryType["destructive"]
  }

  buttonPrevious?: {
    paneId: string
    onClick?: ButtonSecondaryType["onClick"]
  }

  frame?: ReactElement<FrameType>
}

const containsOverflowContainer = (node: ReactNode): boolean => {
  let found = false

  Children.forEach(node, (child) => {
    if (found || !isValidElement(child)) return

    if (child.type === OverflowContainer) {
      found = true

      return
    }

    found = containsOverflowContainer((child.props as { children?: ReactNode }).children)
  })

  return found
}

/**
 * @deprecated Internal component. Use with caution.
 * @remarks Use this component only if you know what you are doing. Otherwise, use PopOverContainerDefault.
 * @see PopOverContainerStack
 */
export type _PopOverContainerStack = {
  panes: StackPane[]
  paneId: string
  onPaneIdChange?: (paneId: string) => void
  onDismiss?: () => void
  onAccept?: () => void
  skipAnimation?: boolean
}

export default (p: _PopOverContainerStack) => {
  const frameRef = useRef<View | null>(null)

  useLayoutEffect(() => {
    if (p.skipAnimation) return

    const node = frameRef.current as unknown as HTMLElement | null

    if (!node || typeof ResizeObserver === "undefined") return

    let previous: { width: number; height: number } | null = null
    let animation: Animation | null = null

    const observer = new ResizeObserver(() => {
      if (animation?.playState === "running") return

      const width = node.offsetWidth
      const height = node.offsetHeight

      if (width === 0 && height === 0) {
        previous = null

        return
      }

      if (previous && (previous.width !== width || previous.height !== height) && typeof node.animate === "function") {
        animation = node.animate(
          [
            { width: `${previous.width}px`, height: `${previous.height}px` },
            { width: `${width}px`, height: `${height}px` },
          ],
          { duration: 120, easing: "ease-out" },
        )
      }

      previous = { width, height }
    })

    observer.observe(node)

    return () => {
      observer.disconnect()
      animation?.cancel()
    }
  }, [p.skipAnimation])

  const panes = p.panes.map((pane) => {
    const key = `pane-${pane.id}`

    const paneContainsOverflowContainer = pane.frame && containsOverflowContainer(pane.frame)

    const element = (
      <Frame key={key} alignment-top-left width-fill height-fill flow-vertical padding-vertical-2>
        {pane.buttonPrevious && (
          <Frame alignment-top-left width-fill height-hug flow-horizontal padding-horizontal-2 padding-bottom-2>
            <ButtonSecondary
              color="neutral"
              key={`${key}-back-button`}
              label="Back"
              icon="chevron_backward"
              onClick={(event) => {
                event.preventDefault()
                pane.buttonPrevious?.onClick?.(event)
                p.onPaneIdChange?.(pane.buttonPrevious?.paneId ?? "")
              }}
            />
          </Frame>
        )}

        {pane.frame && (
          <Frame
            alignment-top-left
            width-fill
            height-fill
            flow-horizontal
            padding-horizontal-0={paneContainsOverflowContainer}
            padding-horizontal-2={!paneContainsOverflowContainer}
            padding-bottom-2={!!(pane.buttonAccept || pane.buttonNext || pane.buttonDismiss)}
          >
            {pane.frame}
          </Frame>
        )}

        {(pane.buttonAccept || pane.buttonNext || pane.buttonDismiss) && (
          <>
            {pane.buttonNext && (
              <Frame
                alignment-top-left
                width-fill
                height-hug
                flow-horizontal
                padding-bottom-2={!!(pane.buttonAccept || pane.buttonDismiss)}
                padding-horizontal-2
                gap-1
              >
                <ButtonSecondary
                  key={`${key}-primary-button`}
                  label={pane.buttonNext.label}
                  icon={pane.buttonNext.icon}
                  width-fill
                  color={pane.buttonNext.color ?? "primary"}
                  destructive={pane.buttonNext.destructive}
                  onClick={(event) => {
                    event.preventDefault()
                    p.onPaneIdChange?.(pane.buttonNext?.paneId ?? "")
                  }}
                />
              </Frame>
            )}

            {(pane.buttonAccept || pane.buttonDismiss) && (
              <Frame
                alignment-top-left
                width-fill
                height-hug
                flow-horizontal
                padding-horizontal-2
                gap-2
                className="flex-wrap"
              >
                {pane.buttonAccept && (
                  <ButtonPrimary
                    color={pane.buttonAccept.color ?? "primary"}
                    key={`${key}-accept-button`}
                    label={pane.buttonAccept.label}
                    icon={pane.buttonAccept.icon}
                    destructive={pane.buttonAccept.destructive}
                    width-fill={!pane.buttonNext && !pane.buttonDismiss}
                    alignment-center={!pane.buttonNext && !pane.buttonDismiss}
                    alignment-left={!!(pane.buttonNext || pane.buttonDismiss)}
                    onClick={(event) => {
                      event.preventDefault()
                      pane.buttonAccept?.onClick?.(event)

                      requestAnimationFrame(() => {
                        setTimeout(() => {
                          p.onAccept?.()
                        }, 120)
                      })
                    }}
                  />
                )}

                {pane.buttonDismiss && (
                  <ButtonSecondary
                    color="neutral"
                    key={`${key}-secondary-button`}
                    label={pane.buttonDismiss.label}
                    destructive={pane.buttonDismiss.destructive}
                    onClick={(event) => {
                      event.preventDefault()
                      pane.buttonDismiss?.onClick?.(event)

                      requestAnimationFrame(() => {
                        setTimeout(() => {
                          p.onDismiss?.()
                        }, 120)
                      })
                    }}
                  />
                )}
              </Frame>
            )}
          </>
        )}
      </Frame>
    )

    return { id: pane.id, element }
  })

  const pane = panes.find((pane) => pane.id === p.paneId)

  return (
    pane && (
      <Frame
        ref={frameRef}
        height-fill
        flow-vertical
        alignment-top-left
        width-fill
        className="frame__popover-container-stack select-none"
      >
        {pane?.element}
      </Frame>
    )
  )
}
