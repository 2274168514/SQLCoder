/**
 * 文档演示模块主页面功能
 */
import { DatabaseManager } from '../../js/database.js';
import { I18nManager } from './i18n.js';

// 默认端口配置
const FRONTEND_PORT = 5020;
const API_PORT = 5024;
const API_BASE = `http://localhost:${API_PORT}`;

class DocumentViewer {
  constructor() {
    this.dbManager = new DatabaseManager();
    this.currentDocument = null;
    this.documents = [];
    this.i18nManager = new I18nManager();
    // 从全局设置读取主题，兼容旧版存储
    this.currentTheme = (window.globalSettings && window.globalSettings.theme) 
      || localStorage.getItem('global-theme-preference')
      || localStorage.getItem('theme') 
      || 'dark';
    // 从全局设置读取语言
    this.currentLang = (window.globalSettings && window.globalSettings.language)
      || localStorage.getItem('global-language-preference')
      || localStorage.getItem('preferred-language')
      || 'zh';

    this.init();
  }

  async init() {
    // 初始化主题
    this.applyTheme(this.currentTheme);

    // 初始化国际化
    this.i18nManager.init();
    // 同步语言设置
    if (this.i18nManager.currentLang !== this.currentLang) {
      this.i18nManager.setLanguage && this.i18nManager.setLanguage(this.currentLang);
    }

    // 加载用户文档
    await this.loadDocuments();

    // 绑定事件
    this.bindEvents();

    // 设置PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  bindEvents() {
    // 侧边栏隐藏/显示
    const toggleBtn = document.getElementById('toggle-sidebar');
    const showBtn = document.getElementById('show-sidebar');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    toggleBtn.addEventListener('click', () => {
      sidebar.classList.add('hidden');
      mainContent.classList.add('full-width');
      setTimeout(() => {
        sidebar.style.display = 'none';
        showBtn.classList.remove('hidden');
        setTimeout(() => {
          showBtn.classList.add('visible');
        }, 50);
      }, 300);
    });

    showBtn.addEventListener('click', () => {
      showBtn.classList.remove('visible');
      sidebar.style.display = 'flex';
      setTimeout(() => {
        sidebar.classList.remove('hidden');
        mainContent.classList.remove('full-width');
      }, 50);
      setTimeout(() => {
        showBtn.classList.add('hidden');
      }, 300);
    });

    // 文件上传
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');

    // 点击上传
    dropZone.addEventListener('click', () => {
      fileInput.click();
    });

    // 文件选择
    fileInput.addEventListener('change', (e) => {
      this.handleFileUpload(e.target.files);
    });

    // 拖拽上传
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      this.handleFileUpload(e.dataTransfer.files);
    });

    // 刷新按钮（可能不存在）
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadDocuments();
      });
    }

    // 工具栏按钮
    this.bindToolbarEvents();

    // 主题切换
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        console.log('Theme toggle clicked!');
        this.toggleTheme();
      });
      console.log('Theme toggle button bound successfully');
    } else {
      console.error('Theme toggle button not found!');
    }

    // 语言切换
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
      langToggle.addEventListener('click', () => {
        console.log('Language toggle clicked!');
        this.i18nManager.toggleLanguage();
      });
      console.log('Language toggle button bound successfully');
    } else {
      console.error('Language toggle button not found!');
    }
  }

  bindToolbarEvents() {
    // 缩放控制
    let zoomLevel = 100;
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const zoomLevelSpan = document.getElementById('zoom-level');

    zoomInBtn.addEventListener('click', () => {
      if (zoomLevel < 200) {
        zoomLevel += 25;
        this.updateZoom(zoomLevel);
        zoomLevelSpan.textContent = `${zoomLevel}%`;
      }
    });

    zoomOutBtn.addEventListener('click', () => {
      if (zoomLevel > 25) {
        zoomLevel -= 25;
        this.updateZoom(zoomLevel);
        zoomLevelSpan.textContent = `${zoomLevel}%`;
      }
    });

    // 全屏按钮
    document.getElementById('fullscreen-btn').addEventListener('click', () => {
      this.toggleFullscreen();
    });

    // 下载按钮
    document.getElementById('download-btn').addEventListener('click', () => {
      this.downloadDocument();
    });
  }

  async loadDocuments() {
    try {
      this.documents = await this.dbManager.getUserDocuments();
      this.renderDocumentList();
    } catch (error) {
      console.error('加载文档失败:', error);
      this.showMessage(this.i18nManager.t('load_failed'), 'error');
    }
  }

  renderDocumentList() {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';

    if (this.documents.length === 0) {
      fileList.innerHTML = `
        <div class="text-center text-gray-500 py-8">
          <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p data-i18n="no_documents">${this.i18nManager.t('no_documents')}</p>
        </div>
      `;
      return;
    }

    this.documents.forEach(doc => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.innerHTML = `
        <div class="file-icon ${doc.type}">
          ${this.getFileIcon(doc.type)}
        </div>
        <div class="flex-1">
          <h4 class="text-white font-medium">${doc.title}</h4>
          <p class="text-gray-400 text-sm">${this.formatDate(doc.updated_at)}</p>
        </div>
        <button onclick="documentViewer.deleteDocument(${doc.id})" class="text-gray-400 hover:text-red-400 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      `;

      fileItem.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          this.openDocument(doc);
        }
      });

      fileList.appendChild(fileItem);
    });
  }

  getFileIcon(type) {
    const icons = {
      markdown: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-1a1 1 0 100-2 2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clip-rule="evenodd"/></svg>',
      pdf: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/></svg>'
    };
    return icons[type] || '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/></svg>';
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return this.i18nManager.t('today');
    if (days === 1) return this.i18nManager.t('yesterday');
    if (days < 7) return `${days}${this.i18nManager.t('days_ago')}`;
    return date.toLocaleDateString();
  }

  async openDocument(doc) {
    this.currentDocument = doc;

    // 更新标题
    document.getElementById('document-title').textContent = doc.title;
    document.getElementById('document-info').textContent = this.formatDate(doc.updated_at);

    // 显示预览区域
    document.getElementById('welcome-message').classList.add('hidden');
    document.getElementById('document-viewer').classList.remove('hidden');

    // 启用工具栏按钮
    document.getElementById('zoom-in').disabled = false;
    document.getElementById('zoom-out').disabled = false;
    document.getElementById('fullscreen-btn').disabled = false;
    document.getElementById('download-btn').disabled = false;

    // 更新文件列表选中状态
    document.querySelectorAll('.file-item').forEach(item => {
      item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');

    // 根据文档类型渲染
    switch (doc.type) {
      case 'markdown':
        await this.renderMarkdown(doc.content);
        break;
      case 'pdf':
        await this.renderPDF(doc.id, doc.file_path);
        break;
      default:
        this.showMessage(this.i18nManager.t('unsupported_type'), 'error');
    }
  }

  async renderMarkdown(content) {
    const viewer = document.getElementById('document-viewer');

    // 配置marked
    marked.setOptions({
      highlight: (code, lang) => {
        if (Prism.languages[lang]) {
          return Prism.highlight(code, Prism.languages[lang], lang);
        }
        return code;
      },
      breaks: true,
      gfm: true,
      sanitize: false // 允许HTML标签，用于嵌入媒体
    });

    // 渲染Markdown
    const html = marked.parse(content || '');
    viewer.innerHTML = `
      <div class="markdown-viewer">
        ${html}
      </div>
    `;

    // 代码高亮
    Prism.highlightAllUnder(viewer);

    // 处理嵌入的媒体
    this.processEmbeddedMedia(viewer);
  }

  processEmbeddedMedia(viewer) {
    // 处理嵌入的图片
    const images = viewer.querySelectorAll('img');
    images.forEach(img => {
      if (img.src.startsWith('./') || img.src.startsWith('/uploads/')) {
        // 确保图片路径正确
        if (!img.src.startsWith(window.location.origin)) {
          img.src = img.src.startsWith('/') ? img.src : '/' + img.src;
        }
      }
    });

    // 处理嵌入的媒体标签
    const embeds = viewer.querySelectorAll('embed, iframe');
    embeds.forEach(embed => {
      if (embed.src && embed.src.startsWith('./uploads/')) {
        embed.src = embed.src.replace('./uploads/', '/uploads/');
      }
    });
  }

  async renderPDF(docId, filePath) {
    const viewer = document.getElementById('document-viewer');
    viewer.innerHTML = `
      <div id="pdf-container" class="w-full h-full overflow-auto bg-gray-100">
        <div class="loading-spinner mx-auto mt-20"></div>
      </div>
    `;

    try {
      // 获取正确的API服务器地址
      const currentPort = window.location.port;
      const frontendPorts = [String(FRONTEND_PORT), '5021', '3000', '8080', ''];
      const apiBase = frontendPorts.includes(currentPort)
        ? API_BASE 
        : '';

      // 构建正确的文件URL
      let url;
      if (filePath) {
        // 如果有文件路径，使用文件路径
        if (filePath.startsWith('http')) {
          url = filePath;
        } else if (filePath.startsWith('uploads/')) {
          url = `/${filePath}`;
        } else {
          url = `/uploads/${filePath}`;
        }
      } else {
        // 如果没有文件路径，说明PDF存储在数据库中，使用API端点
        url = `${apiBase}/api/documents/${docId}/view`;
      }

      console.log('PDF URL:', url);

      // 设置 PDF.js worker
      if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const pdfDoc = await pdfjsLib.getDocument(url).promise;
        const container = document.getElementById('pdf-container');
        container.innerHTML = '';

        // 渲染所有页面
        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
          const page = await pdfDoc.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          canvas.className = 'pdf-page mb-4';

          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };

          await page.render(renderContext).promise;
          container.appendChild(canvas);
        }
      } else {
        throw new Error('PDF.js 库未加载');
      }
    } catch (error) {
      console.error('加载PDF失败:', error);
      viewer.innerHTML = `
        <div class="flex items-center justify-center h-full">
          <div class="text-center">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-gray-500">${this.i18nManager.t('pdf_load_failed')}</p>
          </div>
        </div>
      `;
    }
  }

  async handleFileUpload(files) {
    [...files].forEach(async file => {
      // 检查文件大小 (200MB限制)
      const maxSize = 200 * 1024 * 1024; // 200MB
      if (file.size > maxSize) {
        this.showMessage(`${this.i18nManager.t('file_too_large')}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`, 'error');
        this.showMessage(this.i18nManager.t('file_too_large') + ' > 200MB', 'error');
        return;
      }

      const type = this.getFileType(file);
      if (!type) {
        this.showMessage(`${this.i18nManager.t('unsupported_type')}: ${file.name}`, 'error');
        return;
      }

      try {
        // 创建FormData上传文件
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const savedUser = sessionStorage.getItem('current-user');
        if (!savedUser) {
          this.showMessage(this.i18nManager.t('please_login'), 'error');
          return;
        }

        formData.append('user_id', JSON.parse(savedUser).id);

        const response = await fetch(`${API_BASE}/api/documents/upload`, {
          method: 'POST',
          body: formData
        });

        // 检查响应状态
        if (!response.ok) {
          const errorText = await response.text();
          console.error('服务器响应错误:', response.status, errorText);
          this.showMessage(`${this.i18nManager.t('upload_failed')}: ${this.i18nManager.t('server_error')} (${response.status})`, 'error');
          return;
        }

        // 尝试解析JSON
        let result;
        try {
          const responseText = await response.text();
          console.log('服务器响应:', responseText);

          if (!responseText.trim()) {
            throw new Error('服务器返回空响应');
          }

          result = JSON.parse(responseText);
        } catch (jsonError) {
          console.error('JSON解析错误:', jsonError);
          this.showMessage(this.i18nManager.t('upload_failed') + ': 服务器响应格式错误', 'error');
          return;
        }

        if (result.success) {
          this.showMessage(this.i18nManager.t('upload_success'), 'success');
          await this.loadDocuments();
        } else {
          this.showMessage(result.message || this.i18nManager.t('upload_failed'), 'error');
        }
      } catch (error) {
        console.error('上传失败:', error);
        this.showMessage(this.i18nManager.t('upload_failed') + ': ' + error.message, 'error');
      }
    });
  }

  getFileType(file) {
    const type = file.type.toLowerCase();
    if (type.includes('pdf')) return 'pdf';
    if (type.includes('markdown') || file.name.endsWith('.md')) return 'markdown';
    return null;
  }

  async deleteDocument(docId) {
    if (!confirm(this.i18nManager.t('delete_confirm'))) return;

    try {
      await this.dbManager.deleteDocument(docId);
      this.showMessage(this.i18nManager.t('delete_success'), 'success');
      await this.loadDocuments();

      // 如果删除的是当前文档，清空预览
      if (this.currentDocument && this.currentDocument.id === docId) {
        this.currentDocument = null;
        document.getElementById('document-title').textContent = this.i18nManager.t('select_document');
        document.getElementById('document-info').textContent = '';
        document.getElementById('welcome-message').classList.remove('hidden');
        document.getElementById('document-viewer').classList.add('hidden');

        // 禁用工具栏按钮
        document.getElementById('zoom-in').disabled = true;
        document.getElementById('zoom-out').disabled = true;
        document.getElementById('fullscreen-btn').disabled = true;
        document.getElementById('download-btn').disabled = true;
      }
    } catch (error) {
      console.error('删除失败:', error);
      this.showMessage(this.i18nManager.t('delete_failed'), 'error');
    }
  }

  updateZoom(level) {
    const viewer = document.getElementById('document-viewer');
    viewer.style.transform = `scale(${level / 100})`;
    viewer.style.transformOrigin = 'top left';
  }

  toggleFullscreen() {
    const viewer = document.getElementById('document-viewer');
    if (!document.fullscreenElement) {
      viewer.requestFullscreen().catch(err => {
        console.error('无法进入全屏:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  downloadDocument() {
    if (!this.currentDocument) return;

    if (this.currentDocument.type === 'markdown' && this.currentDocument.content) {
      // 下载Markdown文件
      const blob = new Blob([this.currentDocument.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.currentDocument.title}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (this.currentDocument.file_path) {
      // 下载文件
      window.open(this.currentDocument.file_path, '_blank');
    }
  }

  showMessage(message, type = 'info') {
    // 创建提示消息
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // 自动消失
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  /**
   * 切换主题
   */
  toggleTheme() {
    console.log('toggleTheme called, current theme:', this.currentTheme);
    console.log('globalSettings available:', !!window.globalSettings);
    
    // 使用全局设置管理器
    if (window.globalSettings) {
      window.globalSettings.toggleTheme();
      this.currentTheme = window.globalSettings.theme;
      console.log('Using globalSettings, new theme:', this.currentTheme);
    } else {
      this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', this.currentTheme);
      console.log('Using localStorage, new theme:', this.currentTheme);
    }
    this.applyTheme(this.currentTheme);
    console.log('Theme applied:', this.currentTheme);
  }

  /**
   * 应用主题
   */
  applyTheme(theme) {
    const root = document.documentElement;
    const body = document.body;
    const themeIconLight = document.getElementById('theme-icon-light');
    const themeIconDark = document.getElementById('theme-icon-dark');

    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      body.classList.add('light-theme');
      if (themeIconLight) themeIconLight.classList.remove('hidden');
      if (themeIconDark) themeIconDark.classList.add('hidden');
    } else {
      root.removeAttribute('data-theme');
      body.classList.remove('light-theme');
      if (themeIconLight) themeIconLight.classList.add('hidden');
      if (themeIconDark) themeIconDark.classList.remove('hidden');
    }
  }

  /**
   * 切换语言
   */
  toggleLanguage() {
    // 使用全局设置管理器
    if (window.globalSettings) {
      window.globalSettings.toggleLanguage();
      this.currentLang = window.globalSettings.language;
    } else {
      this.currentLang = this.currentLang === 'zh' ? 'en' : 'zh';
      localStorage.setItem('preferred-language', this.currentLang);
    }
    this.applyLanguage(this.currentLang);
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  window.documentViewer = new DocumentViewer();
  
  // 监听全局设置变化
  if (window.globalSettings) {
    window.addEventListener('themeChanged', (e) => {
      if (window.documentViewer) {
        window.documentViewer.currentTheme = e.detail.theme;
        window.documentViewer.applyTheme(e.detail.theme);
      }
    });
    
    window.addEventListener('languageChanged', (e) => {
      if (window.documentViewer) {
        window.documentViewer.currentLang = e.detail.language;
        window.documentViewer.applyLanguage(e.detail.language);
      }
    });
  }
});