import type { KnownAttributes, KnownOnly } from "../../types/utilities"
import TextBase, { type Text as TextType } from "../base/Text.base"

export type Text = TextType

export default <Given extends KnownAttributes<Text>>(p: KnownOnly<Text, Given, "Text">) => <TextBase {...(p as Text)} />
