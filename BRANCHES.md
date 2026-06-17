# Branch And Source Boundaries

Flyfish Viewer uses one private source workspace and several public wrapper repositories. Keep these roles stable when releasing or synchronizing code.

| Branch | Role | Package responsibility | Source boundary |
| --- | --- | --- | --- |
| `main` | Core foundation | `@file-viewer/core` | Private Gitea source only. Maintains framework-neutral TypeScript protocols, renderer registry, shared options, capabilities, lifecycle, operations, worker and asset contracts. |
| `v2` | Vue 2.7 wrapper line | `@file-viewer/vue2.7`, `@flyfish-group/file-viewer` | Shares `@file-viewer/core`; exported wrapper source is synchronized to the public `flyfish-dev/file-viewer-vue2.7` repositories. |
| `v3` | Vue 3 wrapper line | `@file-viewer/vue3`, `@flyfish-group/file-viewer3`, `file-viewer3` | Shares `@file-viewer/core`; exported wrapper source is synchronized to the public `flyfish-dev/file-viewer-vue3` repositories. |

All other ecosystem wrappers (`@file-viewer/react`, `@file-viewer/react-legacy`, `@file-viewer/web`, `@file-viewer/jquery`, and `@file-viewer/svelte`) are maintained as wrapper packages and exported to public GitHub/Gitee repositories under `flyfish-dev`.

The public `flyfish-dev/file-viewer` repository is an artifact distribution repository. It must contain built/minified packages, demo/docs output, samples, tarballs, release manifests, and README files only. Private core source must not be pushed there.

Run the source-boundary gate before release work:

```bash
pnpm verify:branch-roles
```

This command checks `ecosystem/branch-roles.json`, `ecosystem/wrappers.json`, the configured `origin` remote, wrapper repository ownership, core visibility, and the public artifact repository policy.
