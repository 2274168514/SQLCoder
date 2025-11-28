# SQLCoder

一个功能强大的可视化编程教育平台，支持在线编程、交互式学习和Markdown演示。

## 功能特色

### 🎯 核心功能
- **在线代码编辑器** - 支持HTML、CSS、JavaScript实时编辑和预览
- **Markdown演示系统** - 支持代码高亮、多媒体嵌入和交互式内容
- **文件管理系统** - 虚拟文件系统，支持多文件项目开发
- **实时预览** - 400ms防抖编译，即时查看代码效果

### 🎨 可视化特性
- **D3.js集成** - 支持数据可视化图表和交互式图形
- **PPT演示模式** - 支持PowerPoint文件在线预览
- **PDF文档查看** - 内置PDF阅读器
- **多媒体支持** - 图片、视频无缝嵌入

### 📝 Markdown预览功能
- **丰富的代码高亮支持**：
  - `javascript` - JavaScript代码语法高亮
  - `css` - CSS样式语法高亮
  - `html` - HTML结构语法高亮
  - `json` - JSON数据格式高亮
  - `python` - Python代码语法高亮
  - `java` - Java代码语法高亮
  - `sql` - SQL查询语法高亮
  - `javascript-viz` - **特色功能**：可运行的JavaScript代码演示

- **增强的Markdown渲染**：
  - GitHub Flavored Markdown (GFM) 支持
  - 任务列表 `[ ]` 和 `[x]`
  - 表格自动格式化和响应式设计
  - 锚点链接，支持标题跳转
  - 代码块一键复制功能
  - 外部链接自动识别和图标显示

- **多媒体文件预览**：
  - 图片格式：`jpg`, `jpeg`, `png`, `gif`, `webp`, `svg`, `bmp`
  - 视频格式：`mp4`, `webm`, `ogg`, `mov`, `avi`, `mkv`
  - 文档格式：`pdf`, `ppt`, `pptx`, `doc`, `docx`, `xls`, `xlsx`
  - 音频格式：`mp3`, `wav`, `ogg`, `flac`
  - 压缩格式：`zip`, `rar`, `7z`, `tar`, `gz`

- **交互式代码演示** (`javascript-viz`):
  ```javascript-viz
  // 可直接运行的JavaScript代码示例
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  document.querySelector('.js-viz-output').appendChild(canvas);

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(50, 50, 100, 100);
  ctx.fillStyle = '#2196F3';
  ctx.beginPath();
  ctx.arc(200, 100, 50, 0, Math.PI * 2);
  ctx.fill();
  ```

### 📚 教育功能
- **用户角色管理** - 支持管理员、教师、学生三种角色
- **课程管理系统** - 创建课程、管理学生、布置作业
- **作业提交系统** - 学生在线编程作业提交和自动评分
- **代码模板库** - 教学代码示例和模板共享

## 快速开始

### 安装和运行

1. **安装依赖**
```bash
npm install
```

2. **启动后端API服务器** (端口5024)
```bash
npm start
```

3. **启动前端开发服务器** (端口5020)
```bash
npm run start:frontend
```

4. **访问应用**
```
http://localhost:5020
```

### 默认账户
- **管理员**: admin / 123123
- **教师**: teacher1 / 123123
- **学生**: student1 / 123123

## Markdown使用示例

### 代码高亮示例
```javascript
// JavaScript示例代码
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// 测试斐波那契数列
for (let i = 0; i < 10; i++) {
    console.log(`fibonacci(${i}) = ${fibonacci(i)}`);
}
```

```css
/* CSS样式示例 */
.card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
}
```

```sql
-- SQL查询示例
SELECT
    u.username,
    u.email,
    COUNT(c.course_id) as course_count
FROM users u
LEFT JOIN user_courses uc ON u.user_id = uc.user_id
LEFT JOIN courses c ON uc.course_id = c.course_id
WHERE u.role = 'teacher'
GROUP BY u.user_id, u.username, u.email
ORDER BY course_count DESC;
```


## 技术架构

- **前端**: 纯JavaScript ES6+ + CodeMirror 6
- **后端**: Express.js + MySQL (支持内存模式)
- **特性**: 实时预览、模块化设计、RBAC权限系统
- **Markdown渲染**: Marked.js + Prism.js语法高亮
- **可视化**: D3.js + Canvas API + SVG

## 📁 项目结构

```
SQLCoder/
├── 📄 main.html              # 主界面
├── 📄 api_server.js          # 后端API服务
├── 📁 js/                    # JavaScript模块
│   ├── 📄 main.js           # 主应用入口
│   ├── 📄 Editor.js         # 代码编辑器
│   ├── 📄 markdownRenderer.js # Markdown渲染器
│   └── 📄 ...              # 其他模块
├── 📁 css/                   # 样式文件
│   ├── 📄 markdown-preview.css # Markdown预览样式
│   └── 📄 ...              # 其他样式
├── 📁 demos/                 # 演示文件
├── 📁 code-examples/         # 代码示例
└── 📁 uploads/              # 上传文件目录
```

---

**SQLCoder** - 让编程教育更简单、更互动、更有趣！
