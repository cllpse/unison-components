import type { ComponentPropsWithRef, MouseEvent } from "react"
import type { COLORS } from "../constants/colors"
import { computeFill } from "../utilities/computeFill"
import ButtonSecondary from "./ButtonSecondary.web"
import Frame from "./Frame.web"
import Text from "./Text.web"

export type InputButtonListItem =
  | {
      id: string
      label: string
      icon?: string
      onClick?: (event: MouseEvent<HTMLDivElement>) => void
    }
  | string

export type InputButtonList = ComponentPropsWithRef<"div"> & {
  color: keyof typeof COLORS
  id: string
  name: string
  items: InputButtonListItem[]
}

export default (p: InputButtonList) => {
  return (
    <Frame alignment-left flow-vertical height-hug width-fill gap-2>
      {p.items.map((item) => {
        if (typeof item === "string") {
          return (
            <Frame
              key={`header-${item}`}
              alignment-left
              flow-horizontal
              height-hug
              width-fill
              padding-horizontal-2
              padding-top-1
            >
              <Text {...computeFill(p.color, 700)} typography-align-left typography-body-small-wrap>
                {item}
              </Text>
            </Frame>
          )
        } else {
          return (
            <ButtonSecondary
              key={`button-${item.id}`}
              icon={item.icon}
              label={item.label}
              color={p.color}
              width-fill
              onClick={item.onClick}
              alignment-left
            />
          )
        }
      })}
    </Frame>
  )
}
