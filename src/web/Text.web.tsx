import type { KnownAttributes, KnownOnly } from "../../types/utilities"
import TextBase, { type Text as TextType } from "../base/Text.base"

export type Text = TextType

// - `[overflow-wrap:anywhere]`: RNW Text defaults to `word-wrap: break-word`, which prefers spaces but does not affect
//   min-content, so long tokens overflow hug/flex parents. `anywhere` keeps the soft-wrap preference while allowing
//   last-resort breaks (and participates in min-content). `word-wrap` is an alias of `overflow-wrap`, so one class
//   overrides RNW's reset.
const TEXT_CLASSES = ["unison-components__text", "[overflow-wrap:anywhere]"].join(" ")

export default <Given extends KnownAttributes<Text>>(p: KnownOnly<Text, Given, "Text">) => {
  const { className, ...rest } = p as Text

  return <TextBase {...rest} className={className ? `${TEXT_CLASSES} ${className}` : TEXT_CLASSES} />
}
