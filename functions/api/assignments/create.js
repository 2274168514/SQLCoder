/**
 * Cloudflare Pages Function - 创建作业API
 * 路径: /api/assignments/create
 */

export async function onRequestPost(context) {
  const { request } = context;

  try {
    const {
      title,
      description,
      course_id,
      teacher_id,
      difficulty = 'beginner',
      due_date
    } = await request.json();

    if (!title || !description || !course_id || !teacher_id) {
      return new Response(JSON.stringify({ error: '请填写完整信息' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 创建新作业
    const newAssignment = {
      id: Date.now(),
      title: title,
      description: description,
      course_id: course_id,
      teacher_id: teacher_id,
      difficulty: difficulty,
      due_date: due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      submissions_count: 0,
      max_score: 100,
      status: 'active'
    };

    return new Response(JSON.stringify({
      success: true,
      message: '作业创建成功',
      assignment: newAssignment
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