/**
 * Cloudflare Pages Function - 课程API
 * 路径: /api/courses
 */

export async function onRequestGet(context) {
  try {
    const courses = [
      {
        id: 1,
        title: 'Web开发基础',
        description: 'HTML, CSS, JavaScript基础编程',
        teacher_id: 2,
        teacher_name: '张老师',
        created_at: new Date().toISOString(),
        students_count: 15,
        status: 'active'
      },
      {
        id: 2,
        title: '高级JavaScript',
        description: 'ES6+、异步编程、框架入门',
        teacher_id: 2,
        teacher_name: '张老师',
        created_at: new Date().toISOString(),
        students_count: 8,
        status: 'active'
      },
      {
        id: 3,
        title: '数据结构与算法',
        description: '基础数据结构和算法实现',
        teacher_id: 2,
        teacher_name: '张老师',
        created_at: new Date().toISOString(),
        students_count: 12,
        status: 'active'
      }
    ];

    return new Response(JSON.stringify({
      success: true,
      courses: courses
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: '服务器错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}