/**
 * Cloudflare Pages Function - 作业API
 * 路径: /api/assignments
 */

export async function onRequestGet(context) {
  try {
    const assignments = [
      {
        id: 1,
        title: '创建个人主页',
        description: '使用HTML和CSS创建一个个人介绍页面',
        course_id: 1,
        course_name: 'Web开发基础',
        teacher_id: 2,
        teacher_name: '张老师',
        created_at: new Date().toISOString(),
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        difficulty: 'beginner',
        submissions_count: 12,
        status: 'active'
      },
      {
        id: 2,
        title: 'JavaScript计算器',
        description: '实现一个支持基本运算的计算器',
        course_id: 2,
        course_name: '高级JavaScript',
        teacher_id: 2,
        teacher_name: '张老师',
        created_at: new Date().toISOString(),
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        difficulty: 'intermediate',
        submissions_count: 5,
        status: 'active'
      },
      {
        id: 3,
        title: '待办事项应用',
        description: '创建一个功能完整的待办事项管理应用',
        course_id: 2,
        course_name: '高级JavaScript',
        teacher_id: 2,
        teacher_name: '张老师',
        created_at: new Date().toISOString(),
        due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        difficulty: 'intermediate',
        submissions_count: 3,
        status: 'active'
      }
    ];

    return new Response(JSON.stringify({
      success: true,
      assignments: assignments
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