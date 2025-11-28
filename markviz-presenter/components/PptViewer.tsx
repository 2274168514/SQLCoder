import React, { useEffect, useRef, useState } from 'react';
import { MonitorPlay, ChevronLeft, ChevronRight, Download, Maximize2, Minimize2 } from 'lucide-react';

// API 端口配置
const API_PORT = 5024;
const API_BASE = `http://localhost:${API_PORT}`;

interface PptViewerProps {
  src: string;
  name: string;
}

interface TextItem {
  text: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  align: 'left' | 'center' | 'right';
}

interface ImageItem {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ShapeItem {
  type: 'rect' | 'ellipse' | 'roundRect' | 'triangle';
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  texts?: TextItem[];
}

interface SlideContent {
  texts: TextItem[];
  images: ImageItem[];
  shapes: ShapeItem[];
  background?: string;
  backgroundImage?: string;
  slideNumber?: string;
  title?: string;
  layout?: 'title' | 'content' | 'section';
}

// 标准 PPT 尺寸 (EMU)
const SLIDE_WIDTH_EMU = 9144000;  // 标准 16:9 宽度
const SLIDE_HEIGHT_EMU = 5143500; // 标准 16:9 高度

// 显示尺寸 (像素)
const DISPLAY_WIDTH = 960;
const DISPLAY_HEIGHT = 540;

export const PptViewer: React.FC<PptViewerProps> = ({ src, name }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slides, setSlides] = useState<SlideContent[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canvasImages, setCanvasImages] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Canvas渲染函数
  const renderSlideToCanvas = async (slide: SlideContent, slideIndex: number): Promise<string> => {
    const canvas = document.createElement('canvas');
    canvas.width = DISPLAY_WIDTH;
    canvas.height = DISPLAY_HEIGHT;
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    // 清空画布
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);

    // 绘制背景
    if (slide.background) {
      ctx.fillStyle = slide.background;
      ctx.fillRect(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
    }

    // 绘制背景图片
    if (slide.backgroundImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
      };
      img.src = slide.backgroundImage;
    }

    // 绘制形状
    slide.shapes.forEach(shape => {
      ctx.save();

      // 设置填充
      if (shape.fill) {
        ctx.fillStyle = shape.fill;
      }

      // 设置边框
      if (shape.stroke) {
        ctx.strokeStyle = shape.stroke;
        ctx.lineWidth = shape.strokeWidth || 1;
      }

      // 根据形状类型绘制
      switch (shape.type) {
        case 'rect':
          ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
          if (shape.stroke) ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
          break;
        case 'roundRect':
          const radius = 8;
          ctx.beginPath();
          ctx.moveTo(shape.x + radius, shape.y);
          ctx.lineTo(shape.x + shape.width - radius, shape.y);
          ctx.quadraticCurveTo(shape.x + shape.width, shape.y, shape.x + shape.width, shape.y + radius);
          ctx.lineTo(shape.x + shape.width, shape.y + shape.height - radius);
          ctx.quadraticCurveTo(shape.x + shape.width, shape.y + shape.height, shape.x + shape.width - radius, shape.y + shape.height);
          ctx.lineTo(shape.x + radius, shape.y + shape.height);
          ctx.quadraticCurveTo(shape.x, shape.y + shape.height, shape.x, shape.y + shape.height);
          ctx.closePath();
          ctx.fill();
          if (shape.stroke) ctx.stroke();
          break;
        case 'ellipse':
          ctx.beginPath();
          ctx.ellipse(
            shape.x + shape.width / 2,
            shape.y + shape.height / 2,
            shape.width / 2,
            shape.height / 2,
            0,
            0,
            2 * Math.PI
          );
          ctx.fill();
          if (shape.stroke) ctx.stroke();
          break;
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(shape.x + shape.width / 2, shape.y);
          ctx.lineTo(shape.x, shape.y + shape.height);
          ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
          ctx.closePath();
          ctx.fill();
          if (shape.stroke) ctx.stroke();
          break;
      }

      ctx.restore();

      // 在形状内绘制文字
      if (shape.texts) {
        shape.texts.forEach(textItem => {
          ctx.save();
          ctx.font = `${textItem.bold ? 'bold' : 'normal'} ${textItem.italic ? 'italic' : 'normal'} ${Math.max(10, textItem.fontSize * 0.9)}px sans-serif`;
          ctx.fillStyle = textItem.color;
          ctx.textAlign = textItem.align;
          ctx.textBaseline = 'top';

          // 文字换行处理
          const words = textItem.text.split('\n');
          let y = textItem.y;
          words.forEach(line => {
            ctx.fillText(line, textItem.x, y);
            y += textItem.fontSize * 1.2;
          });
          ctx.restore();
        });
      }
    });

    // 绘制图片
    for (const img of slide.images) {
      const image = new Image();
      image.onload = () => {
        ctx.drawImage(image, img.x, img.y, img.width, img.height);
      };
      image.src = img.src;
    }

    // 绘制独立的文字（不在形状内的）
    slide.texts.forEach(textItem => {
      ctx.save();
      ctx.font = `${textItem.bold ? 'bold' : 'normal'} ${textItem.italic ? 'italic' : 'normal'} ${Math.max(10, textItem.fontSize * 0.9)}px sans-serif`;
      ctx.fillStyle = textItem.color;
      ctx.textAlign = textItem.align;
      ctx.textBaseline = 'top';

      // 文字换行处理
      const words = textItem.text.split('\n');
      let y = textItem.y;
      words.forEach(line => {
        // 自动换行
        const maxWidth = textItem.width;
        const wordsLine = line.split(' ');
        let currentLine = '';

        wordsLine.forEach(word => {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const metrics = ctx.measureText(testLine);

          if (metrics.width > maxWidth && currentLine) {
            if (currentLine) {
              ctx.fillText(currentLine, textItem.x, y);
              y += textItem.fontSize * 1.2;
            }
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });

        if (currentLine) {
          ctx.fillText(currentLine, textItem.x, y);
          y += textItem.fontSize * 1.2;
        }
      });
      ctx.restore();
    });

    // 添加幻灯片标题
    if (slide.title) {
      ctx.save();
      ctx.font = 'bold 24px sans-serif';
      ctx.fillStyle = '#333333';
      ctx.textAlign = 'center';
      ctx.fillText(slide.title, DISPLAY_WIDTH / 2, 30);
      ctx.restore();
    }

    // 添加幻灯片编号
    ctx.save();
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'left';
    ctx.fillText(`${slideIndex + 1}`, 20, DISPLAY_HEIGHT - 20);
    ctx.restore();

    return canvas.toDataURL('image/png');
  };

  // 解析 PPTX 文件
  useEffect(() => {
    const loadPptx = async () => {
      setLoading(true);
      setError(null);

      try {
        const fullUrl = src.startsWith('/') ? `${API_BASE}${src}` : src;
        const JSZip = (await import('jszip')).default;
        
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error('无法加载 PPT 文件');
        
        const arrayBuffer = await response.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);
        
        // EMU 转换为显示像素
        const emuToX = (emu: number) => (emu / SLIDE_WIDTH_EMU) * DISPLAY_WIDTH;
        const emuToY = (emu: number) => (emu / SLIDE_HEIGHT_EMU) * DISPLAY_HEIGHT;
        
        // 提取所有媒体文件
        const mediaFiles: { [key: string]: string } = {};
        const mediaPromises: Promise<void>[] = [];
        
        zip.forEach((relativePath, file) => {
          if (relativePath.startsWith('ppt/media/')) {
            const promise = file.async('base64').then(base64 => {
              const ext = relativePath.split('.').pop()?.toLowerCase();
              let mimeType = 'image/png';
              if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
              else if (ext === 'gif') mimeType = 'image/gif';
              else if (ext === 'svg') mimeType = 'image/svg+xml';
              else if (ext === 'webp') mimeType = 'image/webp';
              
              const fileName = relativePath.split('/').pop() || '';
              mediaFiles[fileName] = `data:${mimeType};base64,${base64}`;
            });
            mediaPromises.push(promise);
          }
        });
        
        await Promise.all(mediaPromises);
        
        // 解析主题颜色
        const themeColors: { [key: string]: string } = {};
        const theme1File = zip.file('ppt/theme/theme1.xml');
        if (theme1File) {
          const themeContent = await theme1File.async('string');
          // 解析 scheme colors
          const colorMappings = [
            { name: 'dk1', default: '000000' },
            { name: 'lt1', default: 'FFFFFF' },
            { name: 'dk2', default: '1F497D' },
            { name: 'lt2', default: 'EEECE1' },
            { name: 'accent1', default: '4F81BD' },
            { name: 'accent2', default: 'C0504D' },
            { name: 'accent3', default: '9BBB59' },
            { name: 'accent4', default: '8064A2' },
            { name: 'accent5', default: '4BACC6' },
            { name: 'accent6', default: 'F79646' },
            { name: 'hlink', default: '0000FF' },
            { name: 'folHlink', default: '800080' },
          ];
          
          for (const cm of colorMappings) {
            const regex = new RegExp(`<a:${cm.name}>[\\s\\S]*?<a:srgbClr val="([A-Fa-f0-9]{6})"`, 'i');
            const match = themeContent.match(regex);
            themeColors[cm.name] = match ? match[1] : cm.default;
          }
        }
        
        // 解析关系文件
        const relsFiles: { [slideNum: string]: { [rId: string]: string } } = {};
        
        for (let i = 1; i <= 100; i++) {
          const relsPath = `ppt/slides/_rels/slide${i}.xml.rels`;
          const relsFile = zip.file(relsPath);
          if (relsFile) {
            const relsContent = await relsFile.async('string');
            const rels: { [rId: string]: string } = {};
            const relMatches = relsContent.matchAll(/Id="(rId\d+)"[^>]*Target="([^"]+)"/g);
            for (const match of relMatches) {
              const rId = match[1];
              const target = match[2];
              if (target.includes('media/')) {
                rels[rId] = target.split('/').pop() || '';
              }
            }
            relsFiles[`slide${i}`] = rels;
          } else {
            break;
          }
        }
        
        // 查找所有幻灯片
        const slideFiles: string[] = [];
        zip.forEach((relativePath) => {
          if (relativePath.match(/ppt\/slides\/slide\d+\.xml$/)) {
            slideFiles.push(relativePath);
          }
        });
        
        slideFiles.sort((a, b) => {
          const numA = parseInt(a.match(/slide(\d+)\.xml$/)?.[1] || '0');
          const numB = parseInt(b.match(/slide(\d+)\.xml$/)?.[1] || '0');
          return numA - numB;
        });

        if (slideFiles.length === 0) {
          throw new Error('PPT 文件中没有找到幻灯片');
        }

        // 解析颜色值
        const parseColor = (colorXml: string): string => {
          // srgbClr - 直接 RGB
          const srgbMatch = colorXml.match(/<a:srgbClr val="([A-Fa-f0-9]{6})"/i);
          if (srgbMatch) return `#${srgbMatch[1]}`;
          
          // schemeClr - 主题颜色
          const schemeMatch = colorXml.match(/<a:schemeClr val="(\w+)"/i);
          if (schemeMatch && themeColors[schemeMatch[1]]) {
            return `#${themeColors[schemeMatch[1]]}`;
          }
          
          return '#333333';
        };

        // 解析每张幻灯片
        const slideContents: SlideContent[] = [];
        
        for (const slideFile of slideFiles) {
          const slideNum = slideFile.match(/slide(\d+)\.xml$/)?.[1] || '1';
          const content = await zip.file(slideFile)?.async('string');
          
          const slideContent: SlideContent = {
            texts: [],
            images: [],
            shapes: [],
          };
          
          if (!content) {
            slideContents.push(slideContent);
            continue;
          }
          
          const slideRels = relsFiles[`slide${slideNum}`] || {};
          
          // 解析背景
          const bgMatch = content.match(/<p:bg>[\s\S]*?<\/p:bg>/);
          if (bgMatch) {
            const bgXml = bgMatch[0];
            // 纯色背景
            const solidFillMatch = bgXml.match(/<a:solidFill>[\s\S]*?<\/a:solidFill>/);
            if (solidFillMatch) {
              slideContent.background = parseColor(solidFillMatch[0]);
            }
            // 背景图片
            const blipMatch = bgXml.match(/r:embed="(rId\d+)"/);
            if (blipMatch && slideRels[blipMatch[1]]) {
              const mediaName = slideRels[blipMatch[1]];
              if (mediaFiles[mediaName]) {
                slideContent.backgroundImage = mediaFiles[mediaName];
              }
            }
          }

          // 解析形状 (p:sp) - 包括文本框
          const spMatches = [...content.matchAll(/<p:sp\b[\s\S]*?<\/p:sp>/g)];

          for (const spMatch of spMatches) {
            const sp = spMatch[0];

            // 获取位置和大小
            const xfrmMatch = sp.match(/<a:xfrm[^>]*>[\s\S]*?<a:off x="(\d+)" y="(\d+)"[\s\S]*?<a:ext cx="(\d+)" cy="(\d+)"/);
            if (!xfrmMatch) continue;

            const x = emuToX(parseInt(xfrmMatch[1]));
            const y = emuToY(parseInt(xfrmMatch[2]));
            const width = emuToX(parseInt(xfrmMatch[3]));
            const height = emuToY(parseInt(xfrmMatch[4]));

            // 获取形状类型
            const prstGeomMatch = sp.match(/<a:prstGeom prst="([^"]+)"/);
            const shapeType = prstGeomMatch ? prstGeomMatch[1] : 'rect';

            // 获取填充
            let fill: string | undefined;
            let stroke: string | undefined;
            let strokeWidth: number = 1;

            // 纯色填充
            const solidFillMatch = sp.match(/<a:solidFill>([\s\S]*?)<\/a:solidFill>/);
            if (solidFillMatch) {
              fill = parseColor(solidFillMatch[0]);
            }

            // 渐变填充
            const gradFillMatch = sp.match(/<a:gradFill>([\s\S]*?)<\/a:gradFill>/);
            if (gradFillMatch) {
              // 简单渐变处理
              const gradContent = gradFillMatch[0];
              const colorMatch = gradContent.match(/<a:srgbClr val="([A-Fa-f0-9]{6})"/);
              if (colorMatch) {
                fill = `linear-gradient(135deg, #${colorMatch[1]}DD, #${colorMatch[1]})`;
              }
            }

            // 线条样式
            const lnMatch = sp.match(/<a:ln[^>]*>([\s\S]*?)<\/a:ln>/);
            if (lnMatch) {
              const lnContent = lnMatch[0];
              const colorMatch = lnContent.match(/<a:solidFill>([\s\S]*?)<\/a:solidFill>/);
              if (colorMatch) {
                stroke = parseColor(colorMatch[0]);
              }
              const wMatch = lnContent.match(/w="(\d+)"/);
              if (wMatch) {
                strokeWidth = parseInt(wMatch[1]) / 12700; // EMU to pixels
              }
            }
            
            // 解析文本内容
            const txBodyMatch = sp.match(/<p:txBody>([\s\S]*?)<\/p:txBody>/);
            const shapeTexts: TextItem[] = [];
            
            if (txBodyMatch) {
              const txBody = txBodyMatch[1];
              const paragraphs = [...txBody.matchAll(/<a:p\b[^>]*>([\s\S]*?)<\/a:p>/g)];
              
              let textY = y;
              for (const paraMatch of paragraphs) {
                const para = paraMatch[0];
                
                // 获取对齐方式
                let align: 'left' | 'center' | 'right' = 'left';
                if (para.includes('algn="ctr"')) align = 'center';
                else if (para.includes('algn="r"')) align = 'right';
                
                // 提取文本和样式
                const runs = [...para.matchAll(/<a:r>([\s\S]*?)<\/a:r>/g)];
                let lineText = '';
                let fontSize = 18;
                let bold = false;
                let italic = false;
                let color = '#333333';
                
                for (const runMatch of runs) {
                  const run = runMatch[0];
                  const textMatch = run.match(/<a:t>([^<]*)<\/a:t>/);
                  if (textMatch) {
                    lineText += textMatch[1];
                  }
                  
                  // 字体大小 (以 1/100 pt 为单位)
                  const szMatch = run.match(/sz="(\d+)"/);
                  if (szMatch) fontSize = parseInt(szMatch[1]) / 100;
                  
                  // 粗体
                  if (run.includes('b="1"') || run.includes('<a:b/>')) bold = true;
                  
                  // 斜体
                  if (run.includes('i="1"') || run.includes('<a:i/>')) italic = true;
                  
                  // 颜色
                  const colorMatch = run.match(/<a:solidFill>([\s\S]*?)<\/a:solidFill>/);
                  if (colorMatch) color = parseColor(colorMatch[0]);
                }
                
                if (lineText.trim()) {
                  shapeTexts.push({
                    text: lineText,
                    fontSize: Math.max(12, Math.min(fontSize, 72)),
                    bold,
                    italic,
                    color,
                    x, y: textY,
                    width, height: fontSize * 1.5,
                    align
                  });
                  textY += fontSize * 1.5;
                }
              }
            }
            
            // 创建形状对象
            const shapeObj: ShapeItem = {
              type: 'rect',
              x, y, width, height,
              fill,
              stroke,
              strokeWidth,
              texts: shapeTexts
            };

            // 根据形状类型设置
            if (shapeType === 'ellipse') {
              shapeObj.type = 'ellipse';
            } else if (shapeType === 'roundRect') {
              shapeObj.type = 'roundRect';
            } else if (shapeType === 'triangle') {
              shapeObj.type = 'triangle';
            }

            // 添加形状
            slideContent.shapes.push(shapeObj);

            // 将文字添加到全局文字列表
            slideContent.texts.push(...shapeTexts);
          }

          // 解析图片 (p:pic)
          const picMatches = [...content.matchAll(/<p:pic\b[\s\S]*?<\/p:pic>/g)];
          
          for (const picMatch of picMatches) {
            const pic = picMatch[0];
            
            const embedMatch = pic.match(/r:embed="(rId\d+)"/);
            if (!embedMatch) continue;
            
            const mediaName = slideRels[embedMatch[1]];
            if (!mediaName || !mediaFiles[mediaName]) continue;
            
            const xfrmMatch = pic.match(/<a:xfrm[^>]*>[\s\S]*?<a:off x="(\d+)" y="(\d+)"[\s\S]*?<a:ext cx="(\d+)" cy="(\d+)"/);
            if (!xfrmMatch) continue;
            
            slideContent.images.push({
              src: mediaFiles[mediaName],
              x: emuToX(parseInt(xfrmMatch[1])),
              y: emuToY(parseInt(xfrmMatch[2])),
              width: emuToX(parseInt(xfrmMatch[3])),
              height: emuToY(parseInt(xfrmMatch[4]))
            });
          }
          
          // 如果没有内容，添加占位符
          if (slideContent.texts.length === 0 && slideContent.images.length === 0) {
            slideContent.texts.push({
              text: `幻灯片 ${slideContents.length + 1}`,
              fontSize: 24,
              bold: false,
              italic: false,
              color: '#666666',
              x: DISPLAY_WIDTH / 2 - 100,
              y: DISPLAY_HEIGHT / 2 - 20,
              width: 200,
              height: 40,
              align: 'center'
            });
          }
          
          slideContents.push(slideContent);
        }

        // 使用Canvas渲染所有幻灯片
        const renderedCanvasImages = await Promise.all(
          slideContents.map((slide, index) => renderSlideToCanvas(slide, index))
        );

        setSlides(slideContents);
        setCanvasImages(renderedCanvasImages);
        setCurrentSlide(0);
        setLoading(false);
      } catch (err: any) {
        console.error('PPT 加载错误:', err);
        setError(err.message || '加载失败');
        setLoading(false);
      }
    };

    loadPptx();
  }, [src]);

  // 切换幻灯片
  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
    }
  };

  // 全屏切换
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToSlide(currentSlide - 1);
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        goToSlide(currentSlide + 1);
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, slides.length, isFullscreen]);

  const resolvedSrc = src.startsWith('/') ? `${API_BASE}${src}` : src;

  return (
    <div 
      ref={containerRef}
      className={`ppt-viewer my-4 rounded-lg overflow-hidden border ${isFullscreen ? 'fixed inset-0 z-50 m-0 rounded-none' : ''}`}
      style={{ borderColor: 'var(--border)' }}
    >
      {/* 头部工具栏 */}
      <div 
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-2">
          <MonitorPlay size={20} style={{ color: 'var(--accent)' }} />
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            {name}
          </span>
          {slides.length > 0 && (
            <span className="text-sm ml-2" style={{ color: 'var(--text-muted)' }}>
              ({currentSlide + 1} / {slides.length})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded transition-colors hover:bg-opacity-80"
            style={{ color: 'var(--text-secondary)' }}
            title={isFullscreen ? '退出全屏' : '全屏'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <a
            href={resolvedSrc}
            download={name}
            className="px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1"
            style={{ 
              backgroundColor: 'var(--accent)', 
              color: 'white'
            }}
            title="下载PPT"
          >
            <Download size={14} />
            下载
          </a>
        </div>
      </div>

      {/* 幻灯片预览区域 */}
      <div 
        className={`relative w-full flex items-center justify-center ${isFullscreen ? 'flex-1' : ''}`}
        style={{ 
          height: isFullscreen ? 'calc(100vh - 120px)' : '450px',
          backgroundColor: 'var(--bg-tertiary)'
        }}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-4" style={{ color: 'var(--text-secondary)' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}></div>
            <p>正在加载 PPT...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 px-8 text-center" style={{ color: 'var(--text-secondary)' }}>
            <MonitorPlay size={48} style={{ color: 'var(--warning)', opacity: 0.7 }} />
            <p>{error}</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              请下载文件后用 PowerPoint 或 WPS 打开
            </p>
          </div>
        ) : slides.length > 0 ? (
          <>
            {/* Canvas渲染的幻灯片内容 */}
            {canvasImages[currentSlide] ? (
              <div
                className="relative overflow-hidden"
                style={{
                  width: isFullscreen ? '960px' : '100%',
                  height: isFullscreen ? '540px' : '100%',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  aspectRatio: '16/9',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#ffffff'
                }}
              >
                <img
                  src={canvasImages[currentSlide]}
                  alt={`幻灯片 ${currentSlide + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>
            ) : (
              <div
                className="relative overflow-hidden"
                style={{
                  backgroundColor: slides[currentSlide].background || '#ffffff',
                  backgroundImage: slides[currentSlide].backgroundImage ? `url(${slides[currentSlide].backgroundImage})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  width: isFullscreen ? '960px' : '100%',
                  height: isFullscreen ? '540px' : '100%',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  aspectRatio: '16/9',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}
              >
                {/* 渲染形状（背景层） */}
                {slides[currentSlide].shapes.map((shape, idx) => (
                  <div
                    key={`shape-${idx}`}
                    style={{
                      position: 'absolute',
                      left: `${(shape.x / DISPLAY_WIDTH) * 100}%`,
                      top: `${(shape.y / DISPLAY_HEIGHT) * 100}%`,
                      width: `${(shape.width / DISPLAY_WIDTH) * 100}%`,
                      height: `${(shape.height / DISPLAY_HEIGHT) * 100}%`,
                      backgroundColor: shape.fill,
                      borderRadius: shape.type === 'ellipse' ? '50%' : shape.type === 'roundRect' ? '8px' : shape.type === 'triangle' ? '0' : '0',
                      border: shape.stroke ? `${shape.strokeWidth || 1}px solid ${shape.stroke}` : undefined,
                      clipPath: shape.type === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined
                    }}
                  />
                ))}

                {/* 渲染图片 */}
                {slides[currentSlide].images.map((img, idx) => (
                  <img
                    key={`img-${idx}`}
                    src={img.src}
                    alt={`Slide image ${idx + 1}`}
                    style={{
                      position: 'absolute',
                      left: `${(img.x / DISPLAY_WIDTH) * 100}%`,
                      top: `${(img.y / DISPLAY_HEIGHT) * 100}%`,
                      width: `${(img.width / DISPLAY_WIDTH) * 100}%`,
                      height: `${(img.height / DISPLAY_HEIGHT) * 100}%`,
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ))}

                {/* 渲染文本 - 使用精确位置 */}
                {slides[currentSlide].texts.map((textItem, idx) => (
                  <div
                    key={`text-${idx}`}
                    style={{
                      position: 'absolute',
                      left: `${(textItem.x / DISPLAY_WIDTH) * 100}%`,
                      top: `${(textItem.y / DISPLAY_HEIGHT) * 100}%`,
                      width: `${(textItem.width / DISPLAY_WIDTH) * 100}%`,
                      fontSize: `${Math.max(10, textItem.fontSize * 0.9)}px`,
                      fontWeight: textItem.bold ? 'bold' : 'normal',
                      fontStyle: textItem.italic ? 'italic' : 'normal',
                      color: textItem.color,
                      textAlign: textItem.align,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      lineHeight: 1.3,
                      pointerEvents: 'none'
                    }}
                  >
                    {textItem.text}
                  </div>
                ))}

                {/* 如果没有背景，显示默认渐变 */}
                {!slides[currentSlide].background && !slides[currentSlide].backgroundImage &&
                 slides[currentSlide].images.length === 0 && slides[currentSlide].shapes.length === 0 && (
                  <div
                    className="absolute inset-0 -z-10"
                    style={{
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
                    }}
                  />
                )}
              </div>
            )}

            {/* 左右导航按钮 */}
            {currentSlide > 0 && (
              <button
                onClick={() => goToSlide(currentSlide - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors hover:scale-110"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
                title="上一张 (←)"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            {currentSlide < slides.length - 1 && (
              <button
                onClick={() => goToSlide(currentSlide + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors hover:scale-110"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
                title="下一张 (→)"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-4" style={{ color: 'var(--text-secondary)' }}>
            <MonitorPlay size={48} style={{ color: 'var(--accent)', opacity: 0.5 }} />
            <p>没有找到幻灯片内容</p>
          </div>
        )}
      </div>

      {/* 底部幻灯片导航 */}
      {slides.length > 1 && (
        <div 
          className="flex items-center justify-center gap-2 px-4 py-3 overflow-x-auto"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                index === currentSlide ? 'ring-2 ring-offset-1' : ''
              }`}
              style={{ 
                backgroundColor: index === currentSlide ? 'var(--accent)' : 'var(--bg-primary)',
                color: index === currentSlide ? 'white' : 'var(--text-secondary)'
              }}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
