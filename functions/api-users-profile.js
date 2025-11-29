/**
 * Cloudflare Pages Function - 用户资料API
 * 路径: /api/users/profile
 */

export async function onRequestGet(context) {
  try {
    // 模拟从session或token获取用户信息
    // 这里返回示例用户资料
    return new Response(JSON.stringify({
      success: true,
      user: {
        id: 1,
        username: 'student1',
        email: 'student@example.com',
        role: 'student',
        full_name: '学生一',
        avatar: null,
        created_at: '2024-01-01T00:00:00Z',
        last_login: new Date().toISOString(),
        courses_count: 3,
        assignments_completed: 12,
        assignments_total: 15
      }
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

export async function onRequestPut(context) {
  const { request } = context;

  try {
    const { full_name, email, avatar } = await request.json();

    return new Response(JSON.stringify({
      success: true,
      message: '资料更新成功',
      user: {
        id: 1,
        username: 'student1',
        email: email || 'student@example.com',
        full_name: full_name || '学生一',
        avatar: avatar,
        updated_at: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
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
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}