import type { Key } from "react"

/** Collapses an intersection or mapped type into one flat list of properties, for readable hovers and errors. */
export type Simplify<T> = {
  [KeyType in keyof T]: T[KeyType]
}

/**
 * The attributes `Given` passes, typed as in `Known` (React's `key` too), plus `Known`'s required attributes. Any other
 * attribute is typed as a message no JSX value matches, so the error reads "fill-red-55 is not a Frame attribute". A
 * component taking `p: Given & KnownOnly<Known, Given, Name>` makes a misspelled flag an error, which TypeScript
 * otherwise skips for hyphenated JSX attributes. The message is an object, not a string: a string literal would
 * conflict with the attribute's own `true` and collapse the props to `never`. Only the required attributes are added,
 * not all of `Known`: intersecting a Figma-flag type per use is several times slower to check.
 */
export type KnownOnly<Known, Given, Name extends string> = {
  [key in keyof Given]: key extends keyof Known
    ? Known[key]
    : key extends "key"
      ? Key | null
      : { "unknown attribute": `${key & string} is not a ${Name} attribute` }
} & { [key in keyof Known as Known extends Required<Pick<Known, key>> ? key : never]: Known[key] }
