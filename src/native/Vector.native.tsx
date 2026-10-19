import type { KnownOnly } from "../../types/utilities"
import VectorBase, { type Vector as VectorType } from "../base/Vector.base"

export type Vector = VectorType

export default <Given,>(p: Given & KnownOnly<Vector, Given, "Vector">) => <VectorBase {...(p as Vector)} />
