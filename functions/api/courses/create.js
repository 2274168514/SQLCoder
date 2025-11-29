/**
 * Cloudflare Pages Function - 创建课程API
 * 路径: /api/courses/create
 */

export async function onRequestPost(context) {
  const { request } = context;

  try {
    const { title, description, teacher_id, difficulty = 'beginner' } = await request.json();

    if (!title || !description || !teacher_id) {
      return new Response(JSON.stringify({ error: '请填写完整信息' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 创建新课程
    const newCourse = {
      id: Date.now(),
      title: title,
      description: description,
      teacher_id: teacher_id,
      difficulty: difficulty,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      students_count: 0,
      assignments_count: 0,
      status: 'active'
    };

    return new Response(JSON.stringify({
      success: true,
      message: '课程创建成功',
      course: newCourse
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: '服务器错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}