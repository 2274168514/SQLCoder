import { createClient } from '@supabase/supabase-js';

// Supabase 配置 - 请替换为你自己的值
// 可以在 Supabase Dashboard -> Settings -> API 中找到
const SUPABASE_URL = localStorage.getItem('SUPABASE_URL') || 'https://gjoymdzbiiijeregqemj.supabase.co';
const SUPABASE_ANON_KEY = localStorage.getItem('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdqb3ltZHpiaWlpamVyZWdxZW1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMDA0NjYsImV4cCI6MjA3OTg3NjQ2Nn0.0HeF8MF0B7hlNaePJ7BFGm0BtDvwn3YnBSzQAEMokQM';

// Storage bucket 名称
const BUCKET_NAME = 'code';

// 创建 Supabase 客户端
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 进度回调类型
export type ProgressCallback = (progress: number) => void;

/**
 * 使用 XMLHttpRequest 上传文件（支持进度回调）
 */
async function uploadWithProgress(
  file: Blob,
  uniqueFilename: string,
  onProgress?: ProgressCallback
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${uniqueFilename}`;
    
    xhr.open('POST', url);
    xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_ANON_KEY}`);
    xhr.setRequestHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    xhr.setRequestHeader('x-upsert', 'false');
    
    // 监听上传进度
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    };
    
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.message || `上传失败: HTTP ${xhr.status}`));
        } catch {
          reject(new Error(`上传失败: HTTP ${xhr.status}`));
        }
      }
    };
    
    xhr.onerror = () => {
      reject(new Error('网络错误'));
    };
    
    xhr.send(file);
  });
}

/**
 * 上传 PPT 文件到 Supabase Storage
 * @param file 文件对象
 * @param filename 文件名
 * @param onProgress 进度回调函数 (0-100)
 * @returns 公网访问 URL
 */
export async function uploadPPTToSupabase(
  file: File | Blob,
  filename: string,
  onProgress?: ProgressCallback
): Promise<string> {
  // 生成唯一文件名（只保留安全字符，移除中文等特殊字符）
  const timestamp = Date.now();
  const ext = filename.split('.').pop() || 'pptx';
  // 只保留字母、数字、下划线、连字符
  const safeName = filename
    .replace(/\.[^/.]+$/, '') // 移除扩展名
    .replace(/[^a-zA-Z0-9_-]/g, '') // 移除非安全字符
    || 'presentation'; // 如果全是中文则使用默认名
  const uniqueFilename = `${timestamp}_${safeName}.${ext}`;
  
  // 使用带进度的上传
  await uploadWithProgress(file, uniqueFilename, onProgress);

  // 获取公网 URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(uniqueFilename);

  return urlData.publicUrl;
}

/**
 * 从本地 API 服务器获取文件并上传到 Supabase
 * @param localPath 本地文件路径（如 /uploads/documents/xxx.pptx）
 * @param onProgress 进度回调函数 (0-100)
 * @returns 公网访问 URL
 */
export async function uploadLocalFileToSupabase(
  localPath: string,
  onProgress?: ProgressCallback
): Promise<string> {
  const API_BASE = 'http://localhost:5024';
  const fullUrl = localPath.startsWith('http') ? localPath : `${API_BASE}${localPath}`;
  
  // 从本地服务器获取文件
  const response = await fetch(fullUrl);
  if (!response.ok) {
    throw new Error('无法获取本地文件');
  }
  
  const blob = await response.blob();
  const filename = localPath.split('/').pop() || 'presentation.pptx';
  
  // 上传到 Supabase（带进度）
  return uploadPPTToSupabase(blob, filename, onProgress);
}

/**
 * 配置 Supabase 凭据（保存到 localStorage）
 */
export function configureSupabase(url: string, anonKey: string): void {
  localStorage.setItem('SUPABASE_URL', url);
  localStorage.setItem('SUPABASE_ANON_KEY', anonKey);
  // 刷新页面以应用新配置
  window.location.reload();
}

/**
 * 检查 Supabase 是否已配置
 */
export function isSupabaseConfigured(): boolean {
  const url = localStorage.getItem('SUPABASE_URL');
  const key = localStorage.getItem('SUPABASE_ANON_KEY');
  return !!(url && key && !url.includes('your-project') && !key.includes('your-anon-key'));
}
