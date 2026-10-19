import type { KnownAttributes, KnownOnly } from "../../types/utilities"
import VectorBase, { type Vector as VectorType } from "../base/Vector.base"

export type Vector = VectorType

const VECTOR_CLASSES = "unison-components__vector"

export default <Given extends KnownAttributes<Vector>>(p: Given & KnownOnly<Vector, Given, "Vector">) => {
  const { className, ...rest } = p as Vector

  return <VectorBase {...rest} className={className ? `${VECTOR_CLASSES} ${className}` : VECTOR_CLASSES} />
}
