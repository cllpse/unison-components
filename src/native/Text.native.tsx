import TextBase, { type Text as TextType } from "../base/Text.base"
import type { StyleNative } from "../types/elementProperties"

export type Text = Omit<TextType, "_STYLE"> & {
  _STYLE?: StyleNative
}

export default (p: Text) => {
  const { children, ...rest } = p

  return <TextBase {...rest}>{children}</TextBase>
}
