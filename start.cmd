@echo off
cd /d "%~dp0"
start /min "" node api_server.js
start /min "" npx http-server . -p 5020 -c-1
start /min "" cmd /c "cd markviz-presenter && npm run dev"
echo.
echo ========================================
echo   所有服务已启动！
echo ========================================
echo   主应用: http://127.0.0.1:5020/login.html
echo   Markdown编辑器: http://localhost:3000
echo   账号: admin / 123123
echo ========================================
timeout /t 3 >nul
start http://127.0.0.1:5020/login.html
