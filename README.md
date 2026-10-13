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

Watch for local file changes, and copy them directly to _"../figma-plugin/_.

```sh
sync-manual:figma-plugin
sync-watch:figma-plugin
```

## Releasing

Normal git flow applies; create feature branch, create pull request, merge pull request.
