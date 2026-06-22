import type { Plugin } from 'vite';
export type FileViewerVitePreset = 'all' | 'lite' | 'engineering';
export type FileViewerMissingRendererMode = 'error' | 'warn' | 'ignore';
export type FileViewerChunkStrategy = 'renderer' | 'none';
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
}
interface MissingRendererNotice {
    format: string;
    targetPackage?: string;
    note: string;
}
export declare function fileViewerRenderers(options?: FileViewerRenderersPluginOptions): Plugin;
export declare function createFileViewerManualChunks(options?: FileViewerRenderersPluginOptions): (id: string) => string | undefined;
export declare function resolveFileViewerRendererSelection(options?: FileViewerRenderersPluginOptions): {
    preset: FileViewerVitePreset | null;
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
