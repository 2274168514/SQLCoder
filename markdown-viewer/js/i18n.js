/**
 * 国际化语言配置
 */
export const i18nConfig = {
  zh: {
    my_documents: "我的文档",
    document_list: "文档列表",
    upload_document: "上传文档",
    supported_formats: "Markdown, PDF",
    back_to_main: "返回主界面",
    select_document: "请选择或上传文档",
    welcome_title: "欢迎使用文档演示系统",
    welcome_desc: "支持在线预览 PDF 和 Markdown 文件，Markdown 支持嵌入多媒体内容",
    visualization: "可视化图表",
    no_documents: "暂无文档",
    hide_sidebar: "隐藏侧边栏",
    show_sidebar: "显示侧边栏",
    refresh: "刷新",
    toggle_theme: "切换主题",
    toggle_lang: "切换语言",
    zoom_in: "放大",
    zoom_out: "缩小",
    fullscreen: "全屏",
    download: "下载",
    today: "今天",
    yesterday: "昨天",
    days_ago: "天前",
    delete_confirm: "确定要删除这个文档吗？",
    upload_success: "上传成功",
    upload_failed: "上传失败",
    delete_success: "删除成功",
    delete_failed: "删除失败",
    load_failed: "加载失败",
    file_too_large: "文件太大",
    unsupported_type: "不支持的文件类型",
    please_login: "请先登录",
    server_error: "服务器错误",
    pdf_load_failed: "加载PDF失败"
  },
  en: {
    my_documents: "My Documents",
    document_list: "Documents",
    upload_document: "Upload Document",
    supported_formats: "Markdown, PDF",
    back_to_main: "Back to Main",
    select_document: "Please select or upload a document",
    welcome_title: "Welcome to Document Viewer",
    welcome_desc: "Supports online preview of PDF and Markdown files. Markdown supports embedded multimedia content",
    visualization: "Visualization",
    no_documents: "No documents",
    hide_sidebar: "Hide Sidebar",
    show_sidebar: "Show Sidebar",
    refresh: "Refresh",
    toggle_theme: "Toggle Theme",
    toggle_lang: "Toggle Language",
    zoom_in: "Zoom In",
    zoom_out: "Zoom Out",
    fullscreen: "Fullscreen",
    download: "Download",
    today: "Today",
    yesterday: "Yesterday",
    days_ago: " days ago",
    delete_confirm: "Are you sure you want to delete this document?",
    upload_success: "Upload successful",
    upload_failed: "Upload failed",
    delete_success: "Delete successful",
    delete_failed: "Delete failed",
    load_failed: "Load failed",
    file_too_large: "File too large",
    unsupported_type: "Unsupported file type",
    please_login: "Please login first",
    server_error: "Server error",
    pdf_load_failed: "Failed to load PDF"
  }
};

/**
 * 国际化管理器
 */
export class I18nManager {
  constructor() {
    this.currentLang = localStorage.getItem('language') || 'zh';
    this.translations = i18nConfig;
  }

  /**
   * 切换语言
   */
  toggleLanguage() {
    this.currentLang = this.currentLang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('language', this.currentLang);
    this.updateLanguage();
  }

  /**
   * 获取当前语言
   */
  getCurrentLanguage() {
    return this.currentLang;
  }

  /**
   * 获取翻译文本
   */
  t(key) {
    return this.translations[this.currentLang][key] || key;
  }

  /**
   * 更新页面语言
   */
  updateLanguage() {
    // 更新带有data-i18n属性的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = this.t(key);
    });

    // 更新带有data-i18n-title属性的元素
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      element.title = this.t(key);
    });

    // 更新语言按钮显示
    const langText = document.getElementById('lang-text');
    if (langText) {
      langText.textContent = this.currentLang === 'zh' ? 'EN' : '中';
    }

    // 更新HTML lang属性
    document.documentElement.lang = this.currentLang === 'zh' ? 'zh-CN' : 'en-US';

    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { language: this.currentLang }
    }));
  }

  /**
   * 初始化
   */
  init() {
    this.updateLanguage();
  }
}