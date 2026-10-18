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

Consumers import _tailwind.css_ from their Tailwind 4 entry stylesheet (web, or Uniwind on iOS and Android):

```css
@import "./unison-components/tailwind.css";
```

It carries the library's colors as theme colors, a `@source` for the library's files and a safelist of the class names
the library builds at runtime. It is generated from the tokens; rerun and commit it after changing them:

```sh
bun run tailwind:css
```

## Type checking

```sh
bun run typecheck
```

## Releasing

Normal git flow applies; create feature branch, create pull request, merge pull request.
