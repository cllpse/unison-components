import type { KnownOnly } from "../../types/utilities"
import TextBase, { type Text as TextType } from "../base/Text.base"

export type Text = TextType

export default <Given,>(p: Given & KnownOnly<Text, Given, "Text">) => <TextBase {...(p as Text)} />
