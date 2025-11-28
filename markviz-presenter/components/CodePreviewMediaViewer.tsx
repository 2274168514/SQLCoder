import React from 'react';
import { CodePreview } from './MarkdownRenderer';
import { X } from 'lucide-react';

interface CodePreviewMediaViewerProps {
  media: {
    type: 'code-preview';
    url: string;
    title: string;
  };
  onClose: () => void;
}

export const CodePreviewMediaViewer: React.FC<CodePreviewMediaViewerProps> = ({ media, onClose }) => {
  // 从URL中提取语言和代码
  let language = 'javascript';
  let code = media.url;

  // 尝试从标题中提取语言
  const titleMatch = media.title.match(/^(HTML|CSS|JavaScript|SVG|JSON)/i);
  if (titleMatch) {
    language = titleMatch[1].toLowerCase();
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700" style={{backgroundColor: 'var(--panel)'}}>
        <h3 className="font-medium" style={{color: 'var(--text-primary)'}}>
          {media.title}
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          style={{color: 'var(--text-secondary)'}}
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 code-preview-sidepanel-container">
        <CodePreview code={code} language={language} isSidePanel={true} />
      </div>
    </div>
  );
};