import React from 'react';
import { MediaItem } from '../types';
import { X, ExternalLink } from 'lucide-react';
import { Button } from './Button';
import { CodePreviewMediaViewer } from './CodePreviewMediaViewer';

interface MediaViewerProps {
  media: MediaItem;
  onClose: () => void;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({ media, onClose }) => {
  const renderContent = () => {
    switch (media.type) {
      case 'image':
        return (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <img src={media.url} alt={media.title} className="max-w-full max-h-full object-contain" />
          </div>
        );
      case 'video':
        return (
          <div className="flex items-center justify-center h-full bg-black">
            <video src={media.url} controls className="max-w-full max-h-full" autoPlay />
          </div>
        );
      case 'pdf':
        return (
          <iframe
            src={media.url}
            className="w-full h-full bg-white"
            title={media.title}
          />
        );
      case 'ppt':
        // Using Google Docs Viewer for PPTs if they are publicly accessible URLs.
        // For local dev, this might fail without a public proxy.
        return (
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(media.url)}`}
            className="w-full h-full bg-white"
            title={media.title}
          />
        );
      case 'code-preview':
        return (
          <CodePreviewMediaViewer
            media={media}
            onClose={onClose}
          />
        );
      case 'external':
      default:
        return (
          <iframe
            src={media.url}
            className="w-full h-full bg-white"
            title={media.title}
          />
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200 shadow-xl animate-in slide-in-from-right duration-300 media-viewer-container">
      {media.type === 'code-preview' ? (
        // 代码预览不需要额外头部，因为CodePreviewMediaViewer有自己的头部
        <div className="flex-1 overflow-hidden relative">
          {renderContent()}
        </div>
      ) : (
        <>
          <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-gray-50 flex-shrink-0">
            <div className="flex items-center gap-2 truncate">
              <span className="font-semibold text-gray-700 truncate">{media.title || 'Media Viewer'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase font-bold tracking-wider">
                {media.type}
              </span>
            </div>
            <div className="flex items-center gap-2">
               <a href={media.url} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-indigo-600 transition-colors p-1" title="Open in new tab">
                <ExternalLink size={18} />
              </a>
              <button onClick={onClose} className="text-gray-500 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-gray-200">
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden relative">
            {renderContent()}
          </div>
        </>
      )}
    </div>
  );
};
