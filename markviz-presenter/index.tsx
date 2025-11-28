import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 忽略来自 Office Online iframe 和浏览器扩展的无关错误
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args[0]?.toString() || '';
  // 忽略的错误模式
  const ignoredPatterns = [
    'runtime.lastError',
    'message port closed',
    'Receiving end does not exist',
    'message channel closed',
    'ViewPreview is not defined',
    'appChrome is not defined',
    'Immersive Translate',
    'Permission Policy',
    'ResizeObserver loop',
  ];
  
  if (ignoredPatterns.some(pattern => message.includes(pattern))) {
    return; // 静默忽略
  }
  originalConsoleError.apply(console, args);
};

// 忽略未捕获的 Promise 错误（来自扩展）
window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.message || event.reason?.toString() || '';
  const ignoredPatterns = [
    'message port closed',
    'Receiving end does not exist',
    'message channel closed',
  ];
  
  if (ignoredPatterns.some(pattern => message.includes(pattern))) {
    event.preventDefault(); // 阻止错误显示
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
