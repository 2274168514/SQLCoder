/**
 * Cloudflare Pages Function - 作业提交API
 * 路径: /api/assignments/submit
 */

export async function onRequestPost(context) {
  const { request } = context;

  try {
    const {
      assignment_id,
      student_id,
      content,
      files = []
    } = await request.json();

    if (!assignment_id || !student_id || !content) {
      return new Response(JSON.stringify({ error: '请填写完整信息' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 创建作业提交
    const submission = {
      id: Date.now(),
      assignment_id: assignment_id,
      student_id: student_id,
      content: content,
      files: files,
      submitted_at: new Date().toISOString(),
      status: 'submitted',
      score: null,
      feedback: null,
      reviewed_at: null
    };

    return new Response(JSON.stringify({
      success: true,
      message: '作业提交成功',
      submission: submission
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