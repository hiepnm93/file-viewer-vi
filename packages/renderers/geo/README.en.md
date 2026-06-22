# @file-viewer/renderer-geo

Standalone geospatial renderer package for Flyfish File Viewer. It previews GeoJSON, KML, GPX, and Shapefile data in the browser while keeping `@tmcw/togeojson` and `shpjs` lazy-loaded for geospatial files only.

## Usage

```ts
import { geoRenderer } from '@file-viewer/renderer-geo'

const options = {
  builtinRenderers: 'none',
  renderers: [geoRenderer],
}
```

You can also compose it through the full preset:

```ts
import { allRenderers } from '@file-viewer/preset-all'

const options = {
  builtinRenderers: 'none',
  renderers: allRenderers,
}
```

## Capabilities

- Reads GeoJSON `FeatureCollection`, `Feature`, and standalone geometry objects.
- Loads `@tmcw/togeojson` only for KML / GPX and normalizes them into the shared GeoJSON pipeline.
- Loads `shpjs` only for SHP / Shapefile previews, including common ZIP or binary Shapefile payloads.
- Does not depend on online map tiles. The default output is an offline SVG vector map, which is suitable for intranet deployment and attachment review.
- Cleans up DOM resources on unmount and remains compatible with core lifecycle, HTML export, and zoom orchestration.

## Migration Note

`@file-viewer/core` still keeps the bundled geo renderer for compatibility with historical all-in-one builds. A later release will route geospatial preview through this package and remove `@tmcw/togeojson` and `shpjs` from direct core dependencies.
