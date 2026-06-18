import { getCurrentFileViewerDocumentAnchor } from './documentDom';
import { cloneFileViewerSearchState } from './documentSearch';
import type {
  FileViewerDocumentAnchor,
  FileViewerSearchState,
} from './types';

export interface ResolveFileViewerLocationChangeAnchorInput {
  root: HTMLElement | null | undefined;
  anchors: FileViewerDocumentAnchor[];
}

export interface CreateFileViewerDocumentChangeSnapshotInput
  extends ResolveFileViewerLocationChangeAnchorInput {
  searchState: FileViewerSearchState;
}

export interface FileViewerDocumentChangeSnapshot {
  searchState: FileViewerSearchState;
  locationAnchor: FileViewerDocumentAnchor | null;
}

export const createFileViewerSearchChangeState = (
  state: FileViewerSearchState
): FileViewerSearchState => {
  return cloneFileViewerSearchState(state);
};

export const resolveFileViewerLocationChangeAnchor = ({
  root,
  anchors,
}: ResolveFileViewerLocationChangeAnchorInput) => {
  return getCurrentFileViewerDocumentAnchor(root || null, anchors);
};

export const createFileViewerDocumentChangeSnapshot = ({
  root,
  anchors,
  searchState,
}: CreateFileViewerDocumentChangeSnapshotInput): FileViewerDocumentChangeSnapshot => {
  return {
    searchState: createFileViewerSearchChangeState(searchState),
    locationAnchor: resolveFileViewerLocationChangeAnchor({ root, anchors }),
  };
};
