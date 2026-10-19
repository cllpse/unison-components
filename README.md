# unison-components

A React Native component library whose props mirror Figma's design vocabulary. It renders on web through React Native
Web and on iOS and Android through React Native, and it is the code the Unison Figma plugin generates against. Three
components are public: `Frame`, `Text` and `Vector`.

## Requirements

- [Bun](https://bun.sh) 1.4.3
- Tailwind 4 in the consuming app (Uniwind on iOS and Android)

```sh
bun install
```

## Using the library

Install it from npm, with its peer dependencies (`react`, `react-native` and `react-native-svg`; React Native Web on web):

```sh
bun add unison-components
```

Import the components from `unison-components`. Metro picks the iOS and Android build through the `react-native` export
condition and every other bundler the web build; `unison-components/web` and `unison-components/native` name one
explicitly. Nothing else in the library is public, except `maps`, `types/figma`, `design-tokens` and `design-tokens.json`,
which the Figma plugin reads. Then import the generated stylesheet from the app's Tailwind entry stylesheet:

```css
@import "unison-components/tailwind.css";
```

The package is compiled JavaScript with type declarations, so consumers need no transpiling and no build step for the
stylesheet.

Consumers that still add the library as a git submodule wire up a `@unison` path alias for
_unison-components/dist/web_ (web) or _unison-components/dist/native_ (iOS and Android) and import
_./unison-components/dist/tailwind.css_ instead. See
[unison-playground-web](https://github.com/cllpse/unison-playground-web) and
[unison-playground-expo](https://github.com/cllpse/unison-playground-expo) for working setups.

```tsx
import { Frame, Text, Vector } from "unison-components"

<Frame autolayout-vertical gap-4 padding-4 width-fill corner-radius-lg fill-white effect-shadow-md>
  <Text fill-black typography-lg>Hello</Text>
  <Vector path="M0 0h24v24H0z" viewBox="0 0 24 24" width-6 height-6 fill-red-500 />
</Frame>
```

## Flags

Styling is set with boolean, hyphenated flags named after Figma's properties. Components emit Tailwind classes only,
no inline styles.

- From the tokens: `fill-`, `fill-hover-`, `stroke-` and `stroke-hover-<color>` (`fill-red-500`, `fill-white`),
  `width-` and `height-<spacing>` (`width-4`), `width-<container>` (`width-md`), `padding-` and `gap-<spacing>` (with
  `-vertical`, `-horizontal` and per-side variants), `corner-radius-<radius>`, `effect-shadow-<shadow>` and
  `typography-<size>`.
- Fixed: `autolayout-horizontal` / `-vertical`, `width-fill` / `width-hug` (and `height-`), `alignment-<position>`,
  `stroke-style-dashed` / `-solid`, `typography-align-<side>`, `typography-decoration-underline`, `effect-shadow-none`
  and `pointer-events-none` / `-auto`.
- Set at most one flag per group; if several are set, the first wins.
- An unknown or misspelled flag (`fill-red-55`) is a type error, and outside production builds it is also logged.
- `Vector` takes `path`, `viewBox` and an optional `fillRule`, and needs both a `width-` and a `height-` flag.

Known gaps: there are no letter-spacing, line-height or font-family flags, and a `Vector` fill keeps its Light color in
dark mode.

## Design tokens

_dist/design-tokens.json_ is the source of truth for every design value in the library. Every token-derived flag above
is built from it, so adding, renaming or removing a token adds, renames or removes flags.

It is hand-maintained, in Figma's own variable export format (W3C Design Tokens), one top-level key per Figma
collection, then one key per mode:

| Collection | Modes       | Variables                                       | Flags                                            |
| ---------- | ----------- | ----------------------------------------------- | ------------------------------------------------ |
| colors     | Light, Dark | `fill-<hue>-<shade>`, `fill-<name>`             | `fill-`, `fill-hover-`, `stroke-`, `stroke-hover-` |
| units      | Default     | `spacing-<key>`, `radius-<name>`, `container-<name>` | `width-`, `height-`, `padding-`, `gap-`, `corner-radius-` |
| typography | Default     | `font-size-<size>`, `line-height-<size>`, `font-weight-<name>` | `typography-<size>`                 |
| shadows    | Default     | `shadow-<name>-<layer>-<offset-x, offset-y, blur, spread, color>` | `effect-shadow-<name>`        |

Rules the generator relies on:

- Color names are `fill-<hue>-<shade>` or `fill-<name>`; anything else stops the build. Light and Dark must hold the
  same names.
- Numbers are pixels. Fractions spell the dot as `p` (`spacing-1p5` gives `padding-1p5`), since a token name can't
  hold a dot.
- `spacing-full` is Figma's 999px stand-in for 100% (`width-full`), not a size.
- Every `font-size-<size>` needs a matching `line-height-<size>`.
- Names are flat: a `/` in a Figma name would export as nested groups.

The same file imports into Figma: press the plugin's import button and pick _design-tokens.json_. It creates or updates
the four collections, plus the `shadow-<name>` effect styles and `text-<size>` text styles the plugin reads shadows and
typography from.

### How it is consumed

Two generated files, both committed, carry the tokens into the library and its consumers:

1. `bun run generate:tokens` writes _dist/design-tokens.ts_: `TOKENS` (every collection and mode, values as hex or
   pixels, with exact types) and the scales the components read (`COLORS`, `SPACING`, `RADIUS`, `CONTAINERS`,
   `SHADOWS`, `TEXT_SIZES`). The flag table in _maps/_ and the flag types in _types/_ are built from these scales.
2. `bun run generate:tailwind` writes _dist/tailwind.css_ from _dist/design-tokens.ts_ and _maps/_: every token as a
   Tailwind theme value, the Light and Dark colors as `@variant light` / `@variant dark` blocks, `@source` lines for the
   library's files and a safelist of every class a flag can produce (the classes are built at runtime, so Tailwind
   can't find them by scanning).

`TOKENS` can also be imported directly when an app needs a raw value:

```ts
import { TOKENS } from "./unison-components/dist/design-tokens"

TOKENS.colors.Dark["fill-white"] // "#000000"
TOKENS.units.Default["spacing-4"] // 16
```

### Changing tokens

1. Edit _dist/design-tokens.json_ (or export it from Figma).
2. Regenerate, in this order, since the stylesheet is built from the TypeScript:

   ```sh
   bun run generate:tokens
   bun run generate:tailwind
   ```

   Or keep both running while editing; the tailwind watcher picks up each new _design-tokens.ts_:

   ```sh
   bun run generate:tokens:watch
   bun run generate:tailwind:watch
   ```

3. Run `bun run typecheck`: a removed or renamed token turns every place that still uses its flag into a type error.
4. Commit _design-tokens.json_, _design-tokens.ts_ and _tailwind.css_ together.
5. Move the consumers' submodules to the new commit (or sync them, below).

From the parent [unison](https://github.com/cllpse/unison) repository the same scripts run as
`bun run components:<script>`.

## Platform files

Files under _src/_ use platform extensions: _.web.tsx_ is used only on web, _.native.tsx_ only on iOS and Android, and
_.base.tsx_ is shared by both and never imported directly. The platform files are thin shells around the base
component, so platform-only libraries (such as React Native Reanimated) stay out of the shared code.

## Scripts

- `bun run build` / `build:watch` - compile the library into _build/_, the folder the npm package ships
- `bun run generate:tokens` / `generate:tokens:watch` - write _dist/design-tokens.ts_ from _dist/design-tokens.json_
- `bun run generate:tailwind` / `generate:tailwind:watch` - write _dist/tailwind.css_ from the tokens and _maps/_
- `bun run components:sync-manual:plugin` / `components:sync-watch:plugin` - copy the library into
  _../unison-plugin/unison-components_ once, or on every change
- `bun run components:sync-manual:playground-web` / `components:sync-watch:playground-web` - the same for
  _../unison-playground-web/unison-components_
- `bun run lint` - Biome check
- `bun run format` - Biome format, writing changes
- `bun run typecheck` - `tsc --noEmit`

## Publishing

Log in once per machine with `npm login` (`bun publish` reads the same credentials). Then release with one command:

```sh
bun run release:patch   # 0.1.0 -> 0.1.1
bun run release:minor   # 0.1.0 -> 0.2.0; below 1.0, use it for a breaking flag or prop change
bun run release:major   # 0.1.0 -> 1.0.0
```

Each one checks the npm login, typechecks and lints, bumps the version in a `Release <version>` commit with a
`v<version>` tag, builds and publishes, and pushes the commit and tag. It needs a clean working tree. If publishing fails
after the bump, fix the cause and run `bun publish && git push --follow-tags`. Check what will ship with
`bun run build && npm pack --dry-run`.
