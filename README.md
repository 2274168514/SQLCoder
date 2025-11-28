# SQLCoder

一个功能强大的可视化编程教育平台，支持在线编程、交互式学习和Markdown演示。

## 🚀 快速启动

**双击 `start.cmd` 一键启动所有服务！**

或在命令行运行：
```cmd
start.cmd
```

启动后自动打开浏览器访问登录页面。

### 访问地址
- 🌐 **主应用**: http://127.0.0.1:5020/login.html
- 📝 **Markdown编辑器**: http://localhost:3000

### 默认账户
| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | 123123 |
| 教师 | teacher1 | 123123 |
| 学生 | student1 | 123123 |

---

## ✨ 功能特色

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

### 📝 Markdown编辑器 (MarkViz Presenter)
独立的高级Markdown编辑器，支持：
- **实时代码预览** - HTML/CSS/JavaScript代码块实时渲染
- **SVG图形渲染** - 直接在Markdown中嵌入SVG
- **D3.js可视化** - 支持D3数据可视化代码
- **PPT演示模式** - Markdown转幻灯片演示
- **主题切换** - 深色/浅色主题
- **中英文切换** - 国际化支持

### 📚 代码高亮支持
| 语言 | 标识符 | 说明 |
|------|--------|------|
| JavaScript | `javascript` | JS语法高亮 |
| HTML | `html` | HTML结构高亮 |
| CSS | `css` | CSS样式高亮 |
| Python | `python` | Python语法高亮 |
| Java | `java` | Java语法高亮 |
| SQL | `sql` | SQL查询高亮 |
| JSON | `json` | JSON数据高亮 |
| JavaScript-Viz | `javascript-viz` | **可运行的JS代码** |

### 🖼️ 多媒体支持
- **图片**: jpg, png, gif, webp, svg, bmp
- **视频**: mp4, webm, ogg, mov, avi
- **文档**: pdf, ppt, pptx, doc, docx
- **音频**: mp3, wav, ogg, flac

### 📚 教育功能
- **用户角色管理** - 管理员、教师、学生三种角色
- **课程管理系统** - 创建课程、管理学生、布置作业
- **作业提交系统** - 学生在线编程作业提交
- **代码模板库** - 教学代码示例共享

---

## 🛠️ 技术架构

| 层级 | 技术栈 |
|------|--------|
| 前端 | JavaScript ES6+ / CodeMirror / React (Markdown编辑器) |
| 后端 | Express.js / MySQL (支持内存模式) |
| Markdown | Marked.js / Prism.js / React-Markdown |
| 可视化 | D3.js / Canvas API / SVG |

---

## 📁 项目结构

```
SQLCoder/
├── start.cmd                 # 🚀 一键启动脚本
├── api_server.js             # 后端API服务
├── login.html                # 登录页面
├── main.html                 # 主应用界面
├── editor.html               # 代码编辑器
├── js/                       # JavaScript模块
├── css/                      # 样式文件
├── markviz-presenter/        # Markdown编辑器 (React)
├── markdown-viewer/          # Markdown查看器
├── ppt-viewer/               # PPT查看器
├── demos/                    # 演示文件
├── code-examples/            # 代码示例
└── uploads/                  # 上传文件目录
```

---

**SQLCoder** - 让编程教育更简单、更互动、更有趣！ 🎉
