-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS programming_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE programming_platform;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'teacher', 'student') NOT NULL,
    student_id VARCHAR(20) NULL,  -- 学生学号（仅学生有）
    employee_id VARCHAR(20) NULL,  -- 教师工号（仅教师有）
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- 课程表
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(100) NOT NULL,
    description TEXT,
    teacher_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_teacher (teacher_id),
    INDEX idx_course_code (course_code)
);

-- 课程报名表
CREATE TABLE IF NOT EXISTS course_enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    student_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_enrollment (course_id, student_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_course (course_id),
    INDEX idx_student (student_id)
);

-- 作业表
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    course_id INT NOT NULL,
    teacher_id INT NOT NULL,
    due_date TIMESTAMP NULL,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_course (course_id),
    INDEX idx_teacher (teacher_id),
    INDEX idx_due_date (due_date)
);

-- 作业提交表
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    content JSON,  -- 存储代码内容（HTML, CSS, JS）
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    grade DECIMAL(5,2) NULL,
    feedback TEXT NULL,
    graded_at TIMESTAMP NULL,
    graded_by INT NULL,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_submission (assignment_id, student_id),
    INDEX idx_assignment (assignment_id),
    INDEX idx_student (student_id)
);

-- 代码库表（教师分享的代码）
CREATE TABLE IF NOT EXISTS code_repository (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    code_content JSON,  -- 存储代码内容
    language ENUM('html', 'css', 'javascript', 'mixed') NOT NULL,
    category VARCHAR(50) NOT NULL,
    teacher_id INT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_teacher (teacher_id),
    INDEX idx_language (language),
    INDEX idx_category (category),
    INDEX idx_public (is_public)
);

-- 代码示例表（课程案例）
CREATE TABLE IF NOT EXISTS code_examples (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    code_content JSON,  -- 存储代码内容
    course_id INT NOT NULL,
    teacher_id INT NOT NULL,
    order_index INT DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_course (course_id),
    INDEX idx_teacher (teacher_id),
    INDEX idx_order (order_index)
);

-- 插入默认管理员用户（如果不存在）
INSERT IGNORE INTO users (username, email, password_hash, full_name, role)
VALUES ('admin', 'admin@example.com', '$2b$10$a7au.TqPcdGSqlML9/75.OE9In8cv8MeMo64nIC/jAyBHdICeV2l.', '系统管理员', 'admin');

-- 插入默认教师用户（如果不存在）
INSERT IGNORE INTO users (username, email, password_hash, full_name, role, employee_id)
VALUES ('teacher1', 'teacher1@example.com', '$2b$10$a7au.TqPcdGSqlML9/75.OE9In8cv8MeMo64nIC/jAyBHdICeV2l.', '李老师', 'teacher', 'T001');

-- 插入默认学生用户（如果不存在）
INSERT IGNORE INTO users (username, email, password_hash, full_name, role, student_id)
VALUES ('student1', 'student1@example.com', '$2b$10$a7au.TqPcdGSqlML9/75.OE9In8cv8MeMo64nIC/jAyBHdICeV2l.', '张三', 'student', 'S001');

-- 注意：默认密码都是 123123
-- bcrypt哈希值对应密码 "123123"