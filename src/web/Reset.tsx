import type { ViewProps } from "react-native"
import Frame from "./Frame.web"

type Reset = {
  children?: ViewProps["children"]
}

export default (p: Reset) => {
  return (
    <div className="frame__reset p-4">
      <Frame flow-vertical width-fill height-fill alignment-top-left>
        {p.children}
      </Frame>
    </div>
  )
}
