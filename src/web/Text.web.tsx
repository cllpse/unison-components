import TextBase, { type Text as TextType } from "../base/Text.base"

export type Text = TextType

export default (p: Text) => {
  const { children, className, ...rest } = p

  return (
    // RNW Text defaults to `word-wrap: break-word`, which prefers spaces but does not affect min-content, so long tokens
    // overflow hug/flex parents. `anywhere` keeps the soft-wrap preference while allowing last-resort breaks (and
    // participates in min-content). `word-wrap` is an alias of `overflow-wrap`, so one class overrides RNW's reset.
    <TextBase className={`unison-components__text [overflow-wrap:anywhere] ${className ?? ""}`} {...rest}>
      {children}
    </TextBase>
  )
}
