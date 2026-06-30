import { Ref } from 'vue';
import { FileViewerViewStateChange } from '@file-viewer/core';
interface UseViewerViewStateOptions {
    output: Ref<HTMLDivElement | null>;
    emitViewStateChange: (change: FileViewerViewStateChange) => void;
}
/**
 * FileViewer 组件层的视图状态同步门面。
 *
 * 投屏、远端协同和恢复阅读进度都围绕这个状态快照工作；具体格式只需要在
 * renderer 内注册 view-state provider，组件层保持统一 API 和事件。
 */
export declare const useViewerViewState: ({ output, emitViewStateChange }: UseViewerViewStateOptions) => import('@file-viewer/core').FileViewerViewStateControllerActionHandlers;
export {};
