# @file-viewer/core

Framework-neutral TypeScript foundation for Flyfish File Viewer.

This package is the migration base for the next architecture: one pure TypeScript core, multiple thin wrappers for Vue, React, pure JavaScript, jQuery, and Svelte. It owns the shared format matrix, source detection, renderer registry, capability calculation, lifecycle context, operation guards, iframe protocol, search/location/zoom contracts, print/export helpers, and runtime option normalization.

The current production renderer is still provided by the Vue 3 baseline package while core extraction continues. Core source remains in the private Gitea repository; public distribution should use compiled npm artifacts and public wrapper repositories only.

```bash
npm install @file-viewer/core
```

Official documentation: https://doc.flyfish.dev/

Online demo: https://viewer.flyfish.dev/

License: Apache-2.0. For second development or commercial use, keep clear Flyfish Viewer attribution and contribute shared compatibility improvements where possible.
