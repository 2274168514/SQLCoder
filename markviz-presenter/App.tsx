import React, { useState, useEffect } from 'react';
import { Presentation } from './components/Presentation';
import { Editor } from './components/Editor';
import { ThemeToggle } from './components/ThemeToggle';
import { i18n, Language } from './i18n';
import { ViewMode } from './types';

const App: React.FC = () => {
  // 主题状态管理
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('markviz-theme');
    return saved ? saved === 'dark' : true;
  });

  // 设置CSS变量主题
  useEffect(() => {
    const root = document.documentElement;

    if (isDarkMode) {
      // 深色主题 - 改进的配色方案
      root.style.setProperty('--bg-primary', '#0d1117');        // 更深的背景
      root.style.setProperty('--bg-secondary', '#161b22');      // 次要背景
      root.style.setProperty('--bg-tertiary', '#21262d');       // 第三层背景
      root.style.setProperty('--panel', '#1c2128');            // 面板背景
      root.style.setProperty('--panel-dark', '#0d1117');       // 深色面板
      root.style.setProperty('--panel-light', '#30363d');      // 浅色面板
      root.style.setProperty('--border', '#30363d');           // 边框色
      root.style.setProperty('--border-light', '#21262d');     // 浅边框
      root.style.setProperty('--text-primary', '#f0f6fc');     // 主要文字 - 更亮
      root.style.setProperty('--text-secondary', '#8b949e');    // 次要文字
      root.style.setProperty('--text-muted', '#6e7681');        // 弱化文字
      root.style.setProperty('--accent', '#0969da');           // 品牌蓝色
      root.style.setProperty('--accent-hover', '#0860ca');     // 悬停蓝色
      root.style.setProperty('--accent-light', '#1f6feb');     // 亮蓝色
      root.style.setProperty('--success', '#2ea043');          // 成功色
      root.style.setProperty('--warning', '#f0b27a');          // 警告色
      root.style.setProperty('--danger', '#ff6b81');           // 危险色
      root.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.3)'); // 阴影
    } else {
      // 浅色主题 - GitHub风格的浅色主题
      root.style.setProperty('--bg-primary', '#ffffff');        // 白色背景
      root.style.setProperty('--bg-secondary', '#f6f8fa');      // 浅灰背景
      root.style.setProperty('--bg-tertiary', '#f3f4f6');       // 第三层背景
      root.style.setProperty('--panel', '#ffffff');            // 白色面板
      root.style.setProperty('--panel-dark', '#f6f8fa');       // 深色面板
      root.style.setProperty('--panel-light', '#ffffff');      // 浅色面板
      root.style.setProperty('--border', '#d0d7de');           // 边框色
      root.style.setProperty('--border-light', '#e1e4e8');     // 浅边框
      root.style.setProperty('--text-primary', '#24292f');     // 主要文字
      root.style.setProperty('--text-secondary', '#656d76');    // 次要文字
      root.style.setProperty('--text-muted', '#8b949e');        // 弱化文字
      root.style.setProperty('--accent', '#0969da');           // 品牌蓝色
      root.style.setProperty('--accent-hover', '#0860ca');     // 悬停蓝色
      root.style.setProperty('--accent-light', '#1f6feb');     // 亮蓝色
      root.style.setProperty('--success', '#2ea043');          // 成功色
      root.style.setProperty('--warning', '#f0b27a');          // 警告色
      root.style.setProperty('--danger', '#ff6b81');           // 危险色
      root.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.1)'); // 阴影
    }

    // 保存主题设置
    localStorage.setItem('markviz-theme', isDarkMode ? 'dark' : 'light');

    // 设置body背景色
    document.body.style.backgroundColor = 'var(--bg-primary)';
    document.body.style.color = 'var(--text-primary)';
  }, [isDarkMode]);

  // 检查是否有从主应用传递过来的内容和文件名
  const initialData = React.useMemo(() => {
    const storedContent = sessionStorage.getItem('markdownEditorContent');
    const storedFilename = sessionStorage.getItem('markdownEditorFilename');

    console.log('MarkViz: Checking sessionStorage for data...');
    console.log('MarkViz: Found content:', storedContent ? 'Yes' : 'No');
    console.log('MarkViz: Found filename:', storedFilename || 'No');

    if (storedContent && storedFilename) {
      console.log('MarkViz: Content length:', storedContent.length);
      console.log('MarkViz: Content preview:', storedContent.substring(0, 100));

      // 保存到localStorage，作为"已导入的文件"
      const importedFiles = JSON.parse(localStorage.getItem('importedFiles') || '{}');
      importedFiles[storedFilename] = storedContent;
      localStorage.setItem('importedFiles', JSON.stringify(importedFiles));

      // 清除sessionStorage
      sessionStorage.removeItem('markdownEditorContent');
      sessionStorage.removeItem('markdownEditorFilename');

      return { content: storedContent, filename: storedFilename, autoSelect: true };
    }
    return { content: "", filename: "", autoSelect: false };
  }, []);

  const [viewMode, setViewMode] = useState<ViewMode>('presentation');
  const [content, setContent] = useState<string>(initialData.content);
  const [showFileModal, setShowFileModal] = useState<boolean>(false);
  const [autoSelectFile, setAutoSelectFile] = useState<string>(initialData.filename);
  const [currentFilename, setCurrentFilename] = useState<string>(initialData.filename);
  const [currentLang, setCurrentLang] = useState<Language>(i18n.current);

  // 监听语言变化
  useEffect(() => {
    const unsubscribe = i18n.onChange((lang) => {
      setCurrentLang(lang);
    });
    return unsubscribe;
  }, []);

  // 从localStorage读取已导入的文件列表
  const [importedFiles, setImportedFiles] = useState<Array<{name: string, content: string}>>(() => {
    const stored = JSON.parse(localStorage.getItem('importedFiles') || '{}');
    return Object.entries(stored).map(([name, content]) => ({ name, content: typeof content === 'string' ? content : content.content }));
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          setContent(text);
          setCurrentFilename(file.name); // 设置当前文件名
          setShowFileModal(false);

          // 保存文件到localStorage作为已导入文件
          const importedFiles = JSON.parse(localStorage.getItem('importedFiles') || '{}');
          importedFiles[file.name] = text;
          localStorage.setItem('importedFiles', JSON.stringify(importedFiles));

          // 更新state以刷新文件列表
          const updatedFiles = Object.entries(importedFiles).map(([name, content]) => ({
            name,
            content: typeof content === 'string' ? content : content.content
          }));
          setImportedFiles(updatedFiles);

          console.log('MarkViz: File saved to importedFiles:', file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImportedFileSelect = (fileContent: string, filename: string) => {
    setContent(fileContent);
    setCurrentFilename(filename); // 设置当前文件名
    setShowFileModal(false);
    setAutoSelectFile(""); // 清除自动选择标记
  };

  // 更新当前文件名的函数（用于Presentation组件）
  const updateCurrentFilename = (filename: string) => {
    setCurrentFilename(filename);
  };

  // 文件导出功能
  const exportToFile = (content: string, filename: string) => {
    try {
      // 创建Blob对象
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });

      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // 设置文件名
      const fileExtension = filename.endsWith('.md') ? '' : '.md';
      const downloadFilename = filename || 'edited-markdown-file';
      link.download = downloadFilename + fileExtension;

      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 清理URL对象
      URL.revokeObjectURL(url);

      console.log('MarkViz: File exported successfully:', downloadFilename + fileExtension);
    } catch (error) {
      console.error('MarkViz: Export failed:', error);
      alert('导出失败，请重试');
    }
  };

  const handleSaveOnly = (newContent: string) => {
    setContent(newContent);

    // 优先执行文件导出
    const exportFilename = currentFilename || 'edited-markdown-file';
    exportToFile(newContent, exportFilename);

    // 如果有当前文件名，更新已导入文件的内容
    if (currentFilename) {
      // 更新localStorage中的importedFiles
      const importedFiles = JSON.parse(localStorage.getItem('importedFiles') || '{}');
      importedFiles[currentFilename] = newContent;
      localStorage.setItem('importedFiles', JSON.stringify(importedFiles));

      // 更新state
      const updatedFiles = Object.entries(importedFiles).map(([name, content]) => ({
        name,
        content: typeof content === 'string' ? content : content.content
      }));
      setImportedFiles(updatedFiles);

      console.log('MarkViz: Updated file content:', currentFilename);
    }

    // 检查是否有从主应用传递过来的文件名
    const sessionFilename = sessionStorage.getItem('markdownEditorFilename');
    if (sessionFilename) {
      // 保存到localStorage以便主应用管理
      const savedFiles = JSON.parse(localStorage.getItem('markdownFiles') || '{}');
      savedFiles[sessionFilename] = {
        content: newContent,
        timestamp: Date.now()
      };
      localStorage.setItem('markdownFiles', JSON.stringify(savedFiles));
      sessionStorage.removeItem('markdownEditorFilename'); // 使用后清除
    }

    // 不切换回预览模式，保持在编辑模式
  };

  const handleSaveWithoutExport = (newContent: string) => {
    setContent(newContent);

    // 如果有当前文件名，更新已导入文件的内容
    if (currentFilename) {
      // 更新localStorage中的importedFiles
      const importedFiles = JSON.parse(localStorage.getItem('importedFiles') || '{}');
      importedFiles[currentFilename] = newContent;
      localStorage.setItem('importedFiles', JSON.stringify(importedFiles));

      // 更新state
      const updatedFiles = Object.entries(importedFiles).map(([name, content]) => ({
        name,
        content: typeof content === 'string' ? content : content.content
      }));
      setImportedFiles(updatedFiles);

      console.log('MarkViz: Updated file content:', currentFilename);
    }

    // 检查是否有从主应用传递过来的文件名
    const sessionFilename = sessionStorage.getItem('markdownEditorFilename');
    if (sessionFilename) {
      // 保存到localStorage以便主应用管理
      const savedFiles = JSON.parse(localStorage.getItem('markdownFiles') || '{}');
      savedFiles[sessionFilename] = {
        content: newContent,
        timestamp: Date.now()
      };
      localStorage.setItem('markdownFiles', JSON.stringify(savedFiles));
      sessionStorage.removeItem('markdownEditorFilename'); // 使用后清除
    }

    // 保存后切换回预览模式
    setViewMode('presentation');
  };

  const handleSave = (newContent: string) => {
    setContent(newContent);

    // 优先执行文件导出
    const exportFilename = currentFilename || 'edited-markdown-file';
    exportToFile(newContent, exportFilename);

    // 如果有当前文件名，更新已导入文件的内容
    if (currentFilename) {
      // 更新localStorage中的importedFiles
      const importedFiles = JSON.parse(localStorage.getItem('importedFiles') || '{}');
      importedFiles[currentFilename] = newContent;
      localStorage.setItem('importedFiles', JSON.stringify(importedFiles));

      // 更新state
      const updatedFiles = Object.entries(importedFiles).map(([name, content]) => ({
        name,
        content: typeof content === 'string' ? content : content.content
      }));
      setImportedFiles(updatedFiles);

      console.log('MarkViz: Updated file content:', currentFilename);
    }

    // 检查是否有从主应用传递过来的文件名
    const sessionFilename = sessionStorage.getItem('markdownEditorFilename');
    if (sessionFilename) {
      // 保存到localStorage以便主应用管理
      const savedFiles = JSON.parse(localStorage.getItem('markdownFiles') || '{}');
      savedFiles[sessionFilename] = {
        content: newContent,
        timestamp: Date.now()
      };
      localStorage.setItem('markdownFiles', JSON.stringify(savedFiles));
      sessionStorage.removeItem('markdownEditorFilename'); // 使用后清除
    }

    // 保存后切换回预览模式
    setViewMode('presentation');
  };

  return (
    <div className="min-h-screen font-sans transition-colors duration-300" style={{backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)'}}>
      {viewMode === 'presentation' ? (
        <Presentation
          content={content}
          onEdit={() => setViewMode('editor')}
          onShowFileModal={() => setShowFileModal(true)}
          importedFiles={importedFiles}
          onFileSelect={(content, filename) => {
            handleImportedFileSelect(content, filename);
            updateCurrentFilename(filename);
          }}
          autoSelectFile={autoSelectFile}
          isDarkMode={isDarkMode}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        />
      ) : (
        <Editor
          initialContent={content}
          onSave={handleSave}
          onSaveOnly={handleSaveOnly}
          onSaveWithoutExport={handleSaveWithoutExport}
          onCancel={() => setViewMode('editor')}  // 保持在编辑模式
          isDarkMode={isDarkMode}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        />
      )}

      {/* 文件选择模态框 */}
      {showFileModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ 
            zIndex: 99999,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={(e) => {
            // 点击背景关闭弹窗
            if (e.target === e.currentTarget) {
              setShowFileModal(false);
            }
          }}
        >
          <div className="rounded-xl shadow-2xl max-w-md w-full p-6 transition-colors duration-300"
               style={{backgroundColor: 'var(--panel)', borderColor: 'var(--border)', borderWidth: '1px', position: 'relative', zIndex: 100000}}>
            <h2 className="text-2xl font-bold mb-4 transition-colors duration-300"
                style={{color: 'var(--text-primary)'}}>
              {i18n.t('file.select')}
            </h2>

            <div className="space-y-3">
              {/* 选择之前导入的文件 */}
              <div>
                <h3 className="text-sm font-semibold mb-2 transition-colors duration-300"
                    style={{color: 'var(--text-secondary)'}}>
                  {i18n.t('file.previous')}
                </h3>
                <div className="space-y-2">
                  {importedFiles.length > 0 ? (
                    importedFiles.map((file, index) => (
                      <button
                        key={index}
                        onClick={() => handleImportedFileSelect(file.content, file.name)}
                        className="w-full text-left p-3 rounded-lg border transition-all duration-200 font-medium"
                        style={{borderColor: 'var(--border)', color: 'var(--text-secondary)'}}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                          e.currentTarget.style.borderColor = 'var(--accent)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                      >
                        <div className="font-medium" style={{color: 'var(--text-primary)'}}>{file.name}</div>
                        <div className="text-sm" style={{color: 'var(--text-muted)'}}>{i18n.t('file.click_to_load')}</div>
                      </button>
                    ))
                  ) : (
                    <div className="text-sm p-3 rounded-lg transition-colors duration-300"
                         style={{color: 'var(--text-muted)', borderColor: 'var(--border-light)', borderWidth: '1px', borderStyle: 'dashed'}}>
                      {i18n.t('file.none')}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-3 transition-colors duration-300" style={{borderColor: 'var(--border)'}}>
                {/* 选择本地文件 */}
                <label className="block w-full">
                  <input
                    type="file"
                    accept=".md,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-full font-semibold py-3 px-4 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 text-white"
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
                       }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>{i18n.t('button.select_file')}</span>
                  </div>
                </label>
              </div>
            </div>

            {/* 取消按钮 */}
            <button
              onClick={() => setShowFileModal(false)}
              className="mt-4 w-full py-2 px-4 rounded-lg transition-all duration-200 font-medium"
              style={{color: 'var(--text-secondary)', borderColor: 'var(--border)', borderWidth: '1px'}}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {i18n.t('button.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
