@echo off
chcp 65001 >nul
title 在线编程教育平台启动器

echo.
echo ========================================
echo    在线编程教育平台启动器
echo ========================================
echo.

:: 启动API服务器
echo [1/3] 启动API服务器...
start "API服务器" cmd /c "node api_server.js"
timeout /t 2 >nul

:: 启动前端服务器
echo [2/3] 启动前端服务器...
start "前端服务器" cmd /c "npm run start:frontend"
timeout /t 2 >nul

:: 启动MarkViz Presenter
echo [3/3] 启动MarkViz Presenter...
cd markviz-presenter
start "MarkViz Presenter" cmd /c "npm run dev"
cd ..

echo.
echo ========================================
echo           服务启动完成
echo ========================================
echo.
echo 访问地址：
echo   主平台:     http://localhost:5020
echo   API接口:    http://localhost:5024/api
echo   MarkViz:    http://localhost:3000
echo.
echo 默认账号：
echo   管理员:    admin / 123123
echo   教师:      teacher1 / 123123
echo   学生:      student1 / 123123
echo.
echo 提示：关闭此窗口不会停止服务
echo      如需停止所有服务，请手动关闭各个命令窗口
echo.
pause