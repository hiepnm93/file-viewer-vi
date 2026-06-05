import { ComputedRef, Ref, ShallowRef } from 'vue';
import { FileRenderExportAdapter, FileViewerOperationAvailability, FileViewerOperationType } from '../../common/type';
interface UseViewerExportOptions {
    activeExportAdapter: ShallowRef<FileRenderExportAdapter | null>;
    currentBuffer: Ref<ArrayBuffer | null>;
    currentFile: Ref<File | null>;
    displayFilename: ComputedRef<string>;
    formatErrorMessage: (prefix: string, nextError: unknown) => string;
    operationAvailability: ComputedRef<FileViewerOperationAvailability>;
    output: Ref<HTMLDivElement | null>;
    runBeforeOperation: (operation: FileViewerOperationType) => Promise<boolean>;
    showError: (message: string) => void;
    watermarkInlineStyle: ComputedRef<string>;
}
export declare const useViewerExport: ({ activeExportAdapter, currentBuffer, currentFile, displayFilename, formatErrorMessage, operationAvailability, output, runBeforeOperation, showError, watermarkInlineStyle }: UseViewerExportOptions) => {
    downloadOriginalFile: () => Promise<void>;
    exportRenderedHtml: () => Promise<void>;
    printRenderedHtml: () => Promise<void>;
};
export {};
