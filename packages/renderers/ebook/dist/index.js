import { DEFAULT_RENDERER_DEFINITIONS, } from '@file-viewer/core';
const epubDefinition = DEFAULT_RENDERER_DEFINITIONS.find(definition => definition.id === 'epub');
const umdDefinition = DEFAULT_RENDERER_DEFINITIONS.find(definition => definition.id === 'umd');
if (!epubDefinition || !umdDefinition) {
    throw new Error('@file-viewer/renderer-epub could not locate the shared ebook format definitions.');
}
export const ebookRendererDefinition = epubDefinition;
export const umdRendererDefinition = umdDefinition;
export const renderFileViewerEpub = (buffer, target, _type, context) => import('./epub.js').then(({ default: renderEpub }) => renderEpub(buffer, target, context));
export const renderFileViewerUmd = (buffer, target, _type, context) => import('./umd.js').then(({ default: renderUmd }) => renderUmd(buffer, target, context));
export const ebookRenderer = {
    id: 'file-viewer-renderer-epub',
    label: 'Flyfish File Viewer ebook renderer',
    definitions: [ebookRendererDefinition, umdRendererDefinition],
    handlers: [
        {
            rendererId: ebookRendererDefinition.id,
            handler: renderFileViewerEpub,
        },
        {
            rendererId: umdRendererDefinition.id,
            handler: renderFileViewerUmd,
        },
    ],
};
export default ebookRenderer;
