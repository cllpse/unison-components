import VectorBase, { type Vector as VectorType } from "../base/Vector.base"

export type Vector = VectorType

export default (p: Vector) => {
  const { className, ...rest } = p

  return <VectorBase className={`frame__vector ${className ?? ""}`} {...rest} />
}
