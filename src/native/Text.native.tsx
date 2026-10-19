import TextBase, { type Text as TextType } from "../base/Text.base"

export type Text = TextType

export default (p: Text) => <TextBase {...p} />
