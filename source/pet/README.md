# WebPet / Hiyori

This directory is an isolated WebPet module for the existing Hexo + Butterfly
site. It does not modify Butterfly layouts or depend on APlayer to render.
`scripts/webpet-model-manifest.js` finds the actual `.model3.json` filename at
build time, so a character is a resource directory rather than application code.

## Required official files

No Live2D model or Cubism Core is committed here. Hiyori is listed by Live2D as
Free Material, and Cubism Core is distributed under the Live2D Proprietary
Software License. Review and accept the applicable terms before using either.

1. Download the official Cubism SDK for Web package from
   <https://www.live2d.com/en/sdk/download/web/>.
2. Copy **all contents** of `Samples/Resources/Hiyori/` from that package to:

   ```text
   source/pet/models/hiyori/
   ```

   This must include the discovered `*.model3.json`, matching `.moc3`, texture
   directory, `motions/`, physics, pose, expressions (if present), and every
   other file it references. Do not rename files or flatten directories.
3. Copy `Core/live2dcubismcore.min.js` from the same official SDK package to:

   ```text
   source/pet/vendor/live2dcubismcore.min.js
   ```

The WebPet loader does not request renderer scripts until a local model is
present. With Core or the model missing, it emits one warning, hides only the
new pet, and leaves the rest of the blog running.

Official references:

- <https://docs.live2d.com/en/cubism-sdk-manual/cubism-sdk-for-web/>
- <https://github.com/Live2D/CubismWebSamples/blob/develop/LICENSE.md>
- <https://github.com/Live2D/CubismWebSamples/tree/develop/Samples/Resources/Hiyori>

## Configure

Edit `source/pet/config.js` for the ordinary adjustments:

- `display.desktop.x` / `.y` — right and bottom spacing.
- `display.width` / `.height` — desktop stage size.
- `mobile.enabled` / `.scale` — mobile behavior.
- `dialogue`, `idle`, `interaction`, `toolbar`, `drag`, and `music` — feature
  switches and frequencies.
- `runtime.*Url` — pinned renderer locations. The default uses a fixed CDN
  version for PixiJS and `pixi-live2d-display`; after obtaining their permitted
  distributions, you may self-host those files under `source/pet/vendor/` and
  change only these URLs.

The Hiyori model ID is `hiyori`. The build script discovers its real entry file,
then emits `/pet/model-manifest.js`. To add another character, copy its complete
runtime directory to `source/pet/models/<character-id>/`, rebuild, and call:

```js
WebPet.changeModel('<character-id>')
```

No renderer, PJAX, dialogue, toolbar, drag, or APlayer code needs changing.

## Dialogue, hover, motions, and expressions

- Edit all scripted lines and time ranges in `dialogue.json`; no dialogue text
  is hard-coded into the UI.
- Edit `hoverTargets` in `config.js` to add selector-driven hover lines. The
  module binds `mouseenter` with a per-element cooldown.
- Actions are discovered from the selected model's `FileReferences.Motions`.
  `motionMap` contains only candidate group names; unavailable groups are
  skipped. Use `WebPet.hasMotion('Group')` and `WebPet.motion('Group')` in the
  browser console to inspect a new model.
- Expressions are discovered from `FileReferences.Expressions`. The toolbar
  expression control hides automatically when the model has none.

The public console API is:

```js
WebPet.say('你好')
WebPet.motion('TapBody')
WebPet.expression('name')
WebPet.show(); WebPet.hide(); WebPet.toggle()
WebPet.changeModel('hiyori')
WebPet.resetPosition()
WebPet.getState()
WebPet.setMouth(0.4)
WebPet.chat() // reserved; does not call an API
```

## Migration and rollback

The old `live2d` block in `_config.yml` and the installed Miku packages are
intentionally retained. This lets the current Miku widget serve as a rollback
until Hiyori is verified.

After copying Hiyori and Core, run the build, check `public/pet/`, then make a
temporary test-only change in `_config.yml`:

```yaml
live2d:
  enable: false
```

This prevents two characters from appearing at once. If testing fails, restore
`enable: true`; no dependency uninstall is required. Only after a full PJAX,
desktop, mobile, and dark-mode check should the legacy helper be considered
retired. Do not remove it automatically as part of this module setup.

## Verify

```powershell
npx hexo clean
npx hexo generate
npx hexo server -p 4000
```

Open `/pet/model-manifest.js` to confirm the discovered file path. Verify that
the model JSON, moc3, textures, motions, physics, and pose all return HTTP 200.
With PJAX, `document.querySelectorAll('#web-pet').length` and
`document.querySelectorAll('#web-pet canvas').length` must both remain `1`.
