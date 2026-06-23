---
layout: page
title: Flyfish Viewer
titleTemplate: false
---

<main class="doc-home">
<section class="doc-home-hero">
<div class="doc-home-hero-inner">
<div class="doc-eyebrow">Offline-first file preview for web apps</div>
<h1>Flyfish Viewer</h1>
<p>
Preview Office documents, PDF/OFD, CAD and EDA files, archives, email, EPUB, XMind, diagrams, 3D models, code, media, and structured data directly in the browser.
No document conversion backend, no Office server, no iframe-only black box.
</p>
<div class="doc-home-actions">
<a class="doc-action doc-action-primary" href="/en/guide/quickstart">Quickstart</a>
<a class="doc-action" href="https://demo.file-viewer.app" target="_blank" rel="noreferrer">Live Demo</a>
<a class="doc-action" href="https://demo.file-viewer.app/compare.html" target="_blank" rel="noreferrer">Compare Demo</a>
<a class="doc-action" href="https://github.com/flyfish-dev/file-viewer" target="_blank" rel="noreferrer">GitHub</a>
</div>
</div>
</section>

<section class="doc-home-metrics" aria-label="Flyfish Viewer key metrics">
<div>
<strong>206</strong>
<span>registered extensions</span>
</div>
<div>
<strong>24</strong>
<span>preview pipelines</span>
</div>
<div>
<strong>42</strong>
<span>npm publish targets</span>
</div>
<div>
<strong>Native</strong>
<span>Vue, React, Svelte, jQuery, Web Components</span>
</div>
</section>

<section class="doc-section">
<div class="doc-section-heading">
<span>Demo</span>
<h2>A real viewer, not only a format list</h2>
<p>
The demo opens real sample files, switches renderers on demand, keeps toolbar operations format-aware, and includes a side-by-side document comparison page.
</p>
</div>

<div class="doc-showcase">
<figure>
<img src="/_media/flyfish-viewer-demo.gif" alt="Flyfish Viewer demo showing Word, PDF, PPTX, and document comparison" />
<figcaption>The browser demo switches between Word, PDF, PPTX, and document comparison without a server-side conversion service.</figcaption>
</figure>
<div class="doc-showcase-list">
<article>
<span>01</span>
<h3>Frontend-first preview</h3>
<p>Parsing and rendering happen in the browser. That removes a conversion queue from many attachment centers, intranet tools, support portals, and knowledge-base systems.</p>
</article>
<article>
<span>02</span>
<h3>Modular by design</h3>
<p><code>@file-viewer/core</code> owns the shared protocol and APIs; heavy formats live in renderer packages; presets compose product-shaped bundles; each framework package stays native to its ecosystem.</p>
</article>
<article>
<span>03</span>
<h3>Lazy renderer packages</h3>
<p>Heavy PDF, Office, CAD, EDA, Typst, archive, email, EPUB, XMind, media, and code dependencies load only when the active file type needs them.</p>
</article>
<article>
<span>04</span>
<h3>Native framework packages</h3>
<p>Use a Web Component, Vue 3, Vue 2.7/2.6, React, React legacy, jQuery, or Svelte package without nesting another framework inside your app.</p>
</article>
<article>
<span>05</span>
<h3>Self-hostable assets</h3>
<p>Workers, WASM files, PDF assets, CAD assets, and offline diagram viewers can be copied into your own static directory for intranet and strict-CSP deployments.</p>
</article>
</div>
</div>
</section>

<section class="doc-section doc-section-muted">
<div class="doc-section-heading">
<span>Modular Integration</span>
<h2>Move from minimal imports to product-shaped composition</h2>
<p>
The 2.1.0 architecture separates component packages, renderer packages, presets, and build-time asset copying so teams can choose the smallest dependable surface for each product.
</p>
</div>

<div class="doc-value-grid">
<article class="doc-card">
<h3>Minimal import</h3>
<p>Install only the renderer you need, such as <code>@file-viewer/renderer-pdf</code>, then let <code>formats:['pdf']</code> generate exact imports.</p>
</article>
<article class="doc-card">
<h3>Composed import</h3>
<p>Use <code>preset-office</code> for document platforms, <code>preset-engineering</code> for engineering files, <code>preset-lite</code> for lightweight attachments, or <code>preset-all</code> for full workbenches.</p>
</article>
<article class="doc-card">
<h3>Trackable offline assets</h3>
<p><code>copyAssets:true</code> copies PDF, CAD, Typst WASM/fonts, Archive, Data, Worker, WASM, and vendor assets for intranet and strict-CSP deployments.</p>
</article>
</div>
</section>

<section class="doc-section">
<div class="doc-section-heading">
<span>Quick Integration</span>
<h2>One component, one line, fast integration</h2>
<p>
Choose the native package for your stack. Every component line shares the same core options, renderer presets, offline assets, toolbar operations, lifecycle hooks, search, zoom, print, and export model.
</p>
</div>

<div class="doc-path-grid">
<a class="doc-card" href="/en/guide/quickstart-web">
<h3>Vanilla JS / Web Component</h3>
<p>Use <code>@file-viewer/web</code> with <code>&lt;flyfish-file-viewer&gt;</code>, <code>mountViewer</code>, or an IIFE script tag.</p>
</a>
<a class="doc-card" href="/en/guide/quickstart-vue3">
<h3>Vue 3</h3>
<p>Install <code>@file-viewer/vue3</code> for a Vue-native plugin and component.</p>
</a>
<a class="doc-card" href="/en/guide/quickstart-vue2">
<h3>Vue 2.7 / 2.6</h3>
<p>Use dedicated Vue 2 packages while keeping the same viewer semantics as Vue 3.</p>
</a>
<a class="doc-card" href="/en/guide/quickstart-react">
<h3>React</h3>
<p>Use <code>@file-viewer/react</code> or <code>@file-viewer/react-legacy</code> with props, events, and refs.</p>
</a>
<a class="doc-card" href="/en/guide/ecosystem#svelte">
<h3>Svelte</h3>
<p>Use the Svelte package with component props, events, actions, and shared options.</p>
</a>
<a class="doc-card" href="/en/guide/ecosystem#jquery">
<h3>jQuery</h3>
<p>Use the jQuery package for traditional admin systems and legacy pages.</p>
</a>
<a class="doc-card" href="/en/guide/ecosystem#core-api">
<h3>Core API</h3>
<p>Build a custom host with the pure TypeScript core and renderer packages.</p>
</a>
<a class="doc-card" href="/en/guide/on-demand-renderers">
<h3>Modular Presets</h3>
<p>Pick minimal renderer imports or compose <code>lite</code>, <code>office</code>, <code>engineering</code>, or <code>all</code>.</p>
</a>
</div>
</section>

<section class="doc-section doc-section-muted">
<div class="doc-section-heading">
<span>Use Cases</span>
<h2>Built for attachment-heavy products</h2>
<p>
Flyfish Viewer is useful when users need to inspect many file types inside a product workflow instead of downloading every attachment.
</p>
</div>

<div class="doc-value-grid">
<article class="doc-card">
<h3>OA and approval systems</h3>
<p>Preview contracts, spreadsheets, slides, invoices, archives, and supporting material without leaving the approval page.</p>
</article>
<article class="doc-card">
<h3>Knowledge bases</h3>
<p>Open Word, PDF, Markdown, code, diagrams, and media attachments directly inside internal documentation and support portals.</p>
</article>
<article class="doc-card">
<h3>Self-hosted intranets</h3>
<p>Ship static viewer assets with your deployment and avoid sending private files to a third-party conversion service.</p>
</article>
<article class="doc-card">
<h3>Maintainable modularity</h3>
<p>Core, renderer packages, presets, and native component packages have clear boundaries, so new formats can evolve without bloating every integration.</p>
</article>
<article class="doc-card">
<h3>Engineering workflows</h3>
<p>Give users a first-pass preview for CAD, EDA, 3D, geospatial, archives, logs, and structured data files before they open specialist tools.</p>
</article>
</div>
</section>

<section class="doc-final-band">
<div>
<span>Start</span>
<h2>Install a package for your stack</h2>
<p>
New integrations should prefer the standard <code>@file-viewer/*</code> package names.
The old <code>@flyfish-group/*</code> package names remain synchronized for compatibility.
</p>
</div>
<a class="doc-action doc-action-primary" href="/en/guide/quickstart">Open quickstart</a>
</section>
</main>
