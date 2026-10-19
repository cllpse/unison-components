# unison-components

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
- Platform-specific behavior belongs in the shells; small platform differences inside shared code use
  `Platform.select` / `Platform.OS`.
- `dist/web.ts` / `dist/native.ts` are the public entry points. Every public export is listed there, sorted by
  path. `dist/` also holds the generated `design-tokens.ts` and `tailwind.css`;
  consumers import only from `dist/`. `bun run build` compiles everything into the git-ignored `build/`, which is what
  the npm package ships (see `exports` in `package.json`).
- `dist/design-tokens.ts` — generated from `dist/design-tokens.json`, the only source of design values (never hard-code one), by
  `bun run generate:tokens`: `TOKENS`, plus the scales under their public names (`COLORS`, `SPACING`, `RADIUS`, `CONTAINERS`,
  `SHADOWS`, `TEXT_SIZES`) and their types. Import the scales from there directly. Runtime code reads only the
  scales, so `TOKENS` (both modes, shadow layers, typography) stays out of app bundles unless a consumer imports it.
- `types` — prop and return types; `maps` — the flag table built from the scales (`FLAGS`);
  `utilities` — pure helpers.

## Props: Figma flags

- Styling props are boolean flags named in kebab-case after Figma: `autolayout-horizontal`, `width-fill`, `padding-4`,
  `corner-radius-full`, `fill-red-500`, `typography-sm`. Prefer adding a flag over a value prop.
- Flag types live in `types/figma.ts` as `Figma<Thing>` types, built from the group lists in `maps`
  (`SPACING_GROUPS`, `RADIUS_GROUPS`, `COLOR_GROUPS`, `NAMED_FLAGS`) and the scales in `dist/design-tokens.ts` with mapped
  template-literal types (`SpacingFlags<"gap">`, `ColorFlags<"fill">`, `NamedFlags<"alignment">`). Never hand-write a
  flag name there; add it to `maps` and it is typed, read, safelisted and checked from one place.
- A component's props type is an intersection of `Figma*` types plus a `{ … }` block for regular props, and is
  exported under the component's name (`export type Frame = FigmaFrameAutolayout & … & { … }`).
- Flags within a group are mutually exclusive; set at most one. If several are set anyway, the first in props order wins.
- Every token-derived flag is a key of `FLAGS` (`maps/index.ts`), with the class it produces. A new
  token-derived flag group goes there too, so it is read, safelisted and checked like the others.
- TypeScript does not check JSX attribute names that contain a hyphen, so the platform shells are generic over the
  props they are given and take `p: Given & KnownOnly<Component, Given, "Component">` (`types/utilities.ts`): a
  misspelled flag (`fill-red-55`) is a type error. `readFlags` also logs such props outside production builds, for
  untyped callers.
- Unit keys are the tokens' `spacing-` names. Fractional units use `p` (`0p5`, `1p5`); keys whose Tailwind suffix
  differs from the key map through `SPACING_TAILWIND`.
- Corner radius uses the tokens' `radius-` names from `RADIUS` (`corner-radius-lg`), not the spacing keys. Shadows are
  the tokens' `shadow-` names from `SHADOWS` (`effect-shadow-md`), text sizes their `font-size-` names
  (`typography-sm`).

## Computing styles

- Each flag group has a helper named `compute<Component><Group>` (`computeFramePadding`, `computeTextTypography`,
  `computeElementPointerEvents`). Helpers return `PropertiesResult` (`{ styles?, className? }`, from
  `types/base.ts`): Tailwind classes, with inline `styles` only for what a class cannot express (a
  native-only style such as `FONT_FEATURE_STYLE`). iOS and Android get their styling from the classes through Uniwind.
- Base components pass the joined classes both in the `$$css` style object (React Native Web) and as the `className`
  prop (Uniwind on iOS and Android; React Native Web drops it).
- Missing or unusable flags fail silently: a helper returns its empty result, never an error or a throw.
- Helpers for token-derived groups read the props through `readFlags(p)`, which walks the props once per render and
  looks each key up in `FLAGS`; never probe a scale by building `` `${prefix}${key}` `` for every key. Helpers for
  fixed flags are a flat series of guard clauses: `if (p["flag"]) return …`, then a final fallback return.
- Helpers return shared frozen results, never `undefined` and never a fresh object: the module's `EMPTY`, a frozen
  constant, or `result(className)`, which caches by class name. Combinations (sizing, stroke style) are cached
  per flag object in a `Map`.
- Base components join their classes with plain string code (`[...].filter(Boolean).join(" ")`, so absent entries
  leave no runs of spaces), then pass them to the primitive as `style={[p.style, { $$css: true, className }]}` with a
  `// @ts-expect-error` on `$$css` (React Native Web's className passthrough).
- Override React Native Web's reset (`min-*: 0`, `flex-shrink: 0`, `padding: 0`, `word-wrap: break-word`) with
  Tailwind classes, not `style`. They win because consumers import Tailwind's utilities unlayered, and React Native Web
  inserts its stylesheet first in `<head>` (see unison-playground-web's `globals.css`). Use arbitrary values or
  properties that also exist in Tailwind 3 (`min-w-[auto]`, `[overflow-wrap:anywhere]`). Classes built from tokens at
  runtime are safelisted from `FLAGS` (`flagClasses`) by `scripts/generateTailwind.ts`; rerun
  `bun run generate:tailwind` and commit `dist/tailwind.css`.
- Web shells add a BEM-style root class: `unison-components__<component>` (`unison-components__frame`, `unison-components__text`).
- Utilities on the render path must not allocate or build strings per call; cache on first use and return shared
  frozen objects (see `computeProperties.ts`).

## TypeScript

- `type`, not `interface` (the only exception is the module augmentation in `types/base.ts`).
- Never use `Props` in a type name, including aliases of library types (`ViewProps as ReactNativeViewProperties`).
- Type-only imports use `import type` or inline `type` specifiers.
- Token objects are `as const` and named in `SCREAMING_SNAKE_CASE` (`COLORS`, `SPACING`). Derive types from them
  (`keyof typeof SPACING`, `ColorName`, `ColorNameAndShade`) instead of duplicating literals. Token names are split into
  scales by `scripts/generateTokens.ts`, not parsed with `infer`, so the types and runtime agree by construction.
- `SPACING.full` is Figma's 999px stand-in for 100%, not a size; read pixel values through `SpacingPixelKey`.
- Make invalid flag combinations compile errors (overloads, conditional types) rather than runtime checks.
- Keep casts local, typically for indexing with computed flag keys (`` p[`width-${key}` as keyof Frame] ``) or
  React Native Web type gaps. Suppress lint/type errors one line at a time (`// @ts-expect-error`,
  `// biome-ignore <rule>: <reason>`).
- Avoid `any` (Biome flags it); `noImplicitAny` is on.

## Code style

Biome enforces the formatting: 2-space indent, 120-column lines, double quotes, no semicolons, sorted imports.
Beyond that:

- Naming: PascalCase for components, component files (`Frame.base.tsx`) and types; camelCase for all other files
  and for functions, verb first (`computeFramePadding`, `readFlags`); `SCREAMING_SNAKE_CASE`
  for module-level constants (`COLORS`, `FONT_FEATURE_STYLE`).
- Arrow functions only. Components are anonymous default exports, `export default (p: Frame) => { … }`; everything
  else is a named `export const`.
- The props parameter is `p`. Destructure what you transform and spread the rest:
  `const { children, className, style, ...rest } = p`.
- When importing a component alongside its props type, alias the type: `import FrameBase, { type Frame as
  FrameType } from "../base/Frame.base"`.
- Relative imports only; `src/*` and `@unison` paths are blocked by Biome.
- Files in `utilities` either hold one function and are named after it (`readFlags.ts`), or hold the `compute*`
  helpers (`computeProperties.ts`).
- Leave a blank line before the final `return` and between logical blocks; one-line `if (…) return …` guards may be
  stacked without blank lines.
- No `useMemo` / `useCallback` / `React.memo`: consuming apps run React Compiler.

## Comments and docs

- Comments explain *why*, especially browser, React Native Web and flexbox quirks, in full sentences, and name the
  mechanism (e.g. the RNW `View` reset forcing `min-width: 0`).
- Exported tokens, utilities and non-obvious types get JSDoc, with `@example` showing input → output.
- `@deprecated` marks both deprecated APIs and internal escape hatches. Escape hatches are also `_`-prefixed
  (`_Component` files). Using one is allowed, but call it out.
- TODOs are attributed: `@todo @cllpse: …`.

## Git

- Commit directly to `main` for now; no feature branches or pull requests. `unison-plugin` pins this repo as a
  submodule, so it must only point at commits on `main`.
- Imperative, sentence-case subjects (`Remove darken and lighten colors`); one concern per commit.
