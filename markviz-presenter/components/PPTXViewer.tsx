import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, AlertCircle, ExternalLink, Upload, Cloud, Settings, Maximize, Minimize } from 'lucide-react';
import { uploadLocalFileToSupabase, isSupabaseConfigured, configureSupabase } from '../lib/supabase';
import { i18n } from '../i18n';

interface PPTXViewerProps {
  src: string;
  name: string;
}

export const PPTXViewer: React.FC<PPTXViewerProps> = ({ src, name }) => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [publicUrl, setPublicUrl] = useState<string>('');
  const [viewMode, setViewMode] = useState<'embed' | 'download'>('embed');
  const [showConfig, setShowConfig] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [autoUploadDone, setAutoUploadDone] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // 全屏切换
  const toggleFullscreen = async () => {
    if (!previewContainerRef.current) return;
    
    try {
      if (!document.fullscreenElement) {
        await previewContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('全屏切换失败:', err);
    }
  };

  // 监听全屏变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 自动上传到云端
  const autoUploadToCloud = async () => {
    if (!isSupabaseConfigured()) {
      return; // 未配置则跳过自动上传
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      const url = await uploadLocalFileToSupabase(src, (progress) => {
        setUploadProgress(progress);
      });
      setPublicUrl(url);
      // 缓存公网URL
      localStorage.setItem(`ppt_public_url_${src}`, url);
    } catch (err: any) {
      console.error('自动上传失败:', err);
      // 自动上传失败不显示错误，用户可以手动上传
    } finally {
      setUploading(false);
      setAutoUploadDone(true);
    }
  };

  useEffect(() => {
    const loadFile = async () => {
      try {
        setLoading(true);
        setError(null);

        // 检查是否有缓存的公网URL
        const cachedUrl = localStorage.getItem(`ppt_public_url_${src}`);
        if (cachedUrl) {
          setPublicUrl(cachedUrl);
          setAutoUploadDone(true);
        }

        // 如果是本地路径，转换为blob URL
        if (src.startsWith('/') || src.startsWith('file://')) {
          const API_BASE = 'http://localhost:5024';
          const fullSrc = src.startsWith('/') ? `${API_BASE}${src}` : src;
          const response = await fetch(fullSrc);
          if (!response.ok) {
            throw new Error('无法加载文件');
          }
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setFileUrl(url);
          
          // 如果没有缓存的公网URL，自动上传到云端
          if (!cachedUrl) {
            // 延迟执行自动上传，避免阻塞UI
            setTimeout(() => autoUploadToCloud(), 100);
          }
        } else {
          setFileUrl(src);
          // 如果已经是公网URL，直接使用
          if (src.startsWith('http') && !src.includes('localhost')) {
            setPublicUrl(src);
            setAutoUploadDone(true);
          }
        }
      } catch (err: any) {
        console.error('PPTX加载错误:', err);
        setError(`无法加载PPTX文件: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadFile();

    // 清理blob URL
    return () => {
      if (fileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [src]);

  // 上传到 Supabase 获取公网地址
  const handleUploadToCloud = async () => {
    if (!isSupabaseConfigured()) {
      setShowConfig(true);
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);
      const url = await uploadLocalFileToSupabase(src, (progress) => {
        setUploadProgress(progress);
      });
      setPublicUrl(url);
      // 缓存公网URL
      localStorage.setItem(`ppt_public_url_${src}`, url);
    } catch (err: any) {
      console.error('上传失败:', err);
      setError(`上传到云端失败: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleOpenInOffice = () => {
    // 如果有公网URL，使用公网URL
    const urlToUse = publicUrl || (src.startsWith('http') && !src.includes('localhost') ? src : null);
    
    if (!urlToUse) {
      // 没有公网URL，提示用户先上传
      setError('请先点击"上传到云端"按钮获取公网访问地址');
      return;
    }
    
    const officeUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(urlToUse)}`;
    window.open(officeUrl, '_blank');
  };

  const handleSaveConfig = () => {
    if (supabaseUrl && supabaseKey) {
      configureSupabase(supabaseUrl, supabaseKey);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    const API_BASE = 'http://localhost:5024';
    link.href = src.startsWith('/') ? `${API_BASE}${src}` : src;
    link.download = name.endsWith('.pptx') ? name : `${name}.pptx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8" style={{ height: '500px', color: 'var(--text-secondary)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}></div>
          <p className="text-lg">正在加载PPT文件...</p>
        </div>
      </div>
    );
  }

  // 如果正在自动上传，显示上传状态和进度
  if (uploading && !publicUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-8" style={{ height: '500px', color: 'var(--text-secondary)' }}>
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          <Cloud className="h-12 w-12 animate-pulse" style={{ color: 'var(--accent)' }} />
          <p className="text-lg">正在上传到云端...</p>
          
          {/* 进度条 */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{ 
                width: `${uploadProgress}%`,
                backgroundColor: 'var(--accent)',
              }}
            />
          </div>
          
          {/* 进度百分比 */}
          <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
            {uploadProgress}%
          </p>
          
          <p className="text-sm opacity-70">上传完成后将自动显示预览</p>
        </div>
      </div>
    );
  }

  // 配置对话框
  if (showConfig) {
    return (
      <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            配置 Supabase
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            请先在 <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">supabase.com</a> 创建项目，
            然后创建一个名为 <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">ppt-files</code> 的公开 Bucket。
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Project URL</label>
              <input
                type="text"
                placeholder="https://xxxxx.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Anon Public Key</label>
              <input
                type="text"
                placeholder="eyJhbGciOiJIUzI1NiIs..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
              >
                保存配置
              </button>
              <button
                onClick={() => setShowConfig(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8" style={{ height: '500px', color: 'var(--text-secondary)' }}>
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            操作提示
          </h3>
          <p className="text-sm mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleUploadToCloud}
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              <Cloud className="h-4 w-4" />
              {uploading ? '上传中...' : '上传到云端'}
            </button>
            <button
              onClick={() => setError(null)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-medium"
            >
              返回
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pptx-viewer w-full">
      {/* 工具栏 */}
      <div className="mb-4 p-4 rounded-lg flex items-center justify-between flex-wrap gap-2" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" style={{ color: 'var(--accent)' }} />
          <span className="font-medium truncate max-w-xs" style={{ color: 'var(--text-primary)' }} title={name}>
            {name}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!publicUrl && (
            <button
              onClick={handleUploadToCloud}
              disabled={uploading}
              className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-1 disabled:opacity-50"
              title={i18n.t('ppt.upload_hint') || '上传到云端获取公网地址'}
            >
              <Upload className="h-4 w-4" />
              {uploading ? (i18n.t('ppt.uploading') || '上传中...') : (i18n.t('ppt.upload') || '上传到云端')}
            </button>
          )}
          <button
            onClick={handleOpenInOffice}
            disabled={!publicUrl}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1 ${
              publicUrl 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'cursor-not-allowed'
            }`}
            style={!publicUrl ? { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' } : {}}
            title={publicUrl ? (i18n.t('ppt.view_online_hint') || '在 Office Online 中预览') : (i18n.t('ppt.upload_first') || '请先上传到云端')}
          >
            <ExternalLink className="h-4 w-4" />
            {i18n.t('ppt.view_online') || '在线查看'}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            {i18n.t('ppt.download') || '下载'}
          </button>
          <button
            onClick={() => setShowConfig(true)}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title={i18n.t('ppt.config') || '配置 Supabase'}
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 预览区域 */}
      {publicUrl ? (
        <div 
          ref={previewContainerRef}
          className="rounded-lg overflow-hidden relative group"
          style={{ 
            aspectRatio: isFullscreen ? 'auto' : '16/9',
            maxHeight: isFullscreen ? '100vh' : '70vh',
            height: isFullscreen ? '100vh' : 'auto',
            backgroundColor: 'var(--bg-secondary)',
            border: isFullscreen ? 'none' : '1px solid var(--border)'
          }}
        >
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(publicUrl)}`}
            width="100%"
            height="100%"
            frameBorder="0"
            title={name}
            style={{ display: 'block' }}
            allowFullScreen
          />
          {/* 全屏按钮 */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-3 right-3 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              backdropFilter: 'blur(4px)'
            }}
            title={isFullscreen ? (i18n.t('ppt.exit_fullscreen') || '退出全屏') : (i18n.t('ppt.fullscreen') || '全屏')}
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
        </div>
      ) : (
        <div 
          className="border-2 border-dashed rounded-lg p-8 text-center"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="space-y-4">
            <Cloud className="h-16 w-16 mx-auto" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
              {i18n.t('media.ppt') || 'PowerPoint 演示文稿'}
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {i18n.t('ppt.upload_prompt') || '点击"上传到云端"按钮，即可使用 Microsoft Office Online 在线预览'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <button
                onClick={handleUploadToCloud}
                disabled={uploading}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Upload className="h-5 w-5" />
                {uploading ? (i18n.t('ppt.uploading') || '正在上传...') : (i18n.t('ppt.upload') || '上传到云端')}
              </button>
              <button
                onClick={handleDownload}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="h-5 w-5" />
                {i18n.t('ppt.download') || '下载文件'}
              </button>
            </div>
            <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
              {i18n.t('ppt.upload_tip') || '提示：上传后文件将存储在云端，微软服务器可以访问并预览'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};