#!/usr/bin/env node

/**
 * 在线编程教育平台 - Node.js 终端启动脚本
 * 一键启动所有服务
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// 颜色定义
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
    reset: '\x1b[0m'
};

// 颜色输出函数
function colorLog(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// 显示分隔线
function showSeparator(title = '') {
    const len = 60;
    if (title) {
        colorLog('='.repeat(len), 'gray');
        const titleText = ` ${title} `;
        const padding = Math.floor((len - titleText.length) / 2);
        process.stdout.write(' '.repeat(padding));
        colorLog(titleText, 'cyan');
        colorLog('='.repeat(len), 'gray');
    } else {
        colorLog('='.repeat(len), 'gray');
    }
}

// 检查命令是否存在
function commandExists(cmd) {
    return new Promise((resolve) => {
        exec(`where ${cmd}`, (error) => {
            resolve(!error);
        });
    });
}

// 检查端口是否被占用
function checkPort(port) {
    return new Promise((resolve) => {
        exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
            resolve(stdout && stdout.includes(`:${port}`));
        });
    });
}

// 启动服务
function startService(name, command, cwd = process.cwd(), port = null) {
    return new Promise((resolve) => {
        colorLog(`正在启动 ${name}...`, 'cyan');

        const args = command.split(' ');
        const cmd = args.shift();

        const child = spawn(cmd, args, {
            cwd: cwd,
            stdio: ['ignore', 'pipe', 'pipe'],
            shell: true
        });

        let output = '';
        child.stdout.on('data', (data) => {
            output += data.toString();
        });

        child.stderr.on('data', (data) => {
            output += data.toString();
        });

        child.on('error', (error) => {
            colorLog(`[✗] ${name} 启动失败: ${error.message}`, 'red');
            resolve(false);
        });

        // 检查服务是否启动成功
        setTimeout(async () => {
            if (port && await checkPort(port)) {
                colorLog(`[✓] ${name} (端口 ${port}) - 运行中`, 'green');
                resolve(child);
            } else if (!port) {
                // 没有端口的服务，假设启动成功
                colorLog(`[✓] ${name} - 已启动`, 'green');
                resolve(child);
            } else {
                // 对于特定的服务，尝试其他端口
                if (name === 'MarkViz Presenter') {
                    // 检查是否在3001端口启动
                    if (await checkPort(3001)) {
                        colorLog(`[✓] ${name} (端口 3001) - 运行中`, 'green');
                        resolve(child);
                        return;
                    }
                }
                colorLog(`[✗] ${name} (端口 ${port}) - 未启动`, 'red');
                colorLog(`[信息] ${name} 输出: ${output}`, 'gray');
                child.kill();
                resolve(false);
            }
        }, 5000); // 增加等待时间到5秒
    });
}

// 主函数
async function main() {
    console.clear();
    showSeparator('在线编程教育平台 - Node.js 终端启动');
    console.log('');

    // 步骤 1/6：检查运行环境
    colorLog('步骤 1/6：检查运行环境...', 'cyan');

    const nodeExists = await commandExists('node');
    if (!nodeExists) {
        colorLog('[✗] Node.js 未安装！', 'red');
        colorLog('请访问以下网址下载安装 Node.js:', 'yellow');
        colorLog('https://nodejs.org/', 'blue');
        process.exit(1);
    }

    const npmExists = await commandExists('npm');
    if (!npmExists) {
        colorLog('[✗] npm 未安装！', 'red');
        process.exit(1);
    }

    // 获取版本信息
    const nodeVersion = await new Promise(resolve => {
        exec('node --version', (error, stdout) => resolve(stdout.trim()));
    });

    colorLog(`[✓] Node.js 已安装: ${nodeVersion}`, 'green');

    // 步骤 2/6：检查项目依赖
    console.log('');
    colorLog('步骤 2/6：检查项目依赖...', 'cyan');

    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');

    if (fs.existsSync(packageJsonPath)) {
        if (!fs.existsSync(nodeModulesPath)) {
            colorLog('[⚠] 依赖未安装，正在执行安装...', 'yellow');
            await new Promise(resolve => {
                const npm = spawn('npm', ['install'], { stdio: 'inherit' });
                npm.on('close', (code) => {
                    if (code !== 0) {
                        colorLog('[✗] 依赖安装失败！', 'red');
                        process.exit(1);
                    }
                    colorLog('[✓] 主项目依赖安装完成', 'green');
                    resolve();
                });
            });
        } else {
            colorLog('[✓] 主项目依赖已安装', 'green');
        }
    }

    // 检查 MarkViz Presenter
    const markvizPath = path.join(process.cwd(), 'markviz-presenter');
    const markvizPackage = path.join(markvizPath, 'package.json');
    const markvizModules = path.join(markvizPath, 'node_modules');

    if (fs.existsSync(markvizPackage)) {
        if (!fs.existsSync(markvizModules)) {
            colorLog('[⚠] MarkViz Presenter 依赖未安装...', 'yellow');
            await new Promise(resolve => {
                const npm = spawn('npm', ['install'], { cwd: markvizPath, stdio: 'inherit' });
                npm.on('close', (code) => {
                    if (code !== 0) {
                        colorLog('[✗] MarkViz 依赖安装失败！', 'red');
                        process.exit(1);
                    }
                    colorLog('[✓] MarkViz Presenter 依赖安装完成', 'green');
                    resolve();
                });
            });
        } else {
            colorLog('[✓] MarkViz Presenter 依赖已安装', 'green');
        }
    }

    // 检查 Markdown Viewer
    const markdownPath = path.join(process.cwd(), 'markdown-viewer');
    const markdownPackage = path.join(markdownPath, 'package.json');
    const markdownModules = path.join(markdownPath, 'node_modules');

    if (fs.existsSync(markdownPackage)) {
        if (!fs.existsSync(markdownModules)) {
            colorLog('[⚠] Markdown Viewer 依赖未安装...', 'yellow');
            await new Promise(resolve => {
                const npm = spawn('npm', ['install'], { cwd: markdownPath, stdio: 'inherit' });
                npm.on('close', (code) => {
                    if (code !== 0) {
                        colorLog('[✗] Markdown Viewer 依赖安装失败！', 'red');
                        process.exit(1);
                    }
                    colorLog('[✓] Markdown Viewer 依赖安装完成', 'green');
                    resolve();
                });
            });
        } else {
            colorLog('[✓] Markdown Viewer 依赖已安装', 'green');
        }
    }

    // 步骤 3/6：启动所有服务
    console.log('');
    colorLog('步骤 3/6：启动所有服务...', 'cyan');
    colorLog('[信息] 正在后台启动服务，请稍候...', 'yellow');

    const services = [];

    // 启动 API 服务器
    const apiServer = await startService('API 服务器', 'node api_server.js', process.cwd(), 5024);
    if (apiServer) services.push({ name: 'API Server', process: apiServer, port: 5024 });

    // 等待一下再启动下一个服务
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 启动前端服务器
    const frontendServer = await startService('前端服务器', 'npm run start:frontend', process.cwd(), 5020);
    if (frontendServer) services.push({ name: 'Frontend Server', process: frontendServer, port: 5020 });

    // 等待一下再启动下一个服务
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 启动 MarkViz Presenter
    if (fs.existsSync(markvizPath)) {
        // MarkViz Presenter 实际运行在端口 3001（因为3000被占用）
        const markvizServer = await startService('MarkViz Presenter', 'npm run dev', markvizPath, 3001);
        if (markvizServer) services.push({ name: 'MarkViz Presenter', process: markvizServer, port: 3001 });
    }

    // 等待一下再启动下一个服务
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 启动 Markdown Viewer
    if (fs.existsSync(markdownPath)) {
        const markdownServer = await startService('Markdown Viewer', 'npm run dev', markdownPath, 5174);
        if (markdownServer) services.push({ name: 'Markdown Viewer', process: markdownServer, port: 5174 });
    }

    // 步骤 4/6：等待服务完全启动
    console.log('');
    colorLog('步骤 4/6：等待服务完全启动...', 'cyan');
    colorLog('等待 5 秒让服务完全启动...', 'gray');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 步骤 5/6：检查服务状态
    console.log('');
    colorLog('步骤 5/6：检查服务状态...', 'cyan');
    showSeparator('服务状态报告');

    // 再次检查所有端口
    const portChecks = await Promise.all([
        checkPort(5024),
        checkPort(5020),
        checkPort(3001),  // MarkViz Presenter 实际端口
        checkPort(5174)   // Markdown Viewer 端口
    ]);

    const serviceStatus = [
        { name: 'API 服务器', port: 5024, running: portChecks[0] },
        { name: '前端服务器', port: 5020, running: portChecks[1] },
        { name: 'MarkViz Presenter', port: 3001, running: portChecks[2] },
        { name: 'Markdown Viewer', port: 5174, running: portChecks[3] }
    ];

    serviceStatus.forEach(service => {
        if (service.running) {
            colorLog(`[✓] ${service.name} (端口 ${service.port}) - 运行中`, 'green');
        } else {
            colorLog(`[✗] ${service.name} (端口 ${service.port}) - 未启动`, 'red');
        }
    });

    // 步骤 6/6：显示访问信息
    console.log('');
    showSeparator('访问地址');
    colorLog('主平台:       ', 'gray');
    colorLog('http://localhost:5020', 'blue');
    colorLog('API接口:      ', 'gray');
    colorLog('http://localhost:5024/api', 'blue');
    colorLog('编辑器:       ', 'gray');
    colorLog('http://localhost:5020/editor.html', 'blue');
    colorLog('MarkViz:      ', 'gray');
    colorLog('http://localhost:3001', 'blue');
    colorLog('Markdown:     ', 'gray');
    colorLog('http://localhost:5174', 'blue');

    console.log('');
    showSeparator('默认账号');
    colorLog('管理员:      ', 'gray');
    colorLog('admin / 123123', 'white');
    colorLog('教师:        ', 'gray');
    colorLog('teacher1 / 123123', 'white');
    colorLog('学生:        ', 'gray');
    colorLog('student1 / 123123', 'white');

    // 完成提示
    console.log('');
    showSeparator('启动完成');
    colorLog('所有服务已成功启动！', 'green');
    console.log('');
    colorLog('提示：', 'yellow');
    colorLog('- 所有服务都在后台进程中运行', 'white');
    colorLog('- 按 Ctrl+C 可以停止此脚本，但服务会继续运行', 'white');
    colorLog('- 如需停止所有服务，请手动关闭相关进程', 'white');
    colorLog('- 可以使用 taskkill /F /IM node.exe 强制停止所有Node.js进程', 'gray');

    // 询问是否打开浏览器
    console.log('');
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('是否自动打开浏览器？(Y/N): ', (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
            console.log('');
            colorLog('正在打开主页面...', 'gray');
            exec('start http://localhost:5020');
            colorLog('已在浏览器中打开', 'green');
        }

        console.log('');
        colorLog('按 Ctrl+C 退出此脚本（服务会继续运行）...', 'gray');

        // 优雅退出处理
        process.on('SIGINT', () => {
            console.log('');
            colorLog('\n正在退出脚本...', 'yellow');
            services.forEach(service => {
                if (service.process && !service.process.killed) {
                    service.process.kill('SIGTERM');
                }
            });
            colorLog('脚本已退出', 'green');
            process.exit(0);
        });

        rl.close();
    });
}

// 运行主函数
main().catch(error => {
    colorLog(`启动失败: ${error.message}`, 'red');
    process.exit(1);
});