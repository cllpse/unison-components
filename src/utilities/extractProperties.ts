/**
 * Splits an object into `fromType` (the keys of `Base`) and `rest` (everything
 * else), with the property list checked against `Base` at compile time.
 *
 * `Base` is the explicit type argument; the property names live in the runtime
 * slot because type arguments are erased and the split needs real values. The
 * signature keeps that list exhaustive and exact against `Base`:
 *   - forget a key of `Base`     -> compile error (the missing key is named)
 *   - pass a key not in `Base`   -> compile error
 *   - `rest` is `Omit<Source, keyof Base>`, so it can never carry a `Base`
 *     property into a `{...rest}` spread.
 *
 * @example
 * const { fromType, fromRest } = extractProperties<Base>()(p, ["color", "active", "onChange"])
 *
 * return <_Button {...fromRest}>{fromType.active ? "on" : "off"}</_Button>
 */
type MissingKey<Base, K extends readonly (keyof Base)[]> = Exclude<keyof Base, K[number]>

type OnlyBaseKeys<Base, K extends readonly (keyof Base)[]> = {
  readonly [I in keyof K]: K[I] extends keyof Base ? K[I] : never
}

/**
 * The expected `properties` type. Reports both ends of a mismatch:
 *   - any element that isn't a key of `Base` collapses to `never` (wrong key)
 *   - any unlisted key of `Base` is appended as a required element (missing key)
 */
type ValidateKeys<Base, K extends readonly (keyof Base)[]> = [MissingKey<Base, K>] extends [never]
  ? OnlyBaseKeys<Base, K>
  : readonly [...OnlyBaseKeys<Base, K>, MissingKey<Base, K>]

export const extractProperties =
  <Base extends object>() =>
  <Source extends Base, const K extends readonly (keyof Base)[]>(
    object: Source,
    properties: ValidateKeys<Base, K>,
  ): { fromType: Pick<Source, keyof Base>; fromRest: Omit<Source, keyof Base> } => {
    const fromType = {} as Record<string, unknown>
    const rest = {} as Record<string, unknown>
    const picked = properties as readonly PropertyKey[]

    for (const key in object) {
      if (picked.includes(key)) {
        fromType[key] = (object as Record<string, unknown>)[key]
      } else {
        rest[key] = (object as Record<string, unknown>)[key]
      }
    }

    return {
      fromType: fromType as Pick<Source, keyof Base>,
      fromRest: rest as Omit<Source, keyof Base>,
    }
  }
