import type { ReactElement } from "react"
import type { ButtonPrimary } from "../ButtonPrimary.web"
import type { ButtonSecondary } from "../ButtonSecondary.web"
import Frame from "../Frame.web"
import Text from "../Text.web"

export type TooltipContainerDestructiveAction = {
  header: string
  body?: string
  buttonPrimary: ReactElement<ButtonPrimary>
} & (
  | {
      buttonSecondary?: never
    }
  | {
      buttonSecondary: ReactElement<ButtonSecondary>
    }
)

export default (p: TooltipContainerDestructiveAction) => {
  return (
    <Frame
      className="frame__popover-container-destructive-action select-none w-fit min-w-[180px] max-w-[220px]"
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
          <Text typography-align-left fill-negative-800 typography-header-wrap>
            {p.header}
          </Text>
        )}

        <Text typography-align-left fill-neutral-800 typography-body-small-wrap>
          {p.body}
        </Text>
      </Frame>

      {p.buttonPrimary || p.buttonSecondary ? (
        <Frame alignment-top-left width-fill height-hug flow-horizontal padding-horizontal-2 gap-2 padding-bottom-2>
          {p.buttonPrimary}

          {p.buttonSecondary}
        </Frame>
      ) : null}
    </Frame>
  )
}
