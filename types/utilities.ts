import type { Key } from "react"

/** Collapses an intersection or mapped type into one flat list of properties, for readable hovers and errors. */
export type Simplify<T> = {
  [KeyType in keyof T]: T[KeyType]
}

/**
 * The attributes `Given` passes, typed as in `Known` (React's `key` too), plus `Known`'s required attributes. Any other
 * attribute is typed as a message no JSX value matches, so the error reads "fill-red-55 is not a Frame attribute". A
 * component taking `p: KnownOnly<Known, Given, Name>` makes a misspelled flag an error, which TypeScript otherwise
 * skips for hyphenated JSX attributes; `Given` is inferred from the attribute names through the mapped keys. The
 * message is an object, not a string: a string literal would conflict with the attribute's own `true` and collapse the
 * props to `never`. Only the required attributes are added, not all of `Known`: intersecting a Figma-flag type per use
 * is several times slower to check. For the same reason the parameter isn't `Given & KnownOnly<…>`: TypeScript then
 * relates every one of `Known`'s thousands of flags to `Given`'s constraint, which made checking one Frame take
 * about half a second. Constrain `Given` with `KnownAttributes<Known>` so editors still suggest `Known`'s attributes.
 */
export type KnownOnly<Known, Given, Name extends string> = {
  [key in keyof Given]: key extends keyof Known
    ? Known[key]
    : key extends "key"
      ? Key | null
      : string extends key
        ? unknown
        : { "unknown attribute": `${key & string} is not a ${Name} attribute` }
  // biome-ignore lint/complexity/noBannedTypes: `{}` extends exactly the optional attributes, the cheapest required-key test.
} & { [key in keyof Known as {} extends Pick<Known, key> ? never : key]: Known[key] }

/**
 * The constraint for a `KnownOnly` component's `Given`: editors suggest attributes from it, so it lists `Known`'s. The
 * `Record` half lets `Given` be inferred from any attributes, so an unknown one still reaches `KnownOnly` and errors.
 * Both halves are intersected rather than joined in a union, and `Known`'s attributes are `unknown` here (`KnownOnly`
 * types them): relating each element's attributes to a union with thousands of typed flags was most of an app's check
 * time. When there is nothing to infer `Given` from (only required attributes, or only an inline handler), it is this
 * constraint, whose index signature `KnownOnly` maps to `unknown`, so that case still type-checks the attributes.
 */
export type KnownAttributes<Known> = { [key in keyof Known]?: unknown } & Record<string, unknown>
