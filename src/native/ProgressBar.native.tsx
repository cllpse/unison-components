import ProgressBar, { type ProgressBar as ProgressBarType } from "../base/ProgressBar.base"

export default (p: ProgressBarType) => {
  return <ProgressBar progress={p.progress} />
}
