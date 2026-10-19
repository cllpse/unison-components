import TextBase, { type Text as TextType } from "../base/Text.base"

export type Text = TextType

// - `[overflow-wrap:anywhere]`: RNW Text defaults to `word-wrap: break-word`, which prefers spaces but does not affect
//   min-content, so long tokens overflow hug/flex parents. `anywhere` keeps the soft-wrap preference while allowing
//   last-resort breaks (and participates in min-content). `word-wrap` is an alias of `overflow-wrap`, so one class
//   overrides RNW's reset.
// - `[&_a]…`: nested `<a>` elements only exist in the DOM; React Native has no anchor element to style.
const TEXT_CLASSES = [
  "unison-components__text",
  "[overflow-wrap:anywhere]",
  "[&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-current",
  "[&_a]:transition-[text-decoration-color] [&_a]:duration-[120ms] [&_a]:ease-out",
  "[&_a:hover]:decoration-[color-mix(in_oklab,currentColor_0%,transparent)]",
].join(" ")

export default (p: Text) => {
  const { className, ...rest } = p

  return <TextBase {...rest} className={className ? `${TEXT_CLASSES} ${className}` : TEXT_CLASSES} />
}
