# Frame

Cross-platform React component library (web via React Native Web, iOS/Android via React Native) whose props mirror
Figma's design vocabulary. See README.md for the platform-extension model.

## Commands

- `bun install` — bun is the package manager; never add npm/yarn lockfiles
- `bun run typecheck` — `tsc --noEmit`; must pass before committing
- `bunx biome check --write .` — format, lint and organize imports; must pass before committing

## Architecture

- `src/base/*.base.tsx` — the component itself, built only from React Native primitives (`View`, `Pressable`, `Text`)
  so it compiles for both platforms. Never imported by consumers.
- `src/web/*.web.tsx` / `src/native/*.native.tsx` — thin platform shells that wrap the base component. Platform-only
  libraries (e.g. `react-native-reanimated`) may only be imported here.
- Shells inject platform-specific elements through `element*` `ReactNode` slots on the base props (e.g.
  `elementAnimatedView`) rather than branching inside the base. Small platform differences inside shared code use
  `Platform.select` / `Platform.OS`.
- `web/index.ts` / `native/index.ts` are the public entry points. Every public export is listed there, sorted by
  path.
- `src/types` — prop and return types; `src/constants` — design tokens; `src/utilities` — pure helpers.

## Props: Figma flags

- Styling props are boolean flags named in kebab-case after Figma: `flow-horizontal`, `width-fill`, `padding-4`,
  `corner-radius-full`, `fill-primary-500`, `typography-body-wrap`. Prefer adding a flag over a value prop.
- Flag types live in `src/types/FigmaProperties.ts` as `Figma<Thing>` types. Generate them from the tokens with
  mapped template-literal types (`UnitsFlags<"gap-">`, `Color<"fill-">`) instead of hand-writing every key.
- A component's props type is an intersection of `Figma*` types plus a `{ … }` block for regular props, and is
  exported under the component's name (`export type Frame = FigmaFrameFlow & … & { … }`).
- Flags within a group are mutually exclusive; set at most one.
- Unit keys follow the Tailwind scale. Fractional units use `p` (`0p5`, `1p5`); `05` is deprecated. Keys that are
  not on Tailwind's default scale map through `UNITS_TAILWIND`.

## Computing styles

- Each flag group has a helper named `<Component>Compute<Group>` (`FrameComputePadding`, `TextComputeTypography`,
  `ElementComputePointerEvents`). Helpers return `FigmaPropertiesReturn` (`{ styles?, className? }`): Tailwind
  classes, plus inline `styles` where a numeric value or a guaranteed override is needed.
- When a group is required, return `FigmaPropertiesReturnError` with
  `{ error: '<Text /> – missing "typography-" property' }` (en dash).
- Write helpers as a flat series of guard clauses: `if (p["flag"]) return { … }`, then a final fallback return.
  Return empty values (`{ styles: {}, className: "" }`) rather than `undefined`.
- Base components collect results into a `styles` array and a `classes` array (`""` for absent entries), then pass
  them to the primitive as `style={[styles, { $$css: true, className: classes.join(" ") }]}` with a
  `// @ts-expect-error` on `$$css` (React Native Web's className passthrough).
- Use `style`, not Tailwind classes, to override React Native Web's reset: inline styles win deterministically,
  classes depend on CSS source order.
- Web shells add a BEM-style root class: `frame__<component>` (`frame__frame`, `frame__text`).
- Utilities on the render path must not allocate or build strings per call; memoize on first use and return shared
  frozen objects (see `computeColor` / `extractColor`).

## TypeScript

- `type`, not `interface` (the only exception is module augmentation in `global.d.ts`).
- Type-only imports use `import type` or inline `type` specifiers.
- Token objects are `as const` and named in `SCREAMING_SNAKE_CASE` (`COLORS`, `UNITS`). Derive types from them
  (`keyof typeof UNITS`, `ColorName`) instead of duplicating literals.
- Make invalid flag combinations compile errors (overloads, conditional types) rather than runtime checks.
- Keep casts local, typically for indexing with computed flag keys (`` p[`width-${key}` as keyof Frame] ``) or
  React Native Web type gaps. Suppress lint/type errors one line at a time (`// @ts-expect-error`,
  `// biome-ignore <rule>: <reason>`).
- Avoid `any` (Biome flags it); `noImplicitAny` is on.

## Code style

Biome enforces the formatting: 2-space indent, 120-column lines, double quotes, no semicolons, sorted imports.
Beyond that:

- Arrow functions only. Components are anonymous default exports, `export default (p: Frame) => { … }`; everything
  else is a named `export const`.
- The props parameter is `p`. Destructure what you transform and spread the rest:
  `const { children, className, style, ...rest } = p`.
- When importing a component alongside its props type, alias the type: `import FrameBase, { type Frame as
  FrameType } from "../base/Frame.base"`.
- Relative imports only; `src/*` and `@frame/*` paths are blocked by Biome.
- One concern per file in `src/utilities`, with the file named after its main export (`computeColor.ts` exports
  `computeColor`).
- Leave a blank line before the final `return` and between logical blocks; one-line `if (…) return …` guards may be
  stacked without blank lines.
- No `useMemo` / `useCallback` / `React.memo`: consuming apps run React Compiler.

## Comments and docs

- Comments explain *why*, especially browser, React Native Web and flexbox quirks, in full sentences, and name the
  mechanism (e.g. the RNW `View` reset forcing `min-width: 0`).
- Exported tokens, utilities and non-obvious types get JSDoc, with `@example` showing input → output.
- `@deprecated` marks both deprecated APIs and internal escape hatches. Escape hatches are also `_`-prefixed (the
  `_STYLE` prop, `_Component` files). Using one is allowed, but call it out.
- TODOs are attributed: `@todo @cllpse: …`.

## Git

- Feature branch + pull request; don't commit to `main`.
- Imperative, sentence-case subjects (`Remove darken and lighten colors`); one concern per commit.
