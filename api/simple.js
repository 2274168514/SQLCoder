/**
 * Vercel API 服务器 - 简化版本用于云端部署
 * 包含基本的API端点和内存数据存储
 */

const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();

// 中间件
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 内存数据存储（用于演示）
const memoryStorage = {
  users: [
    { id: 1, username: 'admin', password: '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', role: 'admin', email: 'admin@example.com' },
    { id: 2, username: 'teacher1', password: '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', role: 'teacher', email: 'teacher@example.com' },
    { id: 3, username: 'student1', password: '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', role: 'student', email: 'student@example.com' }
  ],
  courses: [
    { id: 1, title: 'Web开发基础', description: 'HTML, CSS, JavaScript基础', teacher_id: 2, created_at: new Date().toISOString() }
  ],
  assignments: [
    { id: 1, title: '第一个网页', description: '创建你的第一个HTML页面', course_id: 1, teacher_id: 2, created_at: new Date().toISOString() }
  ]
};

// API 端点

// 用户登录
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = memoryStorage.users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }

    // 简化密码验证（演示用）
    const isValid = password === '123123'; // 所有测试账户密码都是123123

    if (!isValid) {
      return res.status(401).json({ error: '密码错误' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取用户信息
app.get('/api/users/profile', (req, res) => {
  res.json({ message: '用户信息接口正常' });
});

// 获取课程列表
app.get('/api/courses', (req, res) => {
  res.json({
    success: true,
    courses: memoryStorage.courses
  });
});

// 获取作业列表
app.get('/api/assignments', (req, res) => {
  res.json({
    success: true,
    assignments: memoryStorage.assignments
  });
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Vercel API 运行正常',
    timestamp: new Date().toISOString()
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    error: 'API端点不存在',
    path: req.path,
    method: req.method
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 导出应用供Vercel使用
module.exports = app;