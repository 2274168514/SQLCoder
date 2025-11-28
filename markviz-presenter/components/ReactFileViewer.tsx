import React, { useState } from 'react';
import FileViewer from 'react-file-viewer';

interface ReactFileViewerProps {
  src: string;
  name: string;
}

export const ReactFileViewer: React.FC<ReactFileViewerProps> = ({ src, name }) => {
  const [error, setError] = useState<string | null>(null);

  const handleError = (e: any) => {
    console.error('文件查看器错误:', e);
    setError(`无法加载文件: ${e.message || '未知错误'}`);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8" style={{ height: '600px', color: 'var(--text-secondary)' }}>
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            文件加载错误
          </h3>
          <p className="text-sm mb-4">{error}</p>
          <div className="text-xs">
            <p>建议：</p>
            <p>• 确认文件是有效的PPTX格式</p>
            <p>• 尝试重新导出文件</p>
            <p>• 检查文件是否损坏</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="react-file-viewer">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
          {name}
        </h3>
        <a
          href={src}
          download={name}
          className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'white'
          }}
        >
          下载文件
        </a>
      </div>

      <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <FileViewer
          fileType="pptx"
          filePath={src}
          onError={handleError}
          errorComponent={null}
          loader={
            <div className="flex items-center justify-center p-8" style={{ height: '400px', color: 'var(--text-secondary)' }}>
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}></div>
                <p>正在加载PPT文件...</p>
              </div>
            </div>
          }
        />
      </div>

      <div className="mt-4 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
        提示：使用文件查看器查看PowerPoint演示文稿
      </div>
    </div>
  );
};