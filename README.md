# unison-components

A React Native component library whose props mirror Figma's design vocabulary. It renders on web through React Native
Web and on iOS and Android through React Native, and it is the code the Unison Figma plugin generates against. Three
components are public: `Frame`, `Text` and `Vector`.

Part of [Unison](https://github.com/cllpse/unison), alongside
[unison-plugin](https://github.com/cllpse/unison-plugin),
[unison-playground-web](https://github.com/cllpse/unison-playground-web),
[unison-playground-expo](https://github.com/cllpse/unison-playground-expo) and
[unison-website](https://github.com/cllpse/unison-website).

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
explicitly. Nothing else in the library is public, except `maps`, `types/figma`, `design-tokens` and
`design-tokens.json`, which the Figma plugin reads, and `uniwind-motion` (see [Motion](#motion)). Then import the
generated stylesheet from the app's Tailwind entry stylesheet:

```css
@import "unison-components/tailwind.css";
```

The package is compiled JavaScript with type declarations, so consumers need no transpiling and no build step for the
stylesheet.

See [unison-playground-web](https://github.com/cllpse/unison-playground-web) and
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
no inline styles, except for motion on iOS and Android (see [Motion](#motion)).

- From the tokens: `fill-` and `stroke-<color>` (`fill-red-500`, `fill-white`), the same in a state (see
  [States](#states)), `width-` and `height-<spacing>` (`width-4`), `width-<container>` (`width-md`), `padding-` and `gap-<spacing>` (with
  `-vertical`, `-horizontal` and per-side variants), `corner-radius-<radius>`, `effect-shadow-<shadow>` and
  `typography-<size>`.
- From _dist/motion-tokens.css_ (`Frame` only): `transition-<property>` (`transition-colors`),
  `transition-duration-<ms>`, `transition-delay-<ms>`, `transition-easing-<name>` (`transition-easing-out`) and
  `animate-<name>` (`animate-spin`).
- Fixed: `autolayout-horizontal` / `-vertical`, `width-fill` / `width-hug` (and `height-`), `alignment-<position>`,
  `stroke-style-dashed` / `-solid`, `typography-align-<side>`, `typography-decoration-underline`,
  `typography-settings-truncate` (one line with an ellipsis), `effect-shadow-none`, `pointer-events-none` / `-auto`
  and `group` (`Frame` only, see [States](#states)).
- Set at most one flag per group; if several are set, the first wins.
- An unknown or misspelled flag (`fill-red-55`) is a type error, and outside production builds it is also logged.
- `Vector` takes `path`, `viewBox` and an optional `fillRule`. With both a `width-` and a `height-` flag it is a
  fixed box; with one, the other side follows the viewBox's aspect ratio; with neither, it stretches to its container
  and keeps the aspect ratio.

Known gaps: there are no letter-spacing, line-height or font-family flags, and on iOS and Android a `Vector` fill
takes no state.

## States

A color flag can also apply only while its element is in a state, with the state after the property, or while its
nearest `group` frame is, with `group-<state>-` in front, as in Tailwind's `group-hover:`:

| Component | Own states                                                                      | Group states                                                       |
| --------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `Frame`   | `fill-hover-`, `fill-active-`, `fill-focus-`, `fill-focus-visible-`, `fill-disabled-`, `fill-selected-`, `stroke-hover-`, `stroke-focus-`, `stroke-focus-visible-` | `group-hover-fill-`, `group-active-fill-`, `group-focus-fill-`, `group-focus-visible-fill-`, `group-hover-stroke-` |
| `Text`    | `fill-hover-`                                                                   | `group-hover-fill-`, `group-active-fill-`, `group-focus-fill-`, `group-focus-visible-fill-` |
| `Vector`  |                                                                                 | `group-hover-fill-`, `group-active-fill-`, `group-focus-fill-`, `group-focus-visible-fill-` |

```tsx
<Frame group fill-blue-500 fill-hover-blue-600 fill-active-blue-700 fill-disabled-gray-300 disabled={busy} onPress={buy}>
  <Text fill-white group-hover-fill-blue-50>Buy</Text>
</Frame>
```

- A `Frame` takes focus, and on iOS and Android presses (`active`), only with `onPress`, `onPressIn` or `onPressOut`.
  `disabled` also stops its presses; `aria-selected` sets its selected state.
- Touch screens have no hover, so `hover` states only apply on web.
- `focus` and `focus-visible` are separate states, as in CSS: `focus` is any focus, a click included, and
  `focus-visible` the focus a browser shows, which is typically from a keyboard. Keyboard focus is both, and then
  `focus-visible` wins. On iOS and Android focus only comes from a keyboard or a TV remote, so both states are any
  focus there, and `focus-visible` still wins where both are set.
- Group states need Uniwind Pro on iOS and Android, and there only `group-active-`, `group-focus-` and
  `group-focus-visible-` apply, with a pressable `group` frame. Without Pro the classes do nothing there.
- The element's own states win over its group's, and `disabled` and `selected` over hover, focus and press.
- `COLOR_COMPONENTS` in _maps/_ lists the states per component and property; a state added there is typed, read and
  safelisted with the rest. `STATE_VARIANTS` holds the Tailwind variant each state matches on web and on iOS and
  Android.

### Group states

`group` marks a `Frame`; the elements inside it take `group-<state>-` flags, which apply while that frame is in the
state. One example per group flag:

`group-hover-fill-` (`Frame`, `Text`, `Vector`; web only): hovering anywhere on a row recolors its label and icon.

```tsx
<Frame group autolayout-horizontal gap-3 padding-3 fill-hover-gray-100 onPress={open}>
  <Text fill-gray-900 group-hover-fill-blue-600>Settings</Text>
  <Vector path={chevron} viewBox="0 0 16 16" width-4 height-4 fill-gray-400 group-hover-fill-blue-600 />
</Frame>
```

`group-active-fill-` (`Frame`, `Text`, `Vector`): pressing a card darkens its image and its title.

```tsx
<Frame group autolayout-vertical gap-2 padding-4 onPress={open}>
  <Frame width-fill height-32 corner-radius-lg fill-gray-100 group-active-fill-gray-200 />
  <Text fill-gray-700 group-active-fill-gray-900>Card title</Text>
</Frame>
```

`group-focus-fill-` (`Frame`, `Text`, `Vector`): any focus on a search field, a click included, tints its icon and
placeholder.

```tsx
<Frame group autolayout-horizontal gap-2 padding-2 corner-radius-md stroke-gray-300 stroke-focus-blue-500 onPress={focusSearch}>
  <Vector path={magnifier} viewBox="0 0 16 16" width-4 height-4 fill-gray-400 group-focus-fill-blue-500 />
  <Text fill-gray-500 group-focus-fill-gray-900>Search</Text>
</Frame>
```

`group-focus-visible-fill-` (`Frame`, `Text`, `Vector`): keyboard focus on a tab shows its indicator. Beside
`group-focus-fill-`, the label is gray after a click and blue from the keyboard, where `focus-visible` wins.

```tsx
<Frame group autolayout-vertical gap-1 padding-2 onPress={open}>
  <Text fill-gray-600 group-focus-fill-gray-900 group-focus-visible-fill-blue-600>Overview</Text>
  <Frame width-fill height-0p5 fill-transparent group-focus-visible-fill-blue-500 />
</Frame>
```

`group-hover-stroke-` (`Frame` only; web only): hovering a row rings its avatar. The line itself comes from the
avatar's own `stroke-` flag (`stroke-transparent` here); a stroke state only changes its color.

```tsx
<Frame group autolayout-horizontal gap-3 padding-3 onPress={openProfile}>
  <Frame width-8 height-8 corner-radius-full fill-gray-200 stroke-transparent group-hover-stroke-blue-500 />
  <Text fill-gray-900>Ada Lovelace</Text>
</Frame>
```

## Design tokens

_dist/design-tokens.json_ is the source of truth for every design value in the library. Every token-derived flag above
is built from it, so adding, renaming or removing a token adds, renames or removes flags.

It is hand-maintained, in Figma's own variable export format (W3C Design Tokens), one top-level key per Figma
collection, then one key per mode:

| Collection | Modes       | Variables                                       | Flags                                            |
| ---------- | ----------- | ----------------------------------------------- | ------------------------------------------------ |
| colors     | Light, Dark | `fill-<hue>-<shade>`, `fill-<name>`             | `fill-`, `stroke-`, and both in a state          |
| units      | Default     | `spacing-<key>`, `radius-<name>`, `container-<name>` | `width-`, `height-`, `padding-`, `gap-`, `corner-radius-` |
| typography | Default     | `font-size-<size>`, `line-height-<size>`, `font-weight-<name>` | `typography-<size>`                 |
| shadows    | Default     | `shadow-<name>-<layer>-<offset-x, offset-y, blur, spread, color>` | `effect-shadow-<name>`        |

Rules the generator relies on:

- Color names are `fill-<hue>-<shade>` or `fill-<name>`; anything else stops the build. Light and Dark must hold the
  same names.
- The colors are Tailwind's palette, every hue from `50` to `950` plus `white` and `black`, as hex. Light and Dark
  hold the same values: as in Tailwind, `fill-red-50` is the lightest red in both modes.
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

TOKENS.colors.Light["fill-red-500"] // "#FB2C36"
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

## Motion

_dist/motion-tokens.css_ is the one place to edit animations, easings and transitions, as _dist/design-tokens.json_ is
for every other design value. It holds Tailwind 4's own motion values as Tailwind theme variables, under the names
Tailwind reads:

| Variables                                  | Classes                            | Flags                            |
| ------------------------------------------ | ---------------------------------- | -------------------------------- |
| `--ease-<name>`                            | `ease-<name>`                      | `transition-easing-<name>`       |
| `--transition-duration-<ms>`               | `duration-<ms>`                    | `transition-duration-<ms>`       |
| `--transition-delay-<ms>`                  | `delay-<ms>`                       | `transition-delay-<ms>`          |
| `--transition-property-<name>`             | `transition-<name>`                | `transition-<name>`              |
| `--default-transition-duration`, `--default-transition-timing-function` | every `transition-<name>` without a duration or easing | |
| `--animate-<name>` and its `@keyframes`    | `motion-safe:animate-<name>`       | `animate-<name>`                 |

A transition flag also adds `motion-reduce:transition-none`, and an animation only runs under `motion-safe:`, so both
respect the viewer's reduced-motion setting on web.

```tsx
<Frame fill-blue-500 transition-colors transition-duration-200 transition-easing-out />
<Frame fill-violet-600 width-8 height-8 animate-spin />
```

### Changing motion

Edit _dist/motion-tokens.css_, then run `bun run generate:tokens` and `bun run generate:tailwind` (the watchers pick it
up too). The first writes the motion scales into _dist/design-tokens.ts_ (`EASINGS`, `TRANSITION_DURATIONS`,
`TRANSITION_DELAYS`, `TRANSITION_PROPERTIES`, `DEFAULT_TRANSITION` and `ANIMATIONS`, with the keyframes in React
Native's form), which the flags and the native styles are built from. The second copies the file into
_dist/tailwind.css_, so web reads the same values. Commit all three files together.

The generator understands custom properties and `@keyframes` inside the file's one `@theme`. Keyframes may set
`transform`, `opacity` and `animation-timing-function`; anything else stops the build.

### iOS and Android

On web the flags are plain Tailwind classes. On iOS and Android it depends on the styling library:

- **Uniwind** (outside Pro) drops easings and keyframes, so the classes alone do nothing. Opt in to Reanimated motion
  with one import in the app's entry file, before the first render:

  ```ts
  import "unison-components/uniwind-motion"
  ```

  Install `react-native-reanimated` 4 and `react-native-worklets` (`bunx expo install react-native-reanimated
  react-native-worklets`). A `Frame` with a motion flag then renders through Reanimated's animated `View` or
  `Pressable`, wrapped with Uniwind's `withUniwind` so its classes still apply, and gets its motion as Reanimated CSS
  styles built from _dist/design-tokens.ts_. Every other `Frame` stays a plain `View`.
- **NativeWind** documents `transition-` and `animate-` classes as supported through Reanimated, so leave the import
  out and let it run the classes (not yet tried with this library).

`react-native-reanimated` and `uniwind` are optional peer dependencies, so a NativeWind app never needs Uniwind and an
app without _unison-components/uniwind-motion_ never needs Reanimated. A transition animates whenever the `Frame`'s
styles change between renders, such as when an app swaps one variant's flags for another's. Touch screens have no hover,
so `fill-hover-` changes don't transition there. Reduced motion is not yet handled on iOS and Android.

## Platform files

Files under _src/_ use platform extensions: _.web.tsx_ is used only on web, _.native.tsx_ only on iOS and Android, and
_.base.tsx_ is shared by both and never imported directly. The platform files are thin shells around the base
component, so platform-only libraries (such as React Native Reanimated) stay out of the shared code.

## Scripts

- `bun run build` / `build:watch` - compile the library into _build/_, the folder the npm package ships
- `bun run generate:tokens` / `generate:tokens:watch` - write _dist/design-tokens.ts_ from _dist/design-tokens.json_
  and _dist/motion-tokens.css_
- `bun run generate:tailwind` / `generate:tailwind:watch` - write _dist/tailwind.css_ from the tokens, _maps/_ and
  _dist/motion-tokens.css_
- `bun run components:sync-manual:plugin` / `components:sync-watch:plugin` - copy the library into
  _../unison-plugin/unison-components_ once, or on every change
- `bun run components:sync-manual:playground-web` / `components:sync-watch:playground-web` - build the library and copy
  _build/_ and _package.json_ over the installed package in _../unison-playground-web/node_modules/unison-components_,
  once or on every change
- `bun run components:sync-manual:playground-expo` / `components:sync-watch:playground-expo` - the same for
  _../unison-playground-expo/node_modules/unison-components_
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
