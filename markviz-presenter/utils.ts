import { MediaType } from './types';

export const detectMediaType = (url: string): MediaType => {
  // 首先检查是否是完整的URL（包含http/https）
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const domain = new URL(url).hostname.toLowerCase();

    // 检查文件扩展名
    const extension = url.split('.').pop()?.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return 'image';
    }
    if (['mp4', 'webm', 'ogg', 'mov'].includes(extension || '')) {
      return 'video';
    }
    if (['pdf'].includes(extension || '')) {
      return 'pdf';
    }
    if (['ppt', 'pptx'].includes(extension || '')) {
      return 'ppt';
    }

    // 如果是外部域名（如百度等），返回external
    if (!domain.includes('localhost') && !domain.includes('127.0.0.1')) {
      return 'external';
    }
  }

  // 检查本地文件扩展名
  const extension = url.split('.').pop()?.toLowerCase();

  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
    return 'image';
  }
  if (['mp4', 'webm', 'ogg', 'mov'].includes(extension || '')) {
    return 'video';
  }
  if (['pdf'].includes(extension || '')) {
    return 'pdf';
  }
  if (['ppt', 'pptx'].includes(extension || '')) {
    return 'ppt';
  }

  return 'external'; // Default or generic web link
};
