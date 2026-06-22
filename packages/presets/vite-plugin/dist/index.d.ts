import type { Plugin } from 'vite';
export type FileViewerVitePreset = 'all' | 'lite' | 'engineering';
export type FileViewerMissingRendererMode = 'error' | 'warn' | 'ignore';
export type FileViewerChunkStrategy = 'renderer' | 'none';
export interface FileViewerRendererScanOptions {
    /**
     * Disable a shared scan object without branching user config.
     */
    enabled?: boolean;
    /**
     * Source roots, relative to Vite root, that should be inspected for format hints.
     * Defaults to common application source folders.
     */
    roots?: readonly string[];
    /**
     * Text-like source extensions to inspect. Values may include or omit the dot.
     */
    extensions?: readonly string[];
    /**
     * Large generated files are ignored by default to keep config/startup fast.
     */
    maxFileSize?: number;
}
export interface FileViewerCopyAssetsOptions {
    /**
     * Directory used by Vite dev. Defaults to config.publicDir.
     */
    publicDir?: string;
    /**
     * Directory used after production build. Defaults to build.outDir.
     */
    outDir?: string;
    /**
     * Copy during dev server startup, build closeBundle, or both.
     */
    mode?: 'dev' | 'build' | 'both';
}
export interface FileViewerRenderersPluginOptions {
    /**
     * File extensions or renderer ids. Examples: pdf, .dwg, typst, zip, xmind.
     */
    formats?: readonly string[];
    /**
     * Explicit renderer ids. Useful when several extensions share one renderer.
     */
    renderers?: readonly string[];
    /**
     * `all` imports @file-viewer/preset-all. `lite` and `engineering` expand to
     * already extracted renderer packages and remain tree-shakeable.
     */
    preset?: FileViewerVitePreset;
    /**
     * Virtual module id consumed by application code.
     */
    moduleId?: string;
    /**
     * Controls how planned-but-not-yet-extracted renderer lines are reported.
     */
    missingRenderer?: FileViewerMissingRendererMode;
    /**
     * Adds renderer-oriented manualChunks when the user did not define one.
     */
    chunkStrategy?: FileViewerChunkStrategy;
    /**
     * Copies known worker/WASM/vendor assets for selected renderer lines.
     */
    copyAssets?: boolean | FileViewerCopyAssetsOptions;
    /**
     * Opt-in source scan. The plugin reads lightweight hints such as
     * `fileViewerFormats = ['pdf', 'docx']`, `data-file-viewer-formats="pdf,docx"`,
     * and upload `accept=".pdf,.docx"` declarations, then merges them with
     * `formats` / `renderers` before generating the virtual module.
     */
    scan?: boolean | FileViewerRendererScanOptions;
}
interface MissingRendererNotice {
    format: string;
    targetPackage?: string;
    note: string;
}
export declare function extractFileViewerRendererHintTokens(source: string): string[];
export declare function collectFileViewerRendererScanTokens(projectRoot: string, scan: FileViewerRenderersPluginOptions['scan']): string[];
export declare function fileViewerRenderers(options?: FileViewerRenderersPluginOptions): Plugin;
export declare function createFileViewerManualChunks(options?: FileViewerRenderersPluginOptions): (id: string) => string | undefined;
export declare function resolveFileViewerRendererSelection(options?: FileViewerRenderersPluginOptions, projectRoot?: string): {
    preset: FileViewerVitePreset | null;
    formats: string[];
    renderers: {
        id: string;
        packageName: string;
        formats: string[];
        rendererIds: string[];
        chunkName: string;
    }[];
    missing: MissingRendererNotice[];
};
export default fileViewerRenderers;
