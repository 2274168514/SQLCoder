const fs = require('fs');
const path = require('path');

console.log('Starting build process...');

// 创建dist目录
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
  console.log('Created dist directory');
}

// 复制public目录到dist
function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 如果public目录存在，复制它
if (fs.existsSync('public')) {
  copyRecursive('public', 'dist');
  console.log('Copied public directory to dist');
} else {
  console.log('Warning: public directory not found');
}

console.log('✅ Build completed successfully!');
console.log('📁 Output directory: dist');