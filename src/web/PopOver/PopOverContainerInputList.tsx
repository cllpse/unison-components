import { cloneElement, type ReactElement } from "react"
import type { COLORS } from "../../constants/colors"
import type { ButtonPrimary } from "../ButtonPrimary.web"
import type { ButtonSecondary } from "../ButtonSecondary.web"
import Frame from "../Frame.web"
import type { InputButtonList as InputButtonListType } from "../InputButtonList.web"
import type { InputSelectionList as InputSelectionListType } from "../InputSelectionList.web"
import Text from "../Text.web"

export type PopOverContainerInputList<T> = {
  color: keyof typeof COLORS
  header?: string
  body: string
  inputButtonList: ReactElement<InputSelectionListType<T> | InputButtonListType>
  buttons?: ReactElement<ButtonPrimary | ButtonSecondary> | ReactElement<ButtonPrimary | ButtonSecondary>[]
}

export default <T,>(p: PopOverContainerInputList<T>) => {
  return (
    <Frame
      alignment-top-left
      corner-radius-6
      height-hug
      flow-vertical
      className="frame__popover-container-input-button-list select-none w-fit min-w-[180px] max-w-[220px]"
      effect-shadow-large
      style={{ padding: 1 }}
      fill-white
      stroke-neutral-300
      stroke-hover-neutral-400
    >
      <Frame
        alignment-left
        width-fill
        height-hug
        flow-vertical
        gap-1
        padding-horizontal-4
        padding-top-3
        padding-bottom-1
      >
        {p.header && (
          <Text typography-align-left fill-neutral-800 typography-header-wrap>
            {p.header}
          </Text>
        )}

        <Text typography-align-left fill-neutral-800 typography-body-small-wrap>
          {p.body}
        </Text>
      </Frame>

      <Frame alignment-top-left width-fill height-hug padding-horizontal-2 padding-bottom-2 flow-vertical>
        {cloneElement(p.inputButtonList, { color: p.color })}
      </Frame>

      {p.buttons ? (
        <Frame alignment-top-left width-fill height-hug flow-horizontal padding-horizontal-2 gap-2 padding-bottom-2>
          {p.buttons}
        </Frame>
      ) : null}
    </Frame>
  )
}
