# Component Options

<div class="doc-kicker">One Options Contract</div>

<p class="doc-lead">
  Vanilla JS, Vue, React, Svelte, jQuery, and core integrations share the same viewer options wherever the host framework allows it.
</p>

## Common Options

| Option area | Purpose |
| --- | --- |
| `theme` | `light`, `dark`, `auto`, or renderer-specific theme behavior |
| `toolbar` | Position, visibility, floating mode, operation grouping, and custom action handling |
| `watermark` | Text or image watermark source, opacity, spacing, rotation, and toggle behavior |
| `search` | Document search, highlighted matches, next/previous navigation, and focus handling |
| `zoom` | Unified zoom in, zoom out, reset, fit-to-width, and renderer-specific adapters |
| `print` | Format-aware printing for printable renderers, with dynamic operation availability |
| `archive` | Safe extraction limits, cache behavior, worker timeout, and nested preview |
| `pdf`, `docx`, `spreadsheet`, `cad`, `typst`, `drawing`, `data` | Renderer-specific asset URLs and behavior knobs |
| `beforeOperation` | Pre-action permission check for download, print, export HTML, search, zoom, and custom actions |
| lifecycle hooks | Load start, load complete, unload start, unload complete, errors, and renderer context |

## Operation Guard

```ts
const options = {
  async beforeOperation(operation, context) {
    if (operation === 'download') {
      return await checkPermission(context.source)
    }
    return true
  }
}
```

Returning `false` cancels the operation. Returning `true` continues.

## Lifecycle Hooks

```ts
const options = {
  onLoadStart(context) {
    console.log('loading', context.fileType)
  },
  onLoadComplete(context) {
    console.log('loaded', context.rendererId)
  },
  onBeforeUnload(context) {
    console.log('unloading', context.rendererId)
  },
  onUnloadComplete(context) {
    console.log('unloaded')
  }
}
```

## Toolbar Customization

Framework packages expose the same operation model with ecosystem-native customization:

| Stack | Customization style |
| --- | --- |
| Vanilla JS | `options.toolbar`, Custom Element properties, and controller methods |
| Vue | props, emits, slots where available, and component refs |
| React | props, render callbacks where available, and `ref` handle APIs |
| Svelte | props, events, actions, and bindable references |
| jQuery | plugin options, events, and returned instance methods |

Toolbar buttons should call viewer operations rather than wrapping the rendered content with outer CSS transforms. This keeps spreadsheet coordinates, PDF text layers, CAD canvases, and mobile gestures aligned.

