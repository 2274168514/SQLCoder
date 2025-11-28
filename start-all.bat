@echo off
title 在线编程教育平台 - 一键启动
color 0A

echo.
echo ========================================
echo   在线编程教育平台 - 一键启动
echo ========================================
echo.

echo 正在检查 Node.js 是否安装...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [错误] Node.js 未安装！请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo [✓] Node.js 已安装

echo.
echo 正在安装依赖（首次运行需要）...
if not exist node_modules (
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [错误] 依赖安装失败！
        pause
        exit /b 1
    )
)

echo [✓] 依赖已就绪

echo.
echo 正在启动所有服务...
echo.

echo [1/4] 启动后端 API 服务器...
start "API Server" cmd /k "cd /d %~dp0 && node api_server.js"

timeout /t 2 >nul

echo [2/4] 启动前端开发服务器...
start "Frontend Server" cmd /k "cd /d %~dp0 && npm run start:frontend"

timeout /t 2 >nul

echo [3/4] 启动 MarkViz Presenter...
cd markviz-presenter
if not exist node_modules (
    echo 正在安装 MarkViz Presenter 依赖...
    npm install
)
start "MarkViz Presenter" cmd /k "cd /d %~dp0markviz-presenter && npm run dev"
cd ..

timeout /t 2 >nul

echo [4/4] 启动 Markdown Viewer...
cd markdown-viewer
if not exist node_modules (
    echo 正在安装 Markdown Viewer 依赖...
    npm install
)
start "Markdown Viewer" cmd /k "cd /d %~dp0markdown-viewer && npm run dev"
cd ..

echo.
echo ========================================
echo   所有服务已启动！
echo ========================================
echo.
echo 访问地址：
echo   主平台:       http://localhost:5020
echo   API接口:      http://localhost:5024/api
echo   MarkViz:      http://localhost:5173
echo   Markdown:     http://localhost:5174
echo   编辑器:       http://localhost:5020/editor.html
echo.
echo 默认账号：
echo   管理员: admin / 123123
echo   教师:   teacher1 / 123123
echo   学生:   student1 / 123123
echo.
echo 按任意键打开浏览器...
pause >nul

start http://localhost:5020

echo.
echo 服务正在后台运行中...
echo 关闭此窗口不会停止服务
echo 如需停止所有服务，请手动关闭各个命令窗口
echo.