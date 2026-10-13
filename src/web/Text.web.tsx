import type { CSSProperties } from "react"
import TextBase, { type Text as TextType } from "../base/Text.base"

export type Text = TextType

export default (p: Text) => {
  const { children, className, style, ...rest } = p

  return (
    <TextBase
      // RNW Text defaults to `wordWrap: 'break-word'`, which prefers spaces but
      // does not affect min-content — long tokens overflow hug/flex parents.
      // `anywhere` keeps soft-wrap preference while allowing last-resort breaks
      // (and participates in min-content). Set via `style` so it overrides RNW's
      // atomic class (Tailwind classes lose that cascade fight).
      style={{
        ...style,
        overflowWrap: "anywhere",
        // RNW types omit `"anywhere"` even though it's valid CSS for `word-wrap`.
        wordWrap: "anywhere" as CSSProperties["wordWrap"],
      }}
      className={`frame__text ${className ?? ""}`}
      {...rest}
    >
      {children}
    </TextBase>
  )
}
