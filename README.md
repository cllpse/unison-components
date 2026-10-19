# Frame

This library is shared between web and native (iOS/Android) using platform extensions.

Only files ending with _".web.tsx / .web.ts"_ can be used on web, and only files ending with _".native.tsx / .native.ts"_ can be used on native.

Base files (_".base.tsx / .base.ts"_) should never be directly consumed.


## Platform specificity

Platform-specific extensions are thin shells which wraps base components.

As an example; the Frame component is exposed to native through _"Frame.native.tsx"_ and to web through _"Frame.web.tsx"_.

Because native uses the React Native Reanimated library for animations (a library which is React Native exclusive, and does not compile to web); _"Frame.native.tsx"_ injects animations into the base component and returns it, whereas _"Frame.web.tex"_ just returns the base component - thereby allowing platform-specific augmentations.

A base component should always be able to compile to both web and iOS/Android.

## Active development

Watch for local file changes, and copy them directly to the _unison-components_ submodule in _../unison-plugin/_ or _../unison-playground-web/_.

```sh
bun run components:sync-manual:plugin
bun run components:sync-watch:plugin
bun run components:sync-manual:playground-web
bun run components:sync-watch:playground-web
```

## Tailwind

Consumers import _dist/tailwind.css_ from their Tailwind 4 entry stylesheet (web, or Uniwind on iOS and Android):

```css
@import "./unison-components/dist/tailwind.css";
```

It carries every token as a Tailwind theme value (colors, spacing, radius, shadows, text sizes and weights), so the
library's classes take the tokens' values, plus a `@source` for the library's files and a safelist of the class names
the library builds at runtime. It is generated from the tokens; rerun and commit it after changing them:

```sh
bun run tailwind:css
```

`bun run tailwind:css:watch` regenerates _dist/tokens.ts_ and the stylesheet on every change to _dist/tokens.json_,
`src/constants/` or the generators.

In dark mode (`@variant dark`, read by Tailwind as `prefers-color-scheme` and by Uniwind as its dark theme) the colors
take the tokens' Dark values.

## Type checking

```sh
bun run typecheck
```

## Releasing

Normal git flow applies; create feature branch, create pull request, merge pull request.

## Figma variables

_dist/tokens.json_ holds every Figma variable and is read-only. Its top-level keys are the collections,
then each collection's modes; a mode holds its tokens in the format of Figma's own export (below). Names are flat (no
`/` groups):

| Collection | Modes       | Variables                                                                               |
| ---------- | ----------- | --------------------------------------------------------------------------------------- |
| colors     | Light, Dark | Tailwind's palette (`fill-red-500`) plus the project's own neutrals                          |
| units      | Default     | `spacing-<unit>`, `radius-<name>` and `container-<name>` (Tailwind's container widths, in px) |
| typography | Default     | Tailwind's `font-size-<name>`, `line-height-<name>` and `font-weight-<name>`            |
| shadows    | Default     | Tailwind's box shadows, `shadow-<name>-<layer>-<offset-x, offset-y, blur, spread, color>` |

To import them into Figma, press the plugin's import button (next to back and refresh) and pick
_tokens.json_: it creates the four collections in one go, with each variable's scopes and number variables in
value order, then the `shadow-<name>` effect styles and `text-<size>` text styles bound to them. Importing again
updates everything in place.

_dist/tokens.ts_ is the same file as TypeScript, generated with `bun run tokens:ts`; commit it with _tokens.json_. It
is the library's only source of design values: `COLORS`, `UNITS`, `RADII`, `SHADOWS` and `TEXT_SIZES` in
`src/constants/` are derived from it, and so are the flags. It's exported as `TOKENS`, keyed by collection, mode and
Figma's variable name, with exact types:

```ts
import { TOKENS } from "./unison-components/dist/web"

TOKENS.colors.Dark["fill-neutral-50"] // "#161616"
TOKENS.units.Default["spacing-4"] // 16
TOKENS.typography.Default["line-height-sm"] // 20
```

The unit names are the ones the plugin resolves to flags, which match on the last part of the name: `spacing-1p5` to
`padding-1p5`, `radius-lg` to `corner-radius-lg`. Fractions use `p`, since a token name can't contain a dot.

A shadow can't be bound to one variable, so the plugin reads it from its effect style's name (`shadow-md` to
`effect-shadow-md`), and a text style named `text-<size>` gives `typography-<size>`.

### Export format

As Figma's native variable export writes it, one file per mode:

- **Standard**: W3C Design Tokens (DTCG). Each token has `$type` and `$value`; Figma-specific data lives under
  `$extensions` with `com.figma.*` keys.
- **One file per mode**: the file is named after the mode (`Light.tokens.json`) and repeats it at the root as
  `$extensions["com.figma.modeName"]`. Every file has the same variable names; only the values differ.
- **Collection**: not written to the file. You pick the collection when importing.
- **Names**: the variable name is the key, as named in Figma (`neutral-50`, flat, with a dash). A Figma name with slashes
  (`color/neutral/50`) would export as nested groups (`{"color": {"neutral": {"50": {...}}}}`) instead.
- **Numbers**: `$type: "number"` with a plain `$value` (`16`), in pixels.
- **Colors**: `$type: "color"`, and `$value` is an object: `colorSpace` (`"srgb"`), `components` (red, green and blue as
  0 to 1 floats), `alpha` (0 to 1) and `hex` (`"#F9F9F9"`, uppercase, no alpha).
- **Identity**: `com.figma.variableId` (`"VariableID:1:4"`) is the variable's id in the source file, the same in every
  mode. On import, a matching id updates that variable; a token without one creates a new variable.
- **Scopes**: `com.figma.scopes`, a list of Figma scopes (`["ALL_SCOPES"]`, `["GAP"]`, `["FONT_SIZE"]`).
- **Not in this export**: aliases (a DTCG alias would be a `$value` of `"{neutral-50}"`), code syntax, descriptions and
  hidden-from-publishing flags.
