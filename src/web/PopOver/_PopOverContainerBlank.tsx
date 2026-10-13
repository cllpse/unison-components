import type { ReactElement } from "react"
import type { Frame as FrameType } from "../../base/Frame.base"
import Frame from "../Frame.web"

export type _PopOverContainerBlank = {
  children: ReactElement<FrameType>
  className?: string
}

/**
 * @deprecated Internal component. Use with caution.
 * @remarks Use this component only if you know what you are doing. Otherwise, use PopOverContainerStack.
 * @see PopOverContainerDefault
 */
export default (p: _PopOverContainerBlank) => (
  <Frame
    alignment-top-left
    corner-radius-6
    height-hug
    flow-vertical
    className={`frame__popover-container-blank select-none ${p.className ?? ""}`}
    effect-shadow-large
    style={{ padding: 1 }}
    fill-white
    stroke-neutral-300
    stroke-hover-neutral-400
  >
    {p.children}
  </Frame>
)
