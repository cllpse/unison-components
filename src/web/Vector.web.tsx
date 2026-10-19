import VectorBase, { type Vector as VectorType } from "../base/Vector.base"

export type Vector = VectorType

const VECTOR_CLASSES = "unison-components__vector"

export default (p: Vector) => {
  const { className, ...rest } = p

  return <VectorBase {...rest} className={className ? `${VECTOR_CLASSES} ${className}` : VECTOR_CLASSES} />
}
