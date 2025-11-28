import React, { useEffect, useRef, useState } from 'react';
import { MonitorPlay, ChevronLeft, ChevronRight, Download, Maximize2, Minimize2, AlertCircle } from 'lucide-react';

interface PptCanvasRendererProps {
  src: string;
  name: string;
}

interface SlideData {
  width: number;
  height: number;
  elements: SlideElement[];
  background?: string;
  backgroundImage?: string;
}

interface SlideElement {
  type: 'text' | 'shape' | 'image' | 'line';
  x: number;
  y: number;
  width: number;
  height: number;
  style?: any;
  text?: string;
  src?: string;
  shapeType?: string;
}

export const PptCanvasRenderer: React.FC<PptCanvasRendererProps> = ({ src, name }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 增强的PPTX解析器
  const parsePPTXFile = async (arrayBuffer: ArrayBuffer): Promise<SlideData[]> => {
    // 基本文件验证
    if (!arrayBuffer || arrayBuffer.byteLength < 100) {
      throw new Error('文件太小，不是有效的PPTX文件');
    }

    console.log('📁 开始解析PPTX文件...');
    console.log(`文件大小: ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);

    // 检查文件头以识别PPTX格式
    const view = new DataView(arrayBuffer);
    const headerBytes = [];
    for (let i = 0; i < Math.min(20, arrayBuffer.byteLength); i++) {
      headerBytes.push(view.getUint8(i).toString(16).padStart(2, '0'));
    }
    console.log('文件头:', headerBytes.join(' '));

    // PPTX文件是ZIP格式，检查ZIP签名
    // 标准ZIP本地文件头签名: 0x04034b50 (小端) 或 0x504b0304 (大端)
    const zipSignatureLE = view.getUint32(0, true);  // 小端
    const zipSignatureBE = view.getUint32(0, false); // 大端

    const isValidZipSignature = zipSignatureLE === 0x04034b50 ||
                                zipSignatureBE === 0x504b0304 ||
                                // 检查可能的ZIP变体
                                zipSignatureLE === 0x04034b50 + 0x1000; // 某些变体

    if (!isValidZipSignature) {
      // 如果不是标准ZIP，尝试其他PPTX格式检测
      console.log('非标准ZIP签名，尝试其他检测方法...');

      // 检查是否有OLE2头（旧版PPT格式）
      const oleSignature = view.getUint32(0, true);
      if (oleSignature === 0xE011CFD0 || oleSignature === 0xE11AB1A1) {
        throw new Error('检测到旧版PPT格式（.ppt），请转换为.pptx格式或使用PowerPoint 2007及以上版本');
      }

      // 对于其他情况，仍然尝试JSZip解析，因为有些PPTX可能有特殊的文件头
      console.log('尝试强制使用JSZip解析...');
    }

    const JSZip = (await import('jszip')).default;
    let zip;

    try {
      // 为JSZip提供更宽松的选项
      const options = {
        // 允许更宽松的ZIP解析
        checkCRC32: false,
        // 不严格验证
        strict: false
      };

      zip = await JSZip.loadAsync(arrayBuffer, options);
      console.log('✅ JSZip解析成功');

    } catch (zipError) {
      console.error('JSZip解析失败:', zipError);

      // 提供更具体的错误信息
      let errorMsg = '文件解析失败';
      if (zipError instanceof Error) {
        if (zipError.message.includes('end of central directory')) {
          errorMsg = 'ZIP文件结构不完整或损坏。建议：\n• 重新导出PPT文件为.pptx格式\n• 检查文件是否完整下载\n• 尝试保存为新文件名';
        } else if (zipError.message.includes('invalid signature')) {
          errorMsg = '文件签名无效。可能的原因：\n• 文件不是PowerPoint格式\n• 文件已损坏\n• 需要转换为.pptx格式';
        } else {
          errorMsg = `解析错误：${zipError.message}`;
        }
      }

      throw new Error(`${errorMsg}\n\n建议操作：\n• 在PowerPoint中打开文件并另存为.pptx格式\n• 确保文件没有密码保护\n• 检查文件大小是否正常（通常几KB到几十MB）`);
    }

    // 验证PPTX文件结构 - 更宽松的验证
    console.log('🔍 检查PPTX文件结构...');

    // 列出所有文件用于调试
    const allFiles = Object.keys(zip.files);
    console.log('📁 文件列表:', allFiles.slice(0, 10)); // 只显示前10个文件
    if (allFiles.length > 10) {
      console.log(`... 和其他 ${allFiles.length - 10} 个文件`);
    }

    // 检查关键文件
    const contentTypes = zip.file('[Content_Types].xml');
    const presentation = zip.file('ppt/presentation.xml');

    if (!contentTypes && !presentation) {
      // 如果没有找到标准文件，检查是否有其他可能的文件结构
      const xmlFiles = allFiles.filter(file => file.endsWith('.xml'));
      const pptFiles = allFiles.filter(file => file.includes('ppt') || file.includes('slide'));

      console.log('📋 发现的XML文件:', xmlFiles.slice(0, 5));
      console.log('📋 发现的PPT相关文件:', pptFiles.slice(0, 5));

      if (xmlFiles.length === 0) {
        throw new Error('文件中未找到XML内容，可能不是有效的PPTX文件');
      }

      console.log('⚠️ 非标准PPTX结构，尝试解析可用内容...');
    } else {
      console.log('✅ 找到标准PPTX文件结构');
    }

    // 检查幻灯片数量
    const presentationFile = zip.file('ppt/presentation.xml');
    if (presentationFile) {
      const presentationContent = await presentationFile.async('string');
      const slideCountMatch = presentationContent.match(/<p:sldIdLst>([\s\S]*?)<\/p:sldIdLst>/);
      if (slideCountMatch) {
        const slideIds = slideCountMatch[0].match(/<p:sldId/g);
        const slideCount = slideIds ? slideIds.length : 0;
        console.log(`📑 发现 ${slideCount} 张幻灯片`);
      }
    }

    const slides: SlideData[] = [];

    // 解析主题和样式
    const themeFile = zip.file('ppt/theme/theme1.xml');
    const themeData: any = {};
    try {
      if (themeFile) {
        const themeContent = await themeFile.async('string');
        themeData.colors = parseThemeColors(themeContent);
        themeData.fonts = parseThemeFonts(themeContent);
        console.log('✅ 主题文件解析成功');
      } else {
        console.log('⚠️ 未找到主题文件，使用默认样式');
        // 设置默认主题
        themeData.colors = {
          dk1: '#000000',
          lt1: '#FFFFFF',
          dk2: '#1F497D',
          lt2: '#EEECE1'
        };
        themeData.fonts = {
          latin: 'Arial',
          eastAsian: 'Microsoft YaHei',
          complexScript: 'Arial'
        };
      }
    } catch (themeError) {
      console.warn('主题解析失败，使用默认样式:', themeError);
    }

    // 智能查找幻灯片文件
    console.log('🔍 查找幻灯片文件...');

    // 方法1: 标准命名 slide1.xml, slide2.xml...
    let foundSlides = 0;
    for (let i = 1; i <= 100; i++) {
      const slideFile = zip.file(`ppt/slides/slide${i}.xml`);
      if (slideFile) {
        try {
          const slideContent = await slideFile.async('string');
          const relsFile = zip.file(`ppt/slides/_rels/slide${i}.xml.rels`);
          const relsContent = relsFile ? await relsFile.async('string') : '';

          console.log(`📄 解析幻灯片 ${i}...`);
          const slideData = parseSlideContent(slideContent, relsContent, zip, themeData);
          if (slideData) {
            slides.push(slideData);
            foundSlides++;
          }
        } catch (slideError) {
          console.warn(`幻灯片 ${i} 解析失败:`, slideError);
        }
      } else {
        // 检查是否还有更多幻灯片
        const nextSlideFile = zip.file(`ppt/slides/slide${i + 1}.xml`);
        if (!nextSlideFile) break;
      }
    }

    // 方法2: 如果没有找到标准命名，查找所有slide文件
    if (foundSlides === 0) {
      console.log('📋 尝试查找所有幻灯片文件...');
      const slideFiles = allFiles.filter(file =>
        file.includes('slide') &&
        file.endsWith('.xml') &&
        !file.includes('_rels')
      );

      console.log(`发现 ${slideFiles.length} 个可能的幻灯片文件`);

      for (const slideFile of slideFiles) {
        try {
          const file = zip.file(slideFile);
          if (file) {
            const slideContent = await file.async('string');

            // 查找对应的关系文件
            const relsPath = slideFile.replace('slides/', 'slides/_rels/').replace('.xml', '.xml.rels');
            const relsFile = zip.file(relsPath);
            const relsContent = relsFile ? await relsFile.async('string') : '';

            console.log(`📄 解析幻灯片: ${slideFile}`);
            const slideData = parseSlideContent(slideContent, relsContent, zip, themeData);
            if (slideData) {
              slides.push(slideData);
            }
          }
        } catch (slideError) {
          console.warn(`幻灯片文件 ${slideFile} 解析失败:`, slideError);
        }
      }
    }

    console.log(`✅ 成功解析 ${slides.length} 张幻灯片`);

    if (slides.length === 0) {
      throw new Error(`未找到可解析的幻灯片内容。\n\n可能的原因：\n• 文件不是PowerPoint格式\n• 文件已损坏\n• 不支持的PowerPoint版本\n\n建议：\n• 在PowerPoint中重新保存文件\n• 尝试另存为.pptx格式\n• 检查文件是否包含有效内容`);
    }

    return slides;
  };

  // 解析主题颜色
  const parseThemeColors = (themeContent: string): any => {
    const colors: any = {};
    const colorRegex = /<a:(\w+)><a:srgbClr val="([A-Fa-f0-9]{6})"\/>/g;
    let match;
    while ((match = colorRegex.exec(themeContent)) !== null) {
      colors[match[1]] = `#${match[2]}`;
    }
    return colors;
  };

  // 解析主题字体
  const parseThemeFonts = (themeContent: string): any => {
    const fonts: any = {
      latin: 'Arial',
      eastAsian: 'Microsoft YaHei',
      complexScript: 'Arial'
    };

    const fontRegex = /<a:latin typeface="([^"]+)"/;
    const match = fontRegex.exec(themeContent);
    if (match) {
      fonts.latin = match[1];
    }

    return fonts;
  };

  // 解析幻灯片内容
  const parseSlideContent = async (
    slideContent: string,
    relsContent: string,
    zip: any,
    themeData: any
  ): Promise<SlideData | null> => {
    const elements: SlideElement[] = [];

    // 解析尺寸
    const sldSzMatch = slideContent.match(/<p:sldSz cx="(\d+)" cy="(\d+)"/);
    const width = sldSzMatch ? parseInt(sldSzMatch[1]) : 9144000;
    const height = sldSzMatch ? parseInt(sldSzMatch[2]) : 5143500;

    // 解析背景
    let background = '#FFFFFF';
    let backgroundImage: string | undefined;

    const bgMatch = slideContent.match(/<p:bg>([\s\S]*?)<\/p:bg>/);
    if (bgMatch) {
      const solidFillMatch = bgMatch[0].match(/<a:solidFill>([\s\S]*?)<\/a:solidFill>/);
      if (solidFillMatch) {
        const colorMatch = solidFillMatch[0].match(/val="([A-Fa-f0-9]{6})"/);
        if (colorMatch) {
          background = `#${colorMatch[1]}`;
        }
      }

      const blipMatch = bgMatch[0].match(/r:embed="([^"]+)"/);
      if (blipMatch) {
        // 解析关系文件获取图片
        const relMatch = relsContent.match(new RegExp(`<Relationship[^>]*Id="${blipMatch[1]}"[^>]*Target="([^"]+)"`));
        if (relMatch) {
          const imagePath = relMatch[1];
          const imageFile = zip.file(`ppt/${imagePath}`);
          if (imageFile) {
            const imageData = await imageFile.async('base64');
            const ext = imagePath.split('.').pop()?.toLowerCase() || 'png';
            backgroundImage = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${imageData}`;
          }
        }
      }
    }

    // 解析关系映射
    const rels: { [key: string]: string } = {};
    const relMatches = relsContent.matchAll(/<Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g);
    for (const match of relMatches) {
      rels[match[1]] = match[2];
    }

    // 解析形状
    const shapeMatches = slideContent.matchAll(/<p:sp>([\s\S]*?)<\/p:sp>/g);
    for (const shapeMatch of shapeMatches) {
      const shapeData = parseShape(shapeMatch[1], width, height, themeData);
      if (shapeData) {
        elements.push(shapeData);
      }
    }

    // 解析图片
    const picMatches = slideContent.matchAll(/<p:pic>([\s\S]*?)<\/p:pic>/g);
    for (const picMatch of picMatches) {
      const imageData = await parsePicture(picMatch[1], rels, zip, width, height);
      if (imageData) {
        elements.push(imageData);
      }
    }

    return {
      width,
      height,
      elements,
      background,
      backgroundImage
    };
  };

  // 解析形状
  const parseShape = (
    shapeContent: string,
    slideWidth: number,
    slideHeight: number,
    themeData: any
  ): SlideElement | null => {
    // 解析位置和尺寸
    const xfrmMatch = shapeContent.match(/<a:xfrm>([\s\S]*?)<\/a:xfrm>/);
    if (!xfrmMatch) return null;

    const offMatch = xfrmMatch[1].match(/<a:off x="(\d+)" y="(\d+)"/);
    const extMatch = xfrmMatch[1].match(/<a:ext cx="(\d+)" cy="(\d+)"/);

    if (!offMatch || !extMatch) return null;

    const x = parseInt(offMatch[1]);
    const y = parseInt(offMatch[2]);
    const width = parseInt(extMatch[1]);
    const height = parseInt(extMatch[2]);

    // 解析形状类型
    const prstGeomMatch = shapeContent.match(/<a:prstGeom prst="([^"]+)"/);
    const shapeType = prstGeomMatch ? prstGeomMatch[1] : 'rect';

    // 解析样式
    const style: any = {
      fill: '#FFFFFF',
      stroke: '#000000',
      strokeWidth: 1,
      fontFamily: themeData.fonts?.latin || 'Arial',
      fontSize: 18,
      color: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left'
    };

    // 解析填充
    const solidFillMatch = shapeContent.match(/<a:solidFill>([\s\S]*?)<\/a:solidFill>/);
    if (solidFillMatch) {
      const colorMatch = solidFillMatch[0].match(/val="([A-Fa-f0-9]{6})"/);
      if (colorMatch) {
        style.fill = `#${colorMatch[1]}`;
      }
    }

    // 解析边框
    const lnMatch = shapeContent.match(/<a:ln[^>]*>([\s\S]*?)<\/a:ln>/);
    if (lnMatch) {
      const colorMatch = lnMatch[0].match(/val="([A-Fa-f0-9]{6})"/);
      if (colorMatch) {
        style.stroke = `#${colorMatch[1]}`;
      }
      const wMatch = lnMatch[0].match(/w="(\d+)"/);
      if (wMatch) {
        style.strokeWidth = parseInt(wMatch[1]) / 12700;
      }
    }

    // 解析文本
    const txBodyMatch = shapeContent.match(/<p:txBody>([\s\S]*?)<\/p:txBody>/);
    let text = '';
    if (txBodyMatch) {
      const textMatches = txBodyMatch[1].matchAll(/<a:t>([^<]*)<\/a:t>/g);
      text = Array.from(textMatches).map(match => match[1]).join('');

      // 解析文本样式
      const rPrMatch = txBodyMatch[1].match(/<a:rPr[^>]*>([\s\S]*?)<\/a:rPr>/);
      if (rPrMatch) {
        const szMatch = rPrMatch[0].match(/sz="(\d+)"/);
        if (szMatch) {
          style.fontSize = parseInt(szMatch[1]) / 100;
        }

        if (rPrMatch[0].includes('<a:b/>') || rPrMatch[0].includes('b="1"')) {
          style.fontWeight = 'bold';
        }

        if (rPrMatch[0].includes('<a:i/>') || rPrMatch[0].includes('i="1"')) {
          style.fontStyle = 'italic';
        }

        const colorMatch = rPrMatch[0].match(/val="([A-Fa-f0-9]{6})"/);
        if (colorMatch) {
          style.color = `#${colorMatch[1]}`;
        }
      }
    }

    return {
      type: text ? 'text' : 'shape',
      x: (x / slideWidth) * 960,
      y: (y / slideHeight) * 540,
      width: (width / slideWidth) * 960,
      height: (height / slideHeight) * 540,
      shapeType,
      text,
      style
    };
  };

  // 解析图片
  const parsePicture = async (
    picContent: string,
    rels: { [key: string]: string },
    zip: any,
    slideWidth: number,
    slideHeight: number
  ): Promise<SlideElement | null> => {
    // 获取图片引用
    const embedMatch = picContent.match(/r:embed="([^"]+)"/);
    if (!embedMatch || !rels[embedMatch[1]]) return null;

    const imagePath = rels[embedMatch[1]];
    const imageFile = zip.file(`ppt/${imagePath}`);
    if (!imageFile) return null;

    // 解析位置和尺寸
    const xfrmMatch = picContent.match(/<a:xfrm>([\s\S]*?)<\/a:xfrm>/);
    if (!xfrmMatch) return null;

    const offMatch = xfrmMatch[1].match(/<a:off x="(\d+)" y="(\d+)"/);
    const extMatch = xfrmMatch[1].match(/<a:ext cx="(\d+)" cy="(\d+)"/);

    if (!offMatch || !extMatch) return null;

    const x = parseInt(offMatch[1]);
    const y = parseInt(offMatch[2]);
    const width = parseInt(extMatch[1]);
    const height = parseInt(extMatch[2]);

    // 获取图片数据
    const imageData = await imageFile.async('base64');
    const ext = imagePath.split('.').pop()?.toLowerCase() || 'png';
    const dataUrl = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${imageData}`;

    return {
      type: 'image',
      x: (x / slideWidth) * 960,
      y: (y / slideHeight) * 540,
      width: (width / slideWidth) * 960,
      height: (height / slideHeight) * 540,
      src: dataUrl
    };
  };

  // Canvas渲染函数
  const renderSlideToCanvas = async (slide: SlideData, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    canvas.width = 960;
    canvas.height = 540;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制背景
    if (slide.backgroundImage) {
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = slide.backgroundImage!;
      });
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = slide.background || '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 绘制元素
    for (const element of slide.elements) {
      await drawElement(ctx, element);
    }
  };

  // 绘制单个元素
  const drawElement = async (ctx: CanvasRenderingContext2D, element: SlideElement) => {
    ctx.save();

    switch (element.type) {
      case 'shape':
        await drawShape(ctx, element);
        break;
      case 'text':
        drawText(ctx, element);
        break;
      case 'image':
        await drawImage(ctx, element);
        break;
    }

    ctx.restore();
  };

  // 绘制形状
  const drawShape = async (ctx: CanvasRenderingContext2D, element: SlideElement) => {
    const style = element.style || {};

    ctx.fillStyle = style.fill || '#FFFFFF';
    ctx.strokeStyle = style.stroke || '#000000';
    ctx.lineWidth = style.strokeWidth || 1;

    ctx.beginPath();

    switch (element.shapeType) {
      case 'rect':
        ctx.rect(element.x, element.y, element.width, element.height);
        break;
      case 'roundRect':
        const radius = 10;
        ctx.moveTo(element.x + radius, element.y);
        ctx.lineTo(element.x + element.width - radius, element.y);
        ctx.arcTo(element.x + element.width, element.y, element.x + element.width, element.y + radius, radius);
        ctx.lineTo(element.x + element.width, element.y + element.height - radius);
        ctx.arcTo(element.x + element.width, element.y + element.height, element.x + element.width - radius, element.y + element.height, radius);
        ctx.lineTo(element.x + radius, element.y + element.height);
        ctx.arcTo(element.x, element.y + element.height, element.x, element.y + element.height - radius, radius);
        ctx.lineTo(element.x, element.y + radius);
        ctx.arcTo(element.x, element.y, element.x + radius, element.y, radius);
        break;
      case 'ellipse':
        ctx.ellipse(
          element.x + element.width / 2,
          element.y + element.height / 2,
          element.width / 2,
          element.height / 2,
          0, 0, 2 * Math.PI
        );
        break;
      case 'triangle':
        ctx.moveTo(element.x + element.width / 2, element.y);
        ctx.lineTo(element.x, element.y + element.height);
        ctx.lineTo(element.x + element.width, element.y + element.height);
        ctx.closePath();
        break;
      default:
        ctx.rect(element.x, element.y, element.width, element.height);
    }

    ctx.fill();
    if (style.strokeWidth && style.strokeWidth > 0) {
      ctx.stroke();
    }

    // 如果有文本，绘制文本
    if (element.text) {
      drawText(ctx, { ...element, type: 'text' });
    }
  };

  // 绘制文本
  const drawText = (ctx: CanvasRenderingContext2D, element: SlideElement) => {
    const style = element.style || {};

    ctx.font = `${style.fontStyle || 'normal'} ${style.fontWeight || 'normal'} ${style.fontSize || 16}px ${style.fontFamily || 'Arial'}`;
    ctx.fillStyle = style.color || '#000000';
    ctx.textAlign = style.textAlign || 'left' as CanvasTextAlign;
    ctx.textBaseline = 'top';

    const lines = element.text ? element.text.split('\n') : [];
    let y = element.y;
    const lineHeight = (style.fontSize || 16) * 1.2;

    for (const line of lines) {
      // 处理文本换行
      if (ctx.measureText(line).width > element.width) {
        const words = line.split(' ');
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          if (ctx.measureText(testLine).width > element.width && currentLine) {
            ctx.fillText(currentLine, element.x, y);
            currentLine = word;
            y += lineHeight;
          } else {
            currentLine = testLine;
          }
        }

        if (currentLine) {
          ctx.fillText(currentLine, element.x, y);
          y += lineHeight;
        }
      } else {
        ctx.fillText(line, element.x, y);
        y += lineHeight;
      }
    }
  };

  // 绘制图片
  const drawImage = async (ctx: CanvasRenderingContext2D, element: SlideElement) => {
    if (!element.src) return;

    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = element.src!;
    });

    ctx.drawImage(img, element.x, element.y, element.width, element.height);
  };

  // 加载PPTX文件
  useEffect(() => {
    const loadPPTX = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(src);
        if (!response.ok) throw new Error('无法加载PPT文件');

        const arrayBuffer = await response.arrayBuffer();
        const parsedSlides = await parsePPTXFile(arrayBuffer);

        if (parsedSlides.length === 0) {
          throw new Error('PPT文件中没有找到幻灯片');
        }

        setSlides(parsedSlides);
        setCurrentSlide(0);
      } catch (err: any) {
        console.error('PPT加载错误:', err);

        let errorMessage = err.message || 'PPT文件解析失败';

        // 根据错误类型提供详细建议
        if (errorMessage.includes('ZIP') || errorMessage.includes('文件格式错误')) {
          errorMessage += '\n\n解决建议:\n• 确保PowerPoint文件完整且未损坏\n• 尝试重新导出为.pptx格式（推荐）\n• 检查网络连接是否稳定\n• 如果文件较大，可能需要压缩内容';
        } else if (errorMessage.includes('无法加载PPT文件')) {
          errorMessage += '\n\n解决建议:\n• 检查文件路径是否正确\n• 确认文件存在且可访问\n• 检查网络连接';
        } else if (errorMessage.includes('没有找到幻灯片')) {
          errorMessage += '\n\n解决建议:\n• 确保PowerPoint文件包含幻灯片内容\n• 尝试重新创建并添加内容\n• 检查文件是否为空文件';
        } else {
          errorMessage += '\n\n通用建议:\n• 尝试使用文件分析工具检查文件格式\n• 确保使用支持的PowerPoint格式(.pptx)\n• 重新创建PowerPoint文件';
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (src) {
      loadPPTX();
    }
  }, [src]);

  // 渲染当前幻灯片
  useEffect(() => {
    if (slides.length > 0 && canvasRef.current && currentSlide < slides.length) {
      renderSlideToCanvas(slides[currentSlide], canvasRef.current);
    }
  }, [slides, currentSlide]);

  // 导航功能
  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
    }
  };

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
            href={src}
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

      {/* Canvas渲染区域 */}
      <div
        className={`relative w-full flex items-center justify-center ${isFullscreen ? 'flex-1' : ''}`}
        style={{
          height: isFullscreen ? 'calc(100vh - 120px)' : '540px',
          backgroundColor: 'var(--bg-tertiary)'
        }}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-4" style={{ color: 'var(--text-secondary)' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}></div>
            <p>正在解析PPT...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 px-8 text-center max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
            <AlertCircle size={48} style={{ color: 'var(--warning)', opacity: 0.7 }} />
            <div className="text-sm leading-relaxed">
              {error.split('\n').map((line, index) => (
                <div key={index} className={index === 0 ? 'font-medium mb-2' : 'text-xs mt-1'}>
                  {line.startsWith('•') ? (
                    <span className="block text-left pl-4">• {line.slice(1).trim()}</span>
                  ) : (
                    line
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded text-sm font-medium transition-colors mt-2"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'white'
              }}
            >
              重新加载页面
            </button>
          </div>
        ) : slides.length > 0 ? (
          <>
            <canvas
              ref={canvasRef}
              className="shadow-lg"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                backgroundColor: 'white'
              }}
            />

            {/* 导航按钮 */}
            {currentSlide > 0 && (
              <button
                onClick={() => goToSlide(currentSlide - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-colors hover:scale-110 shadow-lg"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)'
                }}
                title="上一张 (←)"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            {currentSlide < slides.length - 1 && (
              <button
                onClick={() => goToSlide(currentSlide + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-colors hover:scale-110 shadow-lg"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)'
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

      {/* 幻灯片导航 */}
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