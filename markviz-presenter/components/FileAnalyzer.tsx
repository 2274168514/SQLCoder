import React, { useState } from 'react';
import './FileAnalyzer.css';

interface FileAnalysisResult {
  fileName: string;
  fileSize: number;
  mimeType: string;
  isZipFormat: boolean;
  zipSignature: boolean;
    fileHeader: string[];
  errors: string[];
  suggestions: string[];
}

export const FileAnalyzer: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<FileAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeFile = async (file: File) => {
    setIsAnalyzing(true);

    try {
      const buffer = await file.arrayBuffer();
      const view = new DataView(buffer);

      // 基本文件信息
      const fileName = file.name;
      const fileSize = file.size;
      const mimeType = file.type;

      // 检查ZIP文件头签名
      const zipSignature = view.getUint32(0, true) === 0x04034b50;

      // 检查文件头
      const headerBytes = [];
      for (let i = 0; i < Math.min(20, buffer.byteLength); i++) {
        headerBytes.push(view.getUint8(i).toString(16).padStart(2, '0'));
      }

      // 检查是否为ZIP格式
      const isZipFormat = zipSignature && buffer.byteLength > 22;

      // 错误和建议
      const errors: string[] = [];
      const suggestions: string[] = [];

      if (!isZipFormat) {
        errors.push('文件不是有效的ZIP格式');

        if (fileSize < 1000) {
          suggestions.push('文件太小，可能上传不完整');
        }

        if (!fileName.toLowerCase().includes('.ppt')) {
          suggestions.push('文件名应该包含.ppt或.pptx扩展名');
        }

        suggestions.push('请确保文件是完整的PowerPoint演示文稿');
        suggestions.push('尝试重新导出PPT文件为.pptx格式');
      }

      // 检查MIME类型
      if (mimeType && !mimeType.includes('powerpoint') && !mimeType.includes('zip') && !mimeType.includes('octet-stream')) {
        suggestions.push(`检测到MIME类型: ${mimeType}，这可能不是PPT文件`);
      }

      const result: FileAnalysisResult = {
        fileName,
        fileSize,
        mimeType,
        isZipFormat,
        zipSignature,
        fileHeader: headerBytes,
        errors,
        suggestions
      };

      setAnalysisResult(result);

    } catch (error) {
      console.error('文件分析失败:', error);
      setAnalysisResult({
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        isZipFormat: false,
        zipSignature: false,
        fileHeader: [],
        errors: ['文件读取失败'],
        suggestions: ['请检查文件是否损坏']
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      analyzeFile(file);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <div className="file-analyzer">
      <div className="analyzer-header">
        <h3>PPT文件格式分析工具</h3>
        <p>帮助诊断PPT文件上传问题</p>
      </div>

      <div className="upload-area">
        <input
          type="file"
          id="file-input"
          accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          onChange={handleFileChange}
          disabled={isAnalyzing}
        />
        <label htmlFor="file-input" className={`upload-button ${isAnalyzing ? 'analyzing' : ''}`}>
          {isAnalyzing ? '分析中...' : '选择PPT文件进行分析'}
        </label>
      </div>

      {analysisResult && (
        <div className="analysis-result">
          <h4>分析结果</h4>

          <div className="result-section">
            <h5>基本信息</h5>
            <div className="info-grid">
              <div className="info-item">
                <label>文件名:</label>
                <span>{analysisResult.fileName}</span>
              </div>
              <div className="info-item">
                <label>文件大小:</label>
                <span>{formatFileSize(analysisResult.fileSize)}</span>
              </div>
              <div className="info-item">
                <label>MIME类型:</label>
                <span>{analysisResult.mimeType || '未知'}</span>
              </div>
              <div className="info-item">
                <label>ZIP格式:</label>
                <span className={analysisResult.isZipFormat ? 'success' : 'error'}>
                  {analysisResult.isZipFormat ? '✓ 是' : '✗ 否'}
                </span>
              </div>
              <div className="info-item">
                <label>ZIP签名:</label>
                <span className={analysisResult.zipSignature ? 'success' : 'error'}>
                  {analysisResult.zipSignature ? '✓ 有效' : '✗ 无效'}
                </span>
              </div>
            </div>
          </div>

          {analysisResult.fileHeader.length > 0 && (
            <div className="result-section">
              <h5>文件头 (十六进制)</h5>
              <div className="file-header">
                {analysisResult.fileHeader.map((byte, index) => (
                  <span key={index} className="hex-byte">{byte}</span>
                ))}
              </div>
            </div>
          )}

          {analysisResult.errors.length > 0 && (
            <div className="result-section">
              <h5 className="error">检测到的问题</h5>
              <ul className="error-list">
                {analysisResult.errors.map((error, index) => (
                  <li key={index} className="error-item">{error}</li>
                ))}
              </ul>
            </div>
          )}

          {analysisResult.suggestions.length > 0 && (
            <div className="result-section">
              <h5>建议</h5>
              <ul className="suggestion-list">
                {analysisResult.suggestions.map((suggestion, index) => (
                  <li key={index} className="suggestion-item">{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="help-section">
        <h5>如何解决PPT文件格式问题？</h5>
        <ul>
          <li>确保使用Microsoft PowerPoint 2007或更高版本</li>
          <li>另存为.pptx格式而不是.ppt格式</li>
          <li>检查文件是否完整下载或传输</li>
          <li>尝试重新创建或导出文件</li>
          <li>如果文件过大，考虑压缩内容</li>
          <li>确保文件没有密码保护</li>
        </ul>
      </div>
    </div>
  );
};