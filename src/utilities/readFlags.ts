import { FLAG_PREFIXES, FLAGS, type FlagSet } from "../maps"

// Bundlers replace `process.env.NODE_ENV` with a literal (Next.js, Metro, Vite), which drops the misspelled-flag check
// from production builds. Declared here rather than globally because the consumers that have Node's types would clash
// with a global declaration.
declare const process: { env: { NODE_ENV?: string } }

// One parse per props object: a component calls its helpers one after another with the same props, so only the first
// walks them and the rest hit this one-entry cache. A WeakMap would also cover interleaved props objects, but its
// insert costs more than the whole parse; the cost of this one is keeping the last props object alive.
let lastProps: object | undefined
let lastFlags: FlagSet = {}

// Each misspelled flag is reported once, not on every render.
const REPORTED = new Set<string>()

/**
 * Read the token-derived flags a props object sets, one per group, by walking its keys once and looking each up in
 * FLAGS. Returns a shared object; never mutate it.
 *
 * TypeScript doesn't check JSX attribute names that contain a hyphen, and every flag has one, so a misspelled flag
 * (`fill-red-55`) compiles and would be silently ignored. Outside production builds, a prop that starts like a flag
 * but isn't one is logged instead.
 * @example readFlags({ "padding-4": true, "fill-red-500": true }) // { padding: { className: "p-4", … }, fill: { … } }
 */
export const readFlags = (p: object): FlagSet => {
  if (p === lastProps) return lastFlags

  const flags: FlagSet = {}

  for (const key in p) {
    if (!(p as Record<string, unknown>)[key]) continue

    const flag = FLAGS.get(key)

    if (flag === undefined) {
      if (process.env.NODE_ENV !== "production") reportUnknown(key)
      continue
    }

    // Flags within a group are mutually exclusive; if several are set anyway, the first one wins.
    if (flag.group !== "other") (flags as Record<string, typeof flag>)[flag.group] ??= flag
  }

  lastProps = p
  lastFlags = flags

  return flags
}

const reportUnknown = (key: string) => {
  const dash = key.indexOf("-")

  if (dash === -1 || !FLAG_PREFIXES.has(key.slice(0, dash)) || REPORTED.has(key)) return

  REPORTED.add(key)
  console.warn(`unison-components – unknown flag "${key}"`)
}
