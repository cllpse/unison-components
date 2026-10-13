import type { ReactElement } from "react"
import type { Frame as FrameType } from "../../base/Frame.base"
import type { _Button } from "../_Button.web"
import Frame from "../Frame.web"
import Text from "../Text.web"

export type PopOverContainerDefault = {
  header: string
  body?: string
  frame?: ReactElement<FrameType>
  buttons?: ReactElement<_Button>[]
}

export default (p: PopOverContainerDefault) => {
  return (
    <Frame
      className="frame__popover-container-default select-none w-fit min-w-[180px] max-w-[220px]"
      alignment-top-left
      corner-radius-6
      height-hug
      fill-white
      flow-vertical
      stroke-neutral-300
      stroke-hover-neutral-400
      effect-shadow-large
      gap-2
      style={{ padding: 1 }}
    >
      <Frame alignment-left width-fill height-hug flow-vertical gap-1 padding-horizontal-4 padding-top-3>
        {p.header && (
          <Text typography-align-left fill-neutral-800 typography-header-wrap>
            {p.header}
          </Text>
        )}

        <Text typography-align-left fill-neutral-800 typography-body-small-wrap>
          {p.body}
        </Text>
      </Frame>

      <Frame alignment-top-left width-fill height-hug padding-horizontal-2 padding-bottom-2 padding-top-0 flow-vertical>
        {p.frame}
      </Frame>

      {p.buttons && (
        <Frame alignment-top-left width-fill height-hug flow-horizontal padding-horizontal-2 gap-2 padding-bottom-2>
          {p.buttons}
        </Frame>
      )}
    </Frame>
  )
}
