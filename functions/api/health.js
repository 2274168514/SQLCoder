/**
 * Cloudflare Pages Function - 健康检查API
 * 路径: /api/health
 */

export async function onRequestGet(context) {
  try {
    return new Response(JSON.stringify({
      status: 'ok',
      message: 'Cloudflare Pages API 运行正常',
      timestamp: new Date().toISOString(),
      environment: 'production',
      functions: ['users/login', 'courses', 'assignments', 'health']
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      error: '服务器错误',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}