# 在线编程教育平台 - PowerShell 一键启动脚本
# 作者：AI Assistant
# 版本：1.0

# 设置控制台编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 颜色定义
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    Cyan = "Cyan"
    White = "White"
    Gray = "Gray"
}

# 显示带颜色的文本
function Write-ColorText {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Colors[$Color]
}

# 显示分隔线
function Write-Separator {
    param(
        [string]$Title = "",
        [string]$Char = "="
    )
    $len = 60
    if ($Title) {
        $title = " $Title "
        Write-Host ($Char * $len) -ForegroundColor Gray
        Write-Host $Title -ForegroundColor Cyan -NoNewline
        Write-Host ($Char * ($len - $Title.Length)) -ForegroundColor Gray
    } else {
        Write-Host ($Char * $len) -ForegroundColor Gray
    }
}

# 检查进程是否运行
function Test-Port {
    param(
        [int]$Port
    )
    try {
        $listener = [System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners()
        return $listener | Where-Object { $_.Port -eq $Port }
    }
    catch {
        return $false
    }
}

# 主函数
function Main {
    Clear-Host
    Write-Separator "在线编程教育平台 - PowerShell 一键启动"
    Write-Host ""

    Write-ColorText "步骤 1/6：检查运行环境..." -Color Cyan
    # 检查 Node.js
    $nodeVersion = node --version 2>$null
    if (-not $nodeVersion) {
        Write-ColorText "[✗] Node.js 未安装！" -Color Red
        Write-Host ""
        Write-ColorText "请访问以下网址下载安装 Node.js:" -Color Yellow
        Write-ColorText "https://nodejs.org/" -Color Blue
        Write-Host ""
        Read-Host "按 Enter 键退出"
        exit 1
    }
    Write-ColorText "[✓] Node.js 已安装: $nodeVersion" -Color Green

    # 检查项目依赖
    Write-Host ""
    Write-ColorText "步骤 2/6：检查项目依赖..." -Color Cyan
    if (-not (Test-Path "node_modules")) {
        Write-ColorText "[⚠] 依赖未安装，正在执行安装..." -Color Yellow
        npm install
        if ($LASTEXITCODE -neq 0) {
            Write-ColorText "[✗] 依赖安装失败！" -Color Red
            Read-Host "按 Enter 键退出"
            exit 1
        }
        Write-ColorText "[✓] 主项目依赖安装完成" -Color Green
    } else {
        Write-ColorText "[✓] 主项目依赖已安装" - Color Green
    }

    # 检查 MarkViz Presenter
    if (-not (Test-Path "markviz-presenter\node_modules")) {
        Write-ColorText "[⚠] MarkViz Presenter 依赖未安装..." -Color Yellow
        Set-Location markviz-presenter
        npm install
        if ($LASTEXITCODE -neq 0) {
            Write-ColorText "[✗] MarkViz 依赖安装失败！" - Color Red
            Set-Location ..
            Read-Host "按 Enter 键退出"
            exit 1
        }
        Write-ColorText "[✓] MarkViz Presenter 依赖安装完成" - Color Green
        Set-Location ..
    } else {
        Write-ColorText "[✓] MarkViz Presenter 依赖已安装" - Color Green
    }

    # 检查 Markdown Viewer
    if (-not (Test-Path "markdown-viewer\node_modules")) {
        Write-ColorText "[⚠] Markdown Viewer 依赖未安装..." - Color Yellow
        Set-Location markdown-viewer
        npm install
        if ($LASTEXITCODE -neq 0) {
            Write-ColorText "[✗] Markdown Viewer 依赖安装失败！" - Color Red
            Set-Location ..
            Read-Host "按 Enter 键退出"
            exit 1
        }
        Write-ColorText "[✓] Markdown Viewer 依赖安装完成" - Color Green
        Set-Location ..
    } else {
        Write-ColorText "[✓] Markdown Viewer 依赖已安装" - Color Green
    }

    # 启动所有服务
    Write-Host ""
    Write-ColorText "步骤 3/6：启动所有服务..." - Color Cyan
    Write-ColorText "[信息] 正在后台启动服务，请稍候..." - Color Yellow

    # 启动 API 服务器
    $apiJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        Write-Host "正在启动 API 服务器..." -ForegroundColor Cyan
        node api_server.js
    } -Name "API Server"

    # 启动前端服务器
    $frontendJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        Write-Host "正在启动前端服务器..." -ForegroundColor Cyan
        npm run start:frontend
    } -Name "Frontend Server"

    # 启动 MarkViz Presenter
    $markvizJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD\markviz-presenter
        Write-Host "正在启动 MarkViz Presenter..." -ForegroundColor Cyan
        npm run dev
    } -Name "MarkViz Presenter"

    # 启动 Markdown Viewer
    $markdownJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD\markdown-viewer
        Write-Host "正在启动 Markdown Viewer..." -ForegroundColor Cyan
        npm run dev
    } -Name "Markdown Viewer"

    # 等待服务启动
    Write-Host ""
    Write-ColorText "步骤 4/6：等待服务启动..." - Color Cyan
    Write-Host "等待 8 秒让服务完全启动..." - Color Gray
    Start-Sleep -Seconds 8

    # 检查服务状态
    Write-Host ""
    Write-ColorText "步骤 5/6：检查服务状态..." - Color Cyan
    Write-Separator "服务状态报告"

    # 检查端口
    $services = @(
        @{ Name = "API 服务器"; Port = 5024; Job = $apiJob }
        @{ Name = "前端服务器"; Port = 5020; Job = $frontendJob }
        @{ Name = "MarkViz Presenter"; Port = 5173; Job = $markvizJob }
        @{ Name = "Markdown Viewer"; Port = 5174; Job = $markdownJob }
    )

    foreach ($service in $services) {
        if (Test-Port $service.Port) {
            Write-ColorText "[✓] $($service.Name) (端口 $($service.Port)) - 运行中" - Color Green
        } else {
            Write-ColorText "[✗] $($service.Name) (端口 $($service.Port)) - 未启动" - Color Red
        }
    }

    # 显示访问地址
    Write-Host ""
    Write-Separator "访问地址"
    Write-Host "主平台:       " -NoNewline -ForegroundColor Gray
    Write-Host "http://localhost:5020" -ForegroundColor Blue -Underline
    Write-Host "API接口:      " -NoNewline -ForegroundColor Gray
    Write-Host "http://localhost:5024/api" -ForegroundColor Blue -Underline
    Write-Host "编辑器:       " -NoNewline -ForegroundColor Gray
    Write-Host "http://localhost:5020/editor.html" -ForegroundColor Blue -Underline
    Write-Host "MarkViz:      " -NoNewline -ForegroundColor Gray
    Write-Host "http://localhost:5173" -ForegroundColor Blue -Underline
    Write-Host "Markdown:     " -NoNewline -ForegroundColor Gray
    Write-Host "http://localhost:5174" -ForegroundColor Blue -Underline

    # 显示默认账号
    Write-Host ""
    Write-Separator "默认账号"
    Write-Host "管理员:      " -NoNewline -ForegroundColor Gray
    Write-Host "admin / 123123" -ForegroundColor White
    Write-Host "教师:        " -NoNewline -ForegroundColor Gray
    Write-Host "teacher1 / 123123" -ForegroundColor White
    Write-Host "学生:        " -NoNewline -ForegroundColor Gray
    Write-Host "student1 / 123123" -ForegroundColor White

    # 完成提示
    Write-Host ""
    Write-Separator "启动完成"
    Write-ColorText "所有服务已成功启动！" - Color Green
    Write-Host ""
    Write-ColorText "提示：" - Color Yellow
    Write-Host "- 所有服务都在后台 PowerShell 任务中运行" -ForegroundColor White
    Write-Host "- 可以通过 Get-Job 命令查看任务状态" -ForegroundColor White
    Write-Host "- 如需停止服务，可以运行：" -ForegroundColor Gray
    Write-Host "  Stop-Job *" -ForegroundColor Cyan
    Write-Host "- 日志会显示在各个任务窗口中" -ForegroundColor White

    # 自动打开浏览器选项
    $openBrowser = Read-Host "是否自动打开浏览器？(Y/N)"
    if ($openBrowser -eq "Y" -or $openBrowser -eq "y") {
        Write-Host ""
        Write-ColorText "正在打开主页面..." - Color Gray
        Start-Process "http://localhost:5020"
        Write-ColorText "已在浏览器中打开" -ForegroundColor Green
    }

    Write-Host ""
    Write-ColorText "按 Enter 键退出..." - Color Gray
    Read-Host

    # 可选：停止所有服务
    $stopServices = Read-Host "是否停止所有服务？(Y/N)"
    if ($stopServices -eq "Y" -or $stopServices -eq "y") {
        Write-Host ""
        Write-ColorText "正在停止所有服务..." - Color Yellow
        Stop-Job $apiJob, $frontendJob, $markvizJob, $markdownJob -ErrorAction SilentlyContinue
        Remove-Job $apiJob, $frontendJob, $markvizJob, $markdownJob -ErrorAction SilentlyContinue
        Write-ColorText "所有服务已停止" - Color Green
    }

    Write-Host ""
    Write-ColorText "感谢使用！" - Color Green
}

# 执行主函数
Main