/**
 * Markdown编辑器核心功能
 */
import { DatabaseManager } from '../../js/database.js';

class MarkdownEditor {
  constructor() {
    this.editorContainer = document.getElementById('markdown-editor');
    this.preview = document.getElementById('preview-content');
    this.titleInput = document.getElementById('document-title');
    this.saveStatus = document.getElementById('save-status');
    this.dbManager = new DatabaseManager();
    this.currentDocument = null;
    this.autoSaveTimer = null;
    this.isPreviewMode = true;
    this.debounceTimer = null;
    this.currentCMTheme = 'one-dark';
    this.currentPrismTheme = 'prism-one-dark';

    this.init();
  }

  async init() {
    // 初始化CodeMirror编辑器
    this.initCodeMirror();

    // 检查URL参数，看是否有要打开的文档
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('id');

    if (docId) {
      await this.loadDocument(docId);
    } else {
      // 创建新文档
      this.newDocument();
    }

    // 绑定事件
    this.bindEvents();

    // 开始自动保存
    this.startAutoSave();

    // 初始预览
    this.updatePreview();
  }

  initCodeMirror() {
    // 初始化CodeMirror编辑器
    this.editor = CodeMirror(this.editorContainer, {
      mode: 'markdown',
      theme: 'one-dark',
      lineNumbers: true,
      lineWrapping: true,
      autoCloseBrackets: true,
      matchBrackets: true,
      styleActiveLine: true,
      indentUnit: 4,
      tabSize: 4,
      indentWithTabs: false,
      extraKeys: {
        "Enter": "newlineAndIndentMarkdownList",
        "Cmd-B": this.bold.bind(this),
        "Ctrl-B": this.bold.bind(this),
        "Cmd-I": this.italic.bind(this),
        "Ctrl-I": this.italic.bind(this),
        "Cmd-K": this.link.bind(this),
        "Ctrl-K": this.link.bind(this),
        "Shift-Cmd-C": this.code.bind(this),
        "Shift-Ctrl-C": this.code.bind(this),
        "Cmd-/": this.comment.bind(this),
        "Ctrl-/": this.comment.bind(this)
      }
    });

    // 设置编辑器初始内容
    this.editor.setValue(`# 开始编写您的演示文稿...

支持以下功能：
- 标题、列表、表格、代码块
- 插入图片、链接
- 嵌入PDF、PPT文件
- 插入视频、音频
- JavaScript可视化图表
- 数学公式

## JavaScript 代码预览测试

\`\`\`javascript
// 点击右上角的预览按钮来执行这段代码
console.log("Hello, World!");
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((a, b) => a + b, 0);
console.log("数组求和:", sum);
console.log("当前时间:", new Date().toLocaleString());

// 创建一个对象
const person = {
  name: "张三",
  age: 25,
  skills: ["JavaScript", "HTML", "CSS"]
};
console.log("用户信息:", person);
\`\`\`

## HTML 代码预览测试

\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <title>测试页面</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
      color: white;
    }
    .container {
      background: rgba(255, 255, 255, 0.1);
      padding: 20px;
      border-radius: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello HTML!</h1>
    <p>这是一个HTML预览测试</p>
    <button onclick="alert('按钮被点击了！')">点击我</button>
  </div>
</body>
</html>
\`\`\`

## CSS 代码预览测试

\`\`\`css
/* 这些样式会应用到下面的演示元素 */
.demo-button {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.demo-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.demo-box {
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
\`\`\`

## JSON 格式预览测试

\`\`\`json
{
  "name": "测试项目",
  "version": "1.0.0",
  "author": {
    "name": "开发者",
    "email": "dev@example.com"
  },
  "dependencies": {
    "marked": "^4.0.0",
    "prismjs": "^1.29.0"
  },
  "scripts": {
    "start": "node server.js",
    "test": "jest",
    "build": "webpack"
  }
}
\`\`\`

示例：
![图片](image.png)

{% embed type="pdf" src="document.pdf" width="100%" height="600px" %}

{% embed type="video" src="video.mp4" controls="true" %}

{% chart type="bar" data="data.json" %}`);

    // 监听编辑器内容变化
    this.editor.on('change', () => {
      this.debounceUpdate();
      this.markAsChanged();
    });
  }

  bindEvents() {
    // 编辑器内容变化已在CodeMirror初始化中处理

    // 标题变化
    this.titleInput.addEventListener('input', () => {
      this.markAsChanged();
    });

    // 保存按钮
    document.getElementById('save-btn').addEventListener('click', () => {
      this.save();
    });

    // 导出按钮
    document.getElementById('export-btn').addEventListener('click', () => {
      this.export();
    });

    // 预览切换
    document.getElementById('preview-toggle').addEventListener('click', () => {
      this.togglePreview();
    });

    // 分隔条拖动
    this.initResizer();

    // 键盘快捷键
    this.editor.addEventListener('keydown', (e) => {
      this.handleKeyboard(e);
    });

    // 拖拽上传文件
    this.initDragDrop();
  }

  debounceUpdate() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.updatePreview();
    }, 300);
  }

  updatePreview() {
    if (!this.isPreviewMode) return;

    const markdown = this.editor.getValue();

    // 自定义渲染器
    const renderer = new marked.Renderer();

    // 重写代码块渲染，添加预览按钮
    renderer.code = (code, language) => {
      console.log('Custom renderer called with language:', language); // 调试代码

      const lang = language || '';
      const codeId = `code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // 应用Prism语法高亮
      let highlightedCode = this.escapeHtml(code);
      if (lang && Prism.languages[lang]) {
        highlightedCode = Prism.highlight(code, Prism.languages[lang], lang);
      }

      // 检查是否需要添加预览按钮
      if (this.shouldAddPreviewButton(lang)) {
        console.log('Adding preview button for language:', lang); // 调试代码
        return `
          <div class="code-block-container" data-code-id="${codeId}">
            <div class="code-block-header">
              <span class="code-language">${lang}</span>
              <div class="code-actions">
                <button class="code-preview-btn" onclick="toggleCodePreview('${codeId}', '${lang}')" title="实时预览">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
                <button class="code-copy-btn" onclick="copyCode('${codeId}')" title="复制代码">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                </button>
              </div>
            </div>
            <pre class="code-block"><code class="language-${lang}" id="code-content-${codeId}" data-raw-code="${this.escapeHtml(code)}">${highlightedCode}</code></pre>
            <div class="code-preview" id="preview-${codeId}" style="display: none;">
              <div class="preview-header">
                <span>实时预览</span>
                <button class="preview-refresh-btn" onclick="refreshPreview('${codeId}', '${lang}')" title="刷新">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </button>
              </div>
              <div class="preview-content" id="preview-content-${codeId}">
                <!-- 预览内容将在这里生成 -->
              </div>
            </div>
          </div>
        `;
      }

      // 普通代码块，也应用语法高亮
      const langClass = language ? `language-${language}` : '';
      return `<pre><code class="${langClass}">${highlightedCode}</code></pre>`;
    };

    // 处理嵌入的媒体
    renderer.paragraph = (text) => {
      // 检查是否是嵌入标签
      if (text.startsWith('{% embed')) {
        return this.renderEmbeddedMedia(text);
      }

      // 检查是否是图表标签
      if (text.startsWith('{% chart')) {
        return this.renderChart(text);
      }

      // 普通段落
      return `<p>${text}</p>`;
    };

    // 配置marked
    marked.setOptions({
      renderer: renderer,
      breaks: true,
      gfm: true
    });

    // 渲染Markdown
    const html = marked.parse(markdown);
    this.preview.innerHTML = html;

    // 处理特殊标签
    this.processSpecialTags();
  }

  renderEmbeddedMedia(text) {
    try {
      // 解析嵌入标签
      const match = text.match(/{% embed type="([^"]+)" src="([^"]+)"([^}]+) %}/);
      if (!match) return text;

      const [, type, src, options] = match;
      const attrs = this.parseOptions(options);

      const id = `embed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      switch (type) {
        case 'pdf':
          return `
            <div class="embedded-media" id="${id}">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-600">PDF文档</span>
                <button onclick="toggleFullscreen('${id}')" class="text-gray-500 hover:text-gray-700">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                  </svg>
                </button>
              </div>
              <iframe src="${src}" width="${attrs.width || '100%'}" height="${attrs.height || '600px'}" class="border rounded"></iframe>
            </div>
          `;

        case 'ppt':
          return `
            <div class="embedded-media" id="${id}">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-600">PPT演示</span>
                <button onclick="openPPTViewer('${src}')" class="text-gray-500 hover:text-gray-700">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                </button>
              </div>
              <div class="bg-gray-100 p-8 text-center rounded">
                <svg class="w-16 h-16 mx-auto mb-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0l1 16h8l1-16M9 9h6m-6 4h6"></path>
                </svg>
                <p class="text-gray-600">PowerPoint文档</p>
                <p class="text-sm text-gray-500 mt-1">点击查看演示</p>
              </div>
            </div>
          `;

        case 'video':
          return `
            <div class="embedded-media">
              <video src="${src}" ${attrs.controls || 'controls'} class="w-full rounded" ${attrs.poster ? `poster="${attrs.poster}"` : ''}>
                您的浏览器不支持视频播放
              </video>
            </div>
          `;

        case 'audio':
          return `
            <div class="embedded-media">
              <audio src="${src}" ${attrs.controls || 'controls'} class="w-full">
                您的浏览器不支持音频播放
              </audio>
            </div>
          `;

        default:
          return `<div class="text-red-500">不支持的媒体类型: ${type}</div>`;
      }
    } catch (e) {
      console.error('渲染嵌入媒体失败:', e);
      return `<div class="text-red-500">渲染失败: ${text}</div>`;
    }
  }

  renderChart(text) {
    try {
      const match = text.match(/{% chart type="([^"]+)"([^}]+) %}/);
      if (!match) return text;

      const [, type, options] = match;
      const attrs = this.parseOptions(options);

      const id = `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return `
        <div class="viz-container" id="${id}"></div>
        <script>
          // 这里可以根据type和attrs渲染不同的图表
          // 例如使用Chart.js、D3.js等库
          document.getElementById('${id}').innerHTML = '<div class="flex items-center justify-center h-full text-gray-500">图表: ${type}</div>';
        </script>
      `;
    } catch (e) {
      console.error('渲染图表失败:', e);
      return `<div class="text-red-500">图表渲染失败</div>`;
    }
  }

  parseOptions(options) {
    const attrs = {};
    const matches = options.matchAll(/(\w+)="([^"]+)"/g);
    for (const match of matches) {
      attrs[match[1]] = match[2];
    }
    return attrs;
  }

  processSpecialTags() {
    // 处理代码高亮
    Prism.highlightAllUnder(this.preview);
  }

  togglePreview() {
    this.isPreviewMode = !this.isPreviewMode;
    const btn = document.getElementById('preview-toggle');
    btn.textContent = this.isPreviewMode ? '实时预览' : '预览已关闭';

    if (this.isPreviewMode) {
      this.updatePreview();
    } else {
      this.preview.innerHTML = '<div class="text-center text-gray-500 mt-20">预览已关闭</div>';
    }
  }

  initResizer() {
    const resizer = document.getElementById('resizer');
    const editorPane = document.querySelector('.editor-pane');
    const previewPane = document.querySelector('.preview-pane');

    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    resizer.addEventListener('mousedown', (e) => {
      isResizing = true;
      startX = e.pageX;
      startWidth = editorPane.offsetWidth;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;

      const width = startWidth + e.pageX - startX;
      const percent = (width / document.body.offsetWidth) * 100;

      if (percent > 20 && percent < 80) {
        editorPane.style.flex = `0 0 ${percent}%`;
        previewPane.style.flex = `0 0 ${100 - percent}%`;
      }
    });

    document.addEventListener('mouseup', () => {
      isResizing = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    });
  }

  handleKeyboard(e) {
    // Ctrl+S 保存
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      this.save();
    }

    // Ctrl+I 切换预览
    if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      this.togglePreview();
    }

    // Tab键处理已在CodeMirror中处理
  }

  initDragDrop() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      this.editor.addEventListener(eventName, this.preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      this.editor.addEventListener(eventName, () => {
        this.editor.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      this.editor.addEventListener(eventName, () => {
        this.editor.classList.remove('dragover');
      }, false);
    });

    this.editor.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      this.handleFiles(files);
    }, false);
  }

  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  handleFiles(files) {
    [...files].forEach(file => {
      if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/gif') {
        this.insertImage(file);
      } else if (file.type === 'application/pdf') {
        this.insertPDF(file);
      }
    });
  }

  insertImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const markdown = `![${file.name}](${e.target.result})`;
      this.insertText(markdown);
    };
    reader.readAsDataURL(file);
  }

  insertPDF(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const markdown = `{% embed type="pdf" src="${e.target.result}" width="100%" height="600px" %}`;
      this.insertText(markdown);
    };
    reader.readAsDataURL(file);
  }

  insertText(text) {
    const cursor = this.editor.getCursor();
    this.editor.replaceRange(text, cursor);
    this.editor.focus();
    this.updatePreview();
  }

  async newDocument() {
    this.currentDocument = {
      id: null,
      title: '未命名文档',
      content: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.titleInput.value = this.currentDocument.title;
    this.editor.setValue('');
    this.updatePreview();
  }

  async loadDocument(id) {
    try {
      // 从数据库加载文档
      const docs = await this.dbManager.getUserDocuments();
      const doc = docs.find(d => d.id == id);

      if (doc) {
        this.currentDocument = doc;
        this.titleInput.value = doc.title;
        this.editor.setValue(doc.content || '');
        this.updatePreview();
        this.saveStatus.textContent = '已加载';
      }
    } catch (e) {
      console.error('加载文档失败:', e);
      alert('加载文档失败');
    }
  }

  async save() {
    try {
      this.currentDocument.title = this.titleInput.value || '未命名文档';
      this.currentDocument.content = this.editor.getValue();
      this.currentDocument.updated_at = new Date().toISOString();

      if (this.currentDocument.id) {
        // 更新现有文档
        await this.dbManager.updateDocument(this.currentDocument.id, this.currentDocument);
      } else {
        // 创建新文档
        const result = await this.dbManager.createDocument(this.currentDocument);
        this.currentDocument.id = result.id;

        // 更新URL
        const url = new URL(window.location);
        url.searchParams.set('id', this.currentDocument.id);
        window.history.replaceState({}, '', url);
      }

      this.saveStatus.textContent = '已保存 ' + new Date().toLocaleTimeString();
      this.saveStatus.classList.remove('text-yellow-400');
      this.saveStatus.classList.add('text-green-400');

      setTimeout(() => {
        this.saveStatus.classList.remove('text-green-400');
        this.saveStatus.classList.add('text-gray-400');
      }, 2000);
    } catch (e) {
      console.error('保存失败:', e);
      alert('保存失败: ' + e.message);
    }
  }

  markAsChanged() {
    if (this.saveStatus.textContent !== '正在输入...') {
      this.saveStatus.textContent = '正在输入...';
      this.saveStatus.classList.remove('text-green-400', 'text-gray-400');
      this.saveStatus.classList.add('text-yellow-400');
    }
  }

  startAutoSave() {
    // 每5秒自动保存一次
    setInterval(() => {
      if (this.currentDocument && this.saveStatus.textContent === '正在输入...') {
        this.save();
      }
    }, 5000);
  }

  export() {
    const content = this.editor.getValue();
    const title = this.titleInput.value || '未命名文档';
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 主题切换功能
  switchEditorTheme(cmTheme, prismTheme) {
    // 切换CodeMirror主题
    this.editor.setOption('theme', cmTheme);
    this.currentCMTheme = cmTheme;

    // 切换Prism主题
    const prismThemes = document.querySelectorAll('[id^="prism-theme-"]');
    prismThemes.forEach(theme => {
      theme.disabled = true;
    });

    const selectedPrismTheme = document.getElementById(`prism-theme-${prismTheme.replace('prism-', '')}`);
    if (selectedPrismTheme) {
      selectedPrismTheme.disabled = false;
    }
    this.currentPrismTheme = prismTheme;

    // 重新高亮预览区域
    this.updatePreview();

    // 保存主题设置到localStorage
    localStorage.setItem('markdown-editor-themes', JSON.stringify({
      cmTheme: cmTheme,
      prismTheme: prismTheme
    }));
  }

  // 加载保存的主题
  loadSavedThemes() {
    const saved = localStorage.getItem('markdown-editor-themes');
    if (saved) {
      try {
        const themes = JSON.parse(saved);
        this.switchEditorTheme(themes.cmTheme || 'one-dark', themes.prismTheme || 'prism-one-dark');
      } catch (e) {
        console.error('Failed to load saved themes:', e);
      }
    }
  }

  // CodeMirror快捷键功能
  bold() {
    this.surroundSelection('**', '**');
  }

  italic() {
    this.surroundSelection('*', '*');
  }

  link() {
    const selection = this.editor.getSelection();
    const linkText = selection || '链接文字';
    this.editor.replaceSelection(`[${linkText}](url)`);
  }

  code() {
    this.surroundSelection('`', '`');
  }

  comment() {
    const cursor = this.editor.getCursor();
    const line = this.editor.getLine(cursor.line);
    if (line.trim().startsWith('<!--')) {
      // 取消注释
      this.editor.replaceRange(line.replace(/<!--\s*(.*?)\s*-->/, '$1'),
        {line: cursor.line, ch: 0}, {line: cursor.line, ch: line.length});
    } else {
      // 添加注释
      this.editor.replaceRange(`<!-- ${line} -->`,
        {line: cursor.line, ch: 0}, {line: cursor.line, ch: line.length});
    }
  }

  surroundSelection(before, after) {
    const selection = this.editor.getSelection();
    if (selection) {
      this.editor.replaceSelection(before + selection + after);
    } else {
      const cursor = this.editor.getCursor();
      this.editor.replaceSelection(before + after);
      this.editor.setCursor(cursor.line, cursor.ch + before.length);
    }
  }

  // 检查语言是否支持预览
  shouldAddPreviewButton(language) {
    const supportedLanguages = ['javascript', 'js', 'html', 'css', 'svg', 'json'];
    return supportedLanguages.includes(language.toLowerCase());
  }

  // HTML转义
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // 生成代码预览
  generatePreview(codeId, language) {
    const codeElement = document.getElementById(`code-content-${codeId}`);
    const previewContent = document.getElementById(`preview-content-${codeId}`);

    if (!codeElement || !previewContent) return;

    // 从data-raw-code属性获取原始代码
    const code = codeElement.getAttribute('data-raw-code') || codeElement.textContent;
    let previewHTML = '';

    try {
      switch (language.toLowerCase()) {
        case 'javascript':
        case 'js':
          previewHTML = this.generateJavaScriptPreview(code);
          break;
        case 'html':
          previewHTML = this.generateHTMLPreview(code);
          break;
        case 'css':
          previewHTML = this.generateCSSPreview(code);
          break;
        case 'svg':
          previewHTML = this.generateSVGPreview(code);
          break;
        case 'json':
          previewHTML = this.generateJSONPreview(code);
          break;
        default:
          previewHTML = '<div class="preview-error">不支持该语言的预览</div>';
      }
    } catch (error) {
      previewHTML = `<div class="preview-error">预览错误: ${error.message}</div>`;
    }

    previewContent.innerHTML = previewHTML;
  }

  // JavaScript预览
  generateJavaScriptPreview(code) {
    // 创建一个安全的执行环境
    const sandboxId = `sandbox-${Date.now()}`;
    return `
      <div class="js-preview">
        <div class="js-output">
          <h4>输出结果:</h4>
          <div id="${sandboxId}" class="js-console"></div>
        </div>
        <div class="js-controls">
          <button onclick="executeJS('${sandboxId}', \`${this.escapeJs(code)}\`)" class="execute-btn">
            执行代码
          </button>
          <button onclick="clearConsole('${sandboxId}')" class="clear-btn">
            清空输出
          </button>
        </div>
      </div>
    `;
  }

  // HTML预览
  generateHTMLPreview(code) {
    return `
      <div class="html-preview">
        <iframe class="html-iframe" srcdoc="${this.escapeHtml(code)}"></iframe>
      </div>
    `;
  }

  // CSS预览
  generateCSSPreview(code) {
    return `
      <div class="css-preview">
        <style>
          .css-demo {
            padding: 20px;
            background: white;
            border-radius: 4px;
          }
          ${code}
        </style>
        <div class="css-demo">
          <h3>CSS样式演示</h3>
          <p>这是一个演示段落，将应用您定义的CSS样式。</p>
          <button class="demo-button">示例按钮</button>
          <div class="demo-box">示例盒子</div>
        </div>
      </div>
    `;
  }

  // SVG预览
  generateSVGPreview(code) {
    return `
      <div class="svg-preview">
        ${code}
      </div>
    `;
  }

  // JSON预览
  generateJSONPreview(code) {
    try {
      const parsed = JSON.parse(code);
      return `
        <div class="json-preview">
          <pre class="json-formatted">${JSON.stringify(parsed, null, 2)}</pre>
        </div>
      `;
    } catch (e) {
      return `<div class="preview-error">无效的JSON格式</div>`;
    }
  }

  // 转义JavaScript代码
  escapeJs(code) {
    return code.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
  }
}

// 工具函数
function insertMarkdown(before, after = '') {
  if (window.markdownEditor && window.markdownEditor.editor) {
    const editor = window.markdownEditor.editor;
    const selection = editor.getSelection();
    if (selection) {
      editor.replaceSelection(before + selection + after);
    } else {
      const cursor = editor.getCursor();
      editor.replaceSelection(before + after);
      editor.setCursor(cursor.line, cursor.ch + before.length);
    }
    editor.focus();
    window.markdownEditor.updatePreview();
  }
}

function insertTable() {
  const table = `
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 内容 | 内容 | 内容 |
| 内容 | 内容 | 内容 |
`;
  insertText(table);
}

function insertCodeBlock() {
  const codeBlock = '```\n// 在这里输入代码\n```';
  insertText(codeBlock);
}

function insertText(text) {
  if (window.markdownEditor && window.markdownEditor.editor) {
    window.markdownEditor.insertText(text);
  }
}

function insertMedia() {
  document.getElementById('media-dialog').style.display = 'flex';
}

function closeMediaDialog() {
  document.getElementById('media-dialog').style.display = 'none';
}

function embedMedia(type) {
  closeMediaDialog();

  let template = '';
  switch (type) {
    case 'pdf':
      template = '{% embed type="pdf" src="文档URL" width="100%" height="600px" %}';
      break;
    case 'ppt':
      template = '{% embed type="ppt" src="PPT文件URL" %}';
      break;
    case 'video':
      template = '{% embed type="video" src="视频URL" controls="true" %}';
      break;
    case 'audio':
      template = '{% embed type="audio" src="音频URL" controls="true" %}';
      break;
  }

  insertText(template);
}

function insertVisualization() {
  const chart = '{% chart type="bar" data="data.json" options={} %}';
  insertText(chart);
}

function toggleFullscreen(id) {
  const element = document.getElementById(id);
  element.classList.toggle('fullscreen');
}

function openPPTViewer(src) {
  // 打开PPT查看器
  window.open(`../ppt-viewer/index.html?file=${encodeURIComponent(src)}`, '_blank');
}

// 主题切换功能
function toggleThemeDropdown() {
  const dropdown = document.getElementById('theme-dropdown');
  dropdown.classList.toggle('show');

  // 点击其他地方关闭下拉菜单
  document.addEventListener('click', function closeDropdown(e) {
    if (!e.target.closest('.theme-selector')) {
      dropdown.classList.remove('show');
      document.removeEventListener('click', closeDropdown);
    }
  });
}

function switchTheme(cmTheme, prismTheme) {
  if (window.markdownEditor) {
    window.markdownEditor.switchEditorTheme(cmTheme, prismTheme);

    // 更新选中状态
    const options = document.querySelectorAll('.theme-option');
    options.forEach(option => {
      option.classList.remove('active');
    });

    // 找到对应的选项并激活
    const activeOption = document.querySelector(`[onclick="switchTheme('${cmTheme}', '${prismTheme}')"]`);
    if (activeOption) {
      activeOption.classList.add('active');
    }
  }
}

// 代码预览相关全局函数
function toggleCodePreview(codeId, language) {
  const preview = document.getElementById(`preview-${codeId}`);
  const isVisible = preview.style.display !== 'none';

  if (isVisible) {
    preview.style.display = 'none';
  } else {
    preview.style.display = 'block';
    // 生成预览内容
    if (window.markdownEditor) {
      window.markdownEditor.generatePreview(codeId, language);
    }
  }
}

function refreshPreview(codeId, language) {
  if (window.markdownEditor) {
    window.markdownEditor.generatePreview(codeId, language);
  }
}

function copyCode(codeId) {
  const codeElement = document.getElementById(`code-content-${codeId}`);
  if (codeElement) {
    // 从data-raw-code属性获取原始代码
    const text = codeElement.getAttribute('data-raw-code') || codeElement.textContent;
    navigator.clipboard.writeText(text).then(() => {
      // 显示复制成功提示
      const btn = event.target.closest('.code-copy-btn');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
      btn.classList.add('copy-success');
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.classList.remove('copy-success');
      }, 2000);
    });
  }
}

// JavaScript执行环境
function executeJS(sandboxId, code) {
  const output = document.getElementById(sandboxId);
  if (!output) return;

  // 创建自定义console对象
  const customConsole = {
    log: (...args) => {
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          return JSON.stringify(arg, null, 2);
        }
        return String(arg);
      }).join(' ');

      output.innerHTML += `<div class="console-log">${escapeHtml(message)}</div>`;
    },
    error: (...args) => {
      const message = args.join(' ');
      output.innerHTML += `<div class="console-error">${escapeHtml(message)}</div>`;
    },
    warn: (...args) => {
      const message = args.join(' ');
      output.innerHTML += `<div class="console-warn">${escapeHtml(message)}</div>`;
    },
    clear: () => {
      output.innerHTML = '';
    }
  };

  try {
    // 创建安全的执行函数
    const func = new Function('console', code);
    func(customConsole);
  } catch (error) {
    customConsole.error(error.message);
  }

  // 滚动到底部
  output.scrollTop = output.scrollHeight;
}

function clearConsole(sandboxId) {
  const output = document.getElementById(sandboxId);
  if (output) {
    output.innerHTML = '';
  }
}

// HTML转义辅助函数
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// 初始化编辑器
document.addEventListener('DOMContentLoaded', () => {
  window.markdownEditor = new MarkdownEditor();
  window.markdownEditor.loadSavedThemes(); // 加载保存的主题
});