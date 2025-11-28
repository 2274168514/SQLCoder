import React, { useState, useEffect } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { MediaViewer } from './MediaViewer';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { MediaItem } from '../types';
import { Edit3, FileText, ArrowLeft, FolderOpen } from 'lucide-react';
import { Button } from './Button';
import { i18n, Language } from '../i18n';

interface PresentationProps {
  content: string;
  onEdit: () => void;
  onShowFileModal: () => void;
  importedFiles?: Array<{name: string, content: string}>;
  onFileSelect?: (content: string, filename: string) => void;
  autoSelectFile?: string;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
}

export const Presentation: React.FC<PresentationProps> = ({ content, onEdit, onShowFileModal, importedFiles = [], onFileSelect, autoSelectFile, isDarkMode = true, onThemeToggle }) => {
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const [currentLang, setCurrentLang] = React.useState<Language>(i18n.current);

  // 监听语言变化
  useEffect(() => {
    const unsubscribe = i18n.onChange((lang) => {
      setCurrentLang(lang);
    });
    return unsubscribe;
  }, []);

  // 自动选择文件
  React.useEffect(() => {
    console.log('Auto-select check:', {
      autoSelectFile,
      hasAutoSelectFile: !!autoSelectFile,
      hasOnFileSelect: !!onFileSelect,
      hasContent: !!content,
      importedFilesCount: importedFiles.length
    });

    if (autoSelectFile && onFileSelect && !content) {
      const autoFile = importedFiles.find(file => file.name === autoSelectFile);
      if (autoFile) {
        console.log('Found auto file:', autoFile.name);
        setTimeout(() => {
          console.log('Triggering auto-select for:', autoFile.name);
          onFileSelect(autoFile.content);
        }, 500); // 增加延迟到500ms
      } else {
        console.log('Auto file not found in importedFiles:', autoSelectFile);
        console.log('Available files:', importedFiles.map(f => f.name));
      }
    }
  }, [autoSelectFile, importedFiles, onFileSelect, content]);

  const handleMediaClick = (media: MediaItem) => {
    setActiveMedia(media);
  };

  const closeMedia = () => {
    setActiveMedia(null);
  };

  // State 1: No Content (Empty) - 显示欢迎界面和文件选择按钮
  if (!content) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-4 transition-colors duration-300" style={{backgroundColor: 'var(--bg-primary)'}}>
        {/* 主题切换按钮和语言切换按钮 */}
        <div className="absolute top-4 right-4 flex gap-2">
          <LanguageToggle isDark={isDarkMode} />
          <ThemeToggle isDark={isDarkMode} onToggle={onThemeToggle || (() => {})} />
        </div>

        <div className="p-10 rounded-2xl shadow-xl max-w-md w-full text-center border transition-colors duration-300"
             style={{backgroundColor: 'var(--panel)', borderColor: 'var(--border)'}}>
          {/* Logo 和标题 */}
          <div className="w-20 h-20 rounded-lg flex items-center justify-center mx-auto mb-6 transition-colors duration-300"
               style={{backgroundColor: 'var(--accent)'}}>
            <FileText className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-2 transition-colors duration-300" style={{color: 'var(--text-primary)'}}>
            {i18n.t('app.title')}
          </h1>
          <p className="mb-8 transition-colors duration-300" style={{color: 'var(--text-secondary)'}}>
            {i18n.t('welcome.description')}
          </p>

          {importedFiles.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 transition-colors duration-300" style={{color: 'var(--text-primary)'}}>
                {i18n.t('welcome.imported_files')}
              </h3>
              <div className="space-y-2">
                {importedFiles.map((file) => (
                  <button
                    key={file.name}
                    onClick={() => onFileSelect?.(file.content, file.name)}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 font-medium ${
                      file.name === autoSelectFile
                        ? ''
                        : ''
                    }`}
                    style={{
                      backgroundColor: file.name === autoSelectFile ? 'var(--accent-light)' : 'transparent',
                      borderColor: file.name === autoSelectFile ? 'var(--accent)' : 'var(--border)',
                      color: file.name === autoSelectFile ? 'white' : 'var(--text-secondary)'
                    }}
                    onMouseEnter={(e) => {
                      if (file.name !== autoSelectFile) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.borderColor = 'var(--accent)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (file.name !== autoSelectFile) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{file.name}</span>
                      {file.name === autoSelectFile && (
                        <span className="text-xs px-2 py-1 rounded-full transition-colors duration-200"
                              style={{backgroundColor: 'var(--accent)', color: 'white'}}>
                          {i18n.t('file.selected')}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onShowFileModal}
            className="w-full text-white font-semibold py-3 px-4 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'var(--accent)',
              boxShadow: `0 4px 12px var(--shadow)`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <FileText size={20} />
            <span>{i18n.t('button.import')}</span>
          </button>
        </div>
      </div>
    );
  }

  // 返回主应用的处理函数
  const handleBackToMain = () => {
    console.log('MarkViz: Attempting to return to main application');

    // 使用 window.open + immediate close 来强制跳转
    const newWindow = window.open('http://127.0.0.1:5020/main.html', '_self');
    if (newWindow) {
      newWindow.focus();
    } else {
      // 如果弹窗被阻止，使用location.href
      console.log('MarkViz: Popup blocked, using location.href');
      window.location.href = 'http://127.0.0.1:5020/main.html';
    }
  };

  // State 2: Content Loaded (Full View or Split View)
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden transition-colors duration-300" style={{backgroundColor: 'var(--bg-primary)'}}>
      {/* Navbar */}
      <header className="h-16 px-6 border-b flex items-center justify-between z-20 sticky top-0 backdrop-blur-md transition-colors duration-300"
              style={{backgroundColor: 'var(--panel)', borderColor: 'var(--border)'}}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold transition-colors duration-300"
               style={{backgroundColor: 'var(--accent)'}}>
            <FileText size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight transition-colors duration-300"
                style={{color: 'var(--text-primary)'}}>
            {i18n.t('app.title')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* 语言切换按钮 */}
          <LanguageToggle isDark={isDarkMode} />
          {/* 主题切换按钮 */}
          <ThemeToggle isDark={isDarkMode} onToggle={onThemeToggle || (() => {})} />

          <Button
            variant="outline"
            onClick={handleBackToMain}
            icon={<ArrowLeft size={16} />}
            className="px-3 py-2 border transition-all duration-200 font-medium"
            style={{borderColor: 'var(--border)', color: 'var(--text-secondary)'}}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--accent)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {i18n.t('button.back_to_main')}
          </Button>

          <Button
            variant="outline"
            onClick={onShowFileModal}
            icon={<FolderOpen size={16} />}
            className="px-3 py-2 border transition-all duration-200 font-medium"
            style={{borderColor: 'var(--border)', color: 'var(--text-secondary)'}}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--accent)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {i18n.t('button.select_file') || '选择文件'}
          </Button>

          <Button
            variant="outline"
            onClick={onEdit}
            icon={<Edit3 size={16} />}
            className="px-3 py-2 border transition-all duration-200 font-medium"
            style={{borderColor: 'var(--border)', color: 'var(--text-secondary)'}}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--accent)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {i18n.t('button.edit')}
          </Button>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Markdown Content */}
        <div
          className={`
            transition-all duration-500 ease-in-out h-full overflow-y-auto custom-scrollbar
            ${activeMedia ? 'w-1/2 border-r z-10' : 'w-full'}
          `}
          style={{
            backgroundColor: 'var(--panel)',
            borderColor: 'var(--border)',
            boxShadow: activeMedia ? `4px 0 24px var(--shadow)` : 'none'
          }}
        >
          <div className={`mx-auto py-12 px-8 transition-all duration-500 ${activeMedia ? 'max-w-2xl' : 'max-w-4xl'}`}>
            <MarkdownRenderer
              content={content}
              onMediaClick={handleMediaClick}
            />
            {/* Footer space */}
            <div className="h-32"></div>
          </div>
        </div>

        {/* Right Side: Media Viewer */}
        <div
          className={`
            transition-all duration-500 ease-in-out h-full
            ${activeMedia ? 'w-1/2 translate-x-0 opacity-100' : 'w-0 translate-x-full opacity-0'}
          `}
          style={{backgroundColor: 'var(--bg-secondary)'}}
        >
          {activeMedia && (
            <MediaViewer
              media={activeMedia}
              onClose={closeMedia}
            />
          )}
        </div>
      </div>
    </div>
  );
};
