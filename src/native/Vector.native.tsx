import VectorBase, { type Vector as VectorType } from "../base/Vector.base"

export type Vector = VectorType

export default (p: Vector) => {
  return <VectorBase {...p} />
}
