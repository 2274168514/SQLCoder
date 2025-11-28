/**
 * Vercel API 服务器
 * 为Vercel优化的Express应用
 */

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();

// Vercel 环境配置
const PORT = process.env.PORT || 5024;

// 简化的数据库配置 - 使用环境变量或内存模式
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123123',
    database: process.env.DB_NAME || 'programming_platform',
    charset: 'utf8mb4',
    connectTimeout: 10000,
    acquireTimeout: 10000,
    timeout: 10000
};

// 内存存储模式数据
const memoryStore = {
    users: [
        { id: 1, username: 'admin', password: '$2b$10$r6QeHK.2L2QaXKGFJSY8O.PkUEjyWrjPJNuM/q/JQdQQKqLjLdJAW', email: 'admin@example.com', role: 'admin', created_at: new Date() },
        { id: 2, username: 'teacher1', password: '$2b$10$r6QeHK.2L2QaXKGFJSY8O.PkUEjyWrjPJNuM/q/JQdQQKqLjLdJAW', email: 'teacher1@example.com', role: 'teacher', created_at: new Date() },
        { id: 3, username: 'student1', password: '$2b$10$r6QeHK.2L2QaXKGFJSY8O.PkUEjyWrjPJNuM/q/JQdQQKqLjLdJAW', email: 'student1@example.com', role: 'student', created_at: new Date() }
    ],
    courses: [],
    assignments: []
};

let pool = null;

// 数据库连接
async function initializeDatabase() {
    try {
        if (process.env.NODE_ENV === 'production') {
            // 在Vercel生产环境中使用内存模式
            console.log('🔄 Vercel环境：使用内存存储模式');
            pool = null;
        } else {
            // 开发环境尝试连接MySQL
            pool = mysql.createPool(dbConfig);
            const connection = await pool.getConnection();
            await connection.ping();
            connection.release();
            console.log('✅ MySQL数据库连接成功');
        }
    } catch (error) {
        console.warn('⚠️ MySQL连接失败，使用内存模式:', error.message);
        pool = null;
    }
}

// 中间件配置
app.use(cors({
    origin: ['https://localhost:5020', 'https://localhost:3000', process.env.FRONTEND_URL],
    credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/css', express.static(path.join(__dirname, '../css')));
app.use('/js', express.static(path.join(__dirname, '../js')));
app.use('/lib', express.static(path.join(__dirname, '../lib')));
app.use('/image', express.static(path.join(__dirname, '../image')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 文件上传配置
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = path.join(__dirname, '../uploads/mdresource');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 15);
            const ext = path.extname(file.originalname);
            cb(null, `${timestamp}_${random}${ext}`);
        }
    }),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// 简化的查询函数
function query(sql, params) {
    if (pool) {
        return pool.execute(sql, params);
    } else {
        // 内存模式实现
        return Promise.resolve([[], []]);
    }
}

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API服务器运行正常',
        environment: process.env.NODE_ENV || 'development',
        database: pool ? 'MySQL' : 'Memory',
        timestamp: new Date().toISOString()
    });
});

// 用户认证API
app.post('/api/users/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '用户名和密码不能为空'
            });
        }

        if (pool) {
            // 数据库模式
            const [users] = await query(
                'SELECT * FROM users WHERE username = ? OR email = ?',
                [username, username]
            );

            if (users.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: '用户不存在'
                });
            }

            const user = users[0];
            const validPassword = await bcrypt.compare(password, user.password);

            if (!validPassword) {
                return res.status(401).json({
                    success: false,
                    message: '密码错误'
                });
            }

            res.json({
                success: true,
                message: '登录成功',
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    },
                    token: 'demo-token-' + Date.now()
                }
            });
        } else {
            // 内存模式
            const user = memoryStore.users.find(u =>
                u.username === username || u.email === username
            );

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: '用户不存在'
                });
            }

            const validPassword = await bcrypt.compare(password, user.password);

            if (!validPassword) {
                return res.status(401).json({
                    success: false,
                    message: '密码错误'
                });
            }

            res.json({
                success: true,
                message: '登录成功',
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    },
                    token: 'demo-token-' + Date.now()
                }
            });
        }
    } catch (error) {
        console.error('登录API错误:', error);
        res.status(500).json({
            success: false,
            message: '登录失败: ' + error.message
        });
    }
});

// 用户注册API
app.post('/api/users/register', async (req, res) => {
    try {
        const { username, email, password, role = 'student' } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: '用户名、邮箱和密码不能为空'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        if (pool) {
            // 数据库模式
            const [existingUsers] = await query(
                'SELECT id FROM users WHERE username = ? OR email = ?',
                [username, email]
            );

            if (existingUsers.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: '用户名或邮箱已存在'
                });
            }

            const [result] = await query(
                'INSERT INTO users (username, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
                [username, email, hashedPassword, role]
            );

            res.json({
                success: true,
                message: '注册成功',
                data: {
                    user: {
                        id: result.insertId,
                        username,
                        email,
                        role
                    }
                }
            });
        } else {
            // 内存模式
            const existingUser = memoryStore.users.find(u =>
                u.username === username || u.email === email
            );

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: '用户名或邮箱已存在'
                });
            }

            const newUser = {
                id: memoryStore.users.length + 1,
                username,
                email,
                password: hashedPassword,
                role,
                created_at: new Date()
            };

            memoryStore.users.push(newUser);

            res.json({
                success: true,
                message: '注册成功',
                data: {
                    user: {
                        id: newUser.id,
                        username,
                        email,
                        role
                    }
                }
            });
        }
    } catch (error) {
        console.error('注册API错误:', error);
        res.status(500).json({
            success: false,
            message: '注册失败: ' + error.message
        });
    }
});

// 文件上传API
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '没有上传文件'
            });
        }

        res.json({
            success: true,
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: `/uploads/mdresource/${req.file.filename}`,
            size: req.file.size,
            mimetype: req.file.mimetype
        });
    } catch (error) {
        console.error('文件上传失败:', error);
        res.status(500).json({
            success: false,
            message: '文件上传失败: ' + error.message
        });
    }
});

// 测试API
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'API测试成功',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// 404处理
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API端点不存在'
    });
});

// 错误处理中间件
app.use((error, req, res, next) => {
    console.error('API错误:', error);
    res.status(500).json({
        success: false,
        message: '服务器内部错误'
    });
});

// 初始化数据库
initializeDatabase().catch(console.error);

// 导出应用实例供Vercel使用
module.exports = app;