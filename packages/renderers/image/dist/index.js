import { DEFAULT_RENDERER_DEFINITIONS, } from '@file-viewer/core';
const imageDefinition = DEFAULT_RENDERER_DEFINITIONS.find(definition => definition.id === 'image');
if (!imageDefinition) {
    throw new Error('@file-viewer/renderer-image could not locate the core image renderer definition.');
}
export const imageRendererDefinition = imageDefinition;
export const renderFileViewerImage = (buffer, target, type, context) => import('./image.js').then(({ default: renderImage }) => renderImage(buffer, target, type, context));
export const imageRenderer = {
    id: 'file-viewer-renderer-image',
    label: 'Flyfish File Viewer image renderer',
    definitions: [imageRendererDefinition],
    handlers: [{
            rendererId: imageRendererDefinition.id,
            handler: renderFileViewerImage,
        }],
};
export default imageRenderer;
