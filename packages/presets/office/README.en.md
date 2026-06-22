# @file-viewer/preset-office

The Office and document renderer preset for Flyfish File Viewer. It groups PDF, Word, Excel, PowerPoint, OFD, RTF, and OpenDocument preview lines into one explicit capability package.

## When To Use

- Your product mainly handles contracts, reports, spreadsheets, slide decks, OFD documents, or enterprise office attachments.
- You want one document preset instead of several renderer imports.
- You do not need the complete official demo matrix such as CAD, 3D, EDA, archives, and email.

## Usage

```ts
import FileViewer from '@file-viewer/vue3'
import { officeRenderers } from '@file-viewer/preset-office'

const options = {
  builtinRenderers: 'none',
  rendererMode: 'replace',
  renderers: officeRenderers,
}
```

It also works with `@file-viewer/vite-plugin`:

```ts
fileViewerRenderers({
  preset: 'office',
  copyAssets: true,
})
```

## Included Renderers

- `@file-viewer/renderer-pdf`
- `@file-viewer/renderer-word`
- `@file-viewer/renderer-spreadsheet`
- `@file-viewer/renderer-presentation`
- `@file-viewer/renderer-ofd`

## Documentation

- On-demand renderer architecture: <https://doc.file-viewer.app/guide/on-demand-renderers>
- Supported formats: <https://doc.file-viewer.app/guide/formats>
