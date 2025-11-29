/**
 * Cloudflare Pages Function - 文档上传API
 * 路径: /api/documents/upload
 */

export async function onRequestPost(context) {
  const { request } = context;

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type') || 'document';
    const description = formData.get('description') || '';

    if (!file) {
      return new Response(JSON.stringify({ error: '请选择文件' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 检查文件大小 (Cloudflare Pages 限制为 25MB)
    if (file.size > 25 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: '文件大小不能超过 25MB' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 保存文件信息
    const document = {
      id: Date.now(),
      filename: file.name,
      size: file.size,
      type: file.type,
      category: type,
      description: description,
      uploaded_at: new Date().toISOString(),
      download_url: `/api/documents/${Date.now()}/download`
    };

    return new Response(JSON.stringify({
      success: true,
      message: '文件上传成功',
      document: document
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