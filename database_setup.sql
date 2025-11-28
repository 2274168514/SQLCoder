-- 编程教学平台数据库表结构
-- 已存在的用户表：users

-- 课程表
CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL COMMENT '课程标题',
    description TEXT COMMENT '课程描述',
    teacher_id INT NOT NULL COMMENT '教师ID，外键关联users表',
    category VARCHAR(100) DEFAULT '编程基础' COMMENT '课程分类',
    difficulty ENUM('初级', '中级', '高级') DEFAULT '初级' COMMENT '课程难度',
    tags JSON COMMENT '课程标签，JSON数组格式',
    cover_image VARCHAR(500) COMMENT '封面图片URL',
    status ENUM('草稿', '已发布', '已结束') DEFAULT '草稿' COMMENT '课程状态',
    max_students INT DEFAULT 50 COMMENT '最大学生数量',
    current_students INT DEFAULT 0 COMMENT '当前学生数量',
    start_date DATE COMMENT '开课日期',
    end_date DATE COMMENT '结课日期',
    is_public BOOLEAN DEFAULT TRUE COMMENT '是否公开课程',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_teacher (teacher_id),
    INDEX idx_status (status),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程表';

-- 课程选课表（学生选课记录）
CREATE TABLE IF NOT EXISTS course_enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL COMMENT '课程ID',
    student_id INT NOT NULL COMMENT '学生ID',
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '选课时间',
    status ENUM('已选课', '已完成', '已退课') DEFAULT '已选课' COMMENT '选课状态',
    progress DECIMAL(5,2) DEFAULT 0.00 COMMENT '课程进度百分比',
    completion_date TIMESTAMP NULL COMMENT '完成时间',
    UNIQUE KEY unique_enrollment (course_id, student_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_course (course_id),
    INDEX idx_student (student_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程选课表';

-- 作业表
CREATE TABLE IF NOT EXISTS assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL COMMENT '所属课程ID',
    title VARCHAR(200) NOT NULL COMMENT '作业标题',
    description TEXT COMMENT '作业描述',
    instructions TEXT COMMENT '作业说明和要求',
    teacher_id INT NOT NULL COMMENT '创建作业的教师ID',
    assignment_type ENUM('编程练习', '项目作业', '测验', '考试') DEFAULT '编程练习' COMMENT '作业类型',
    difficulty ENUM('简单', '中等', '困难') DEFAULT '中等' COMMENT '作业难度',
    template_files JSON COMMENT '模板文件，JSON格式存储文件结构',
    example_solution JSON COMMENT '示例解决方案，JSON格式存储代码',
    test_cases JSON COMMENT '测试用例，JSON格式存储输入输出',
    max_attempts INT DEFAULT 0 COMMENT '最大提交次数，0表示无限制',
    time_limit INT DEFAULT 120 COMMENT '时间限制（分钟）',
    start_time TIMESTAMP NULL COMMENT '开始时间',
    end_time TIMESTAMP NULL COMMENT '截止时间',
    max_score DECIMAL(5,2) DEFAULT 100.00 COMMENT '满分',
    allow_late_submission BOOLEAN DEFAULT FALSE COMMENT '是否允许迟交',
    auto_grade BOOLEAN DEFAULT TRUE COMMENT '是否自动评分',
    is_published BOOLEAN DEFAULT FALSE COMMENT '是否已发布',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_course (course_id),
    INDEX idx_teacher (teacher_id),
    INDEX idx_type (assignment_type),
    INDEX idx_published (is_published),
    INDEX idx_start_end (start_time, end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='作业表';

-- 作业提交表
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT NOT NULL COMMENT '作业ID',
    student_id INT NOT NULL COMMENT '学生ID',
    submission_files JSON COMMENT '提交的文件，JSON格式存储文件结构',
    score DECIMAL(5,2) DEFAULT 0.00 COMMENT '得分',
    max_score DECIMAL(5,2) DEFAULT 100.00 COMMENT '满分',
    submission_status ENUM('已提交', '已评分', '需要重做') DEFAULT '已提交' COMMENT '提交状态',
    feedback TEXT COMMENT '教师反馈',
    teacher_comments TEXT COMMENT '教师评语',
    auto_test_results JSON COMMENT '自动测试结果',
    plagiarism_check JSON COMMENT '抄袭检查结果',
    submission_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
    graded_time TIMESTAMP NULL COMMENT '评分时间',
    graded_by INT NULL COMMENT '评分教师ID',
    attempt_count INT DEFAULT 1 COMMENT '提交次数',
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_submission (assignment_id, student_id),
    INDEX idx_assignment (assignment_id),
    INDEX idx_student (student_id),
    INDEX idx_status (submission_status),
    INDEX idx_score (score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='作业提交表';

-- 插入一些示例课程数据
INSERT INTO courses (title, description, teacher_id, category, difficulty, tags, status, max_students, start_date, end_date) VALUES
('Web前端开发基础', '学习HTML、CSS和JavaScript基础知识，掌握现代Web开发技术', 6, '前端开发', '初级', '["HTML", "CSS", "JavaScript", "Web"]', '已发布', 30, '2025-11-01', '2025-12-31'),
('Python编程入门', '从零开始学习Python编程，包括基础语法、数据结构和面向对象编程', 6, '后端开发', '初级', '["Python", "编程基础", "算法"]', '已发布', 40, '2025-11-15', '2026-01-15'),
('数据结构与算法', '深入理解常用数据结构和算法，提升编程能力和问题解决技巧', 6, '计算机科学', '中级', '["数据结构", "算法", "编程思维"]', '草稿', 25, '2025-12-01', '2026-02-28');

-- 为示例课程添加选课记录
INSERT INTO course_enrollments (course_id, student_id, status, progress) VALUES
(1, 7, '已完成', 100.00),
(2, 7, '已选课', 45.50);