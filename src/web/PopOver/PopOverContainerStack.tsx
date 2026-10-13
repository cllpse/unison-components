import Frame from "../Frame.web"
import _PopOverContainerStack, {
  type _PopOverContainerStack as _PopOverContainerStackType,
} from "./_PopOverContainerStack"

export type PopOverContainerStack = {
  panes: _PopOverContainerStackType["panes"]
  paneId: _PopOverContainerStackType["paneId"]
  onPaneIdChange: _PopOverContainerStackType["onPaneIdChange"]
  onDismiss: _PopOverContainerStackType["onDismiss"]
  onAccept: _PopOverContainerStackType["onAccept"]
}

export default (p: PopOverContainerStack) => (
  <Frame
    alignment-top-left
    corner-radius-6
    height-hug
    flow-vertical
    width-fill
    fill-white
    stroke-neutral-300
    stroke-hover-neutral-400
    className="frame__popover-container-stack select-none w-fit min-w-[220px] max-w-[260px]"
    effect-shadow-large
    style={{ padding: 1 }}
  >
    <_PopOverContainerStack {...p} />
  </Frame>
)
