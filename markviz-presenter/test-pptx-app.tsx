import React from 'react';
import { createRoot } from 'react-dom/client';
import { PPTXViewer } from './components/PPTXViewer';

interface FileInfo {
    src: string;
    name: string;
}

function App() {
    const [file, setFile] = React.useState<FileInfo | null>(null);

    React.useEffect(() => {
        // 监听文件选择
        const fileInput = document.getElementById('pptxFile') as HTMLInputElement;
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const target = e.target as HTMLInputElement;
                const selectedFile = target.files?.[0];
                if (selectedFile && selectedFile.name.endsWith('.pptx')) {
                    setFile({
                        src: URL.createObjectURL(selectedFile),
                        name: selectedFile.name
                    });
                }
            });
        }

        // 自动触发文件选择
        (window as any).loadFile = () => {
            fileInput?.click();
        };
    }, []);

    return (
        <div>
            {file ? (
                <PPTXViewer src={file.src} name={file.name} />
            ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <p>请选择一个PPTX文件进行预览</p>
                </div>
            )}
        </div>
    );
}

// 渲染应用
const container = document.getElementById('previewArea');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
