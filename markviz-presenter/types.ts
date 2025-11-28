export type ViewMode = 'editor' | 'presentation';

export type MediaType = 'image' | 'video' | 'pdf' | 'ppt' | 'external' | 'code-preview';

export interface MediaItem {
  type: MediaType;
  url: string;
  title?: string;
}

export interface AppState {
  markdown: string;
  viewMode: ViewMode;
  activeMedia: MediaItem | null;
}
