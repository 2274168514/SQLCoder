/**
 * Cloudflare Pages Function - 用户登录API
 * 路径: /api/users/login
 */

export async function onRequestPost(context) {
  const { request } = context;

  try {
    const { username, password } = await request.json();

    // 简化的用户验证（演示用）
    const users = [
      { id: 1, username: 'admin', role: 'admin', email: 'admin@example.com' },
      { id: 2, username: 'teacher1', role: 'teacher', email: 'teacher@example.com' },
      { id: 3, username: 'student1', role: 'student', email: 'student@example.com' }
    ];

    const user = users.find(u => u.username === username);
    if (!user) {
      return new Response(JSON.stringify({ error: '用户不存在' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 简化密码验证（所有测试账户密码都是123123）
    if (password !== '123123') {
      return new Response(JSON.stringify({ error: '密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email
      }
    }), {
      status: 200,
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