/**
 * Vercel API 入口文件
 * 包装原始的Express应用以在Vercel环境中运行
 */

const app = require('../api_server.js');

// 移除服务器启动部分，只保留Express应用实例
module.exports = app;