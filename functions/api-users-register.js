/**
 * Cloudflare Pages Function - 用户注册API
 * 路径: /api/users/register
 */

export async function onRequestPost(context) {
  const { request } = context;

  try {
    const { username, email, password, role = 'student' } = await request.json();

    if (!username || !email || !password) {
      return new Response(JSON.stringify({ error: '请填写完整信息' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 模拟数据库操作（实际项目中应该使用真实数据库）
    // 这里只是演示，返回成功响应
    return new Response(JSON.stringify({
      success: true,
      message: '注册成功',
      user: {
        id: Date.now(),
        username: username,
        email: email,
        role: role,
        created_at: new Date().toISOString()
      }
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