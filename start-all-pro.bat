@echo off
setlocal enabledelayedexpansion
title 在线编程教育平台 - 专业启动器
color 0B

:: 设置控制台编码为UTF-8
chcp 65001 >nul

:: 创建日志目录
if not exist logs mkdir logs

echo.
echo ╔════════════════════════════════════════════════╗
echo ║           在线编程教育平台 - 专业启动器           ║
echo ╚════════════════════════════════════════════════╝
echo.

:: 检查Node.js
echo [步骤 1/6] 检查运行环境...
where node >nul 2>&1
if !errorlevel! neq 0 (
    echo [✗] Node.js 未安装！
    echo.
    echo 请访问以下网址下载安装 Node.js:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo [✓] Node.js 版本:
node --version

:: 检查项目依赖
echo.
echo [步骤 2/6] 检查项目依赖...
if not exist node_modules (
    echo [⚠] 依赖未安装，正在执行安装...
    call npm install > logs/npm-install.log 2>&1
    if !errorlevel! neq 0 (
        echo [✗] 依赖安装失败！请查看 logs/npm-install.log
        pause
        exit /b 1
    )
    echo [✓] 主项目依赖安装完成
) else (
    echo [✓] 主项目依赖已安装
)

:: 检查 MarkViz Presenter
if not exist markviz-presenter\node_modules (
    echo [⚠] MarkViz Presenter 依赖未安装...
    cd markviz-presenter
    call npm install > ../logs/markviz-install.log 2>&1
    if !errorlevel! neq 0 (
        echo [✗] MarkViz 依赖安装失败！
        cd ..
        pause
        exit /b 1
    )
    echo [✓] MarkViz Presenter 依赖安装完成
    cd ..
) else (
    echo [✓] MarkViz Presenter 依赖已安装
)

:: 检查 Markdown Viewer
if not exist markdown-viewer\node_modules (
    echo [⚠] Markdown Viewer 依赖未安装...
    cd markdown-viewer
    call npm install > ../logs/markdown-install.log 2>&1
    if !errorlevel! neq 0 (
        echo [✗] Markdown Viewer 依赖安装失败！
        cd ..
        pause
        exit /b 1
    )
    echo [✓] Markdown Viewer 依赖安装完成
    cd ..
) else (
    echo [✓] Markdown Viewer 依赖已安装
)

:: 创建启动脚本
echo.
echo [步骤 3/6] 准备启动脚本...
echo @echo off > temp-start-api.bat
echo cd /d "%~dp0" >> temp-start-api.bat
echo title API Server - 端口 5024 >> temp-start-api.bat
echo color 0C >> temp-start-api.bat
echo echo 正在启动 API 服务器... >> temp-start-api.bat
echo node api_server.js >> temp-start-api.bat
echo pause >> temp-start-api.bat

echo @echo off > temp-start-frontend.bat
echo cd /d "%~dp0" >> temp-start-frontend.bat
echo title Frontend Server - 端口 5020 >> temp-start-frontend.bat
echo color 0A >> temp-start-frontend.bat
echo echo 正在启动前端服务器... >> temp-start-frontend.bat
echo npm run start:frontend >> temp-start-frontend.bat
echo pause >> temp-start-frontend.bat

echo @echo off > temp-start-markviz.bat
echo cd /d "%~dp0markviz-presenter" >> temp-start-markviz.bat
echo title MarkViz Presenter - 端口 5173 >> temp-start-markviz.bat
echo color 0E >> temp-start-markviz.bat
echo echo 正在启动 MarkViz Presenter... >> temp-start-markviz.bat
echo npm run dev >> temp-start-markviz.bat
echo pause >> temp-start-markviz.bat

echo @echo off > temp-start-markdown.bat
echo cd /d "%~dp0markdown-viewer" >> temp-start-markdown.bat
echo title Markdown Viewer - 端口 5174 >> temp-start-markdown.bat
echo color 06 >> temp-start-markdown.bat
echo echo 正在启动 Markdown Viewer... >> temp-start-markdown.bat
echo npm run dev >> temp-start-markdown.bat
echo pause >> temp-start-markdown.bat

echo [✓] 启动脚本准备完成

:: 启动所有服务
echo.
echo [步骤 4/6] 启动所有服务...
echo [信息] 正在后台启动服务，请稍候...

start /min "API Server" cmd /c temp-start-api.bat
timeout /t 3 >nul

start /min "Frontend Server" cmd /c temp-start-frontend.bat
timeout /t 3 >nul

start /min "MarkViz Presenter" cmd /c temp-start-markviz.bat
timeout /t 3 >nul

start /min "Markdown Viewer" cmd /c temp-start-markdown.bat
timeout /t 3 >nul

:: 等待服务启动
echo.
echo [步骤 5/6] 等待服务启动...
echo 等待 5 秒让服务完全启动...
timeout /t 5 >nul

:: 检查服务状态
echo.
echo [步骤 6/6] 检查服务状态...

echo.
echo ╔════════════════════════════════════════════════╗
echo ║                  服务状态报告                  ║
echo ╠════════════════════════════════════════════════╣

:: 检查端口占用
echo 检查端口占用状态:
netstat -ano | find ":5024 " >nul && echo [✓] API 服务器 (端口 5024) - 运行中 || echo [✗] API 服务器 (端口 5024) - 未启动
netstat -ano | find ":5020 " >nul && echo [✓] 前端服务器 (端口 5020) - 运行中 || echo [✗] 前端服务器 (端口 5020) - 未启动
netstat -ano | find ":5173 " >nul && echo [✓] MarkViz Presenter (端口 5173) - 运行中 || echo [✗] MarkViz Presenter (端口 5173) - 未启动
netstat -ano | find ":5174 " >nul && echo [✓] Markdown Viewer (端口 5174) - 运行中 || echo [✗] Markdown Viewer (端口 5174) - 未启动

echo ║                                              ║
echo ╠════════════════════════════════════════════════╣
echo ║                  访问地址                         ║
echo ║                                              ║
echo ║   主平台:       http://localhost:5020           ║
echo ║   API接口:      http://localhost:5024/api        ║
echo ║   编辑器:       http://localhost:5020/editor.html  ║
echo ║   MarkViz:      http://localhost:5173            ║
echo ║   Markdown:     http://localhost:5174            ║
echo ║                                              ║
echo ╠════════════════════════════════════════════════╣
echo ║                  默认账号                         ║
echo ║                                              ║
echo ║   管理员:      admin / 123123                   ║
echo ║   教师:        teacher1 / 123123                 ║
echo ║   学生:        student1 / 123123                 ║
echo ║                                              ║
echo ╚════════════════════════════════════════════════╝

echo.
echo 清理临时文件...
del temp-start-*.bat 2>nul

echo.
echo ========================================
echo            所有服务已成功启动！
echo ========================================
echo.
echo 提示：
echo - 所有服务都在后台运行
echo - 关闭此窗口不会停止服务
echo - 如需停止服务，请手动关闭各个服务窗口
echo - 日志文件保存在 logs 目录中
echo.

:: 询问是否打开浏览器
set /p openBrowser=是否自动打开浏览器？(Y/N):
if /i "!openBrowser!"=="Y" (
    echo.
    echo 正在打开主页面...
    start http://localhost:5020
    timeout /t 2 >nul
    echo 已在浏览器中打开
)

echo.
echo 启动完成！按任意键退出...
pause >nul

exit /b 0