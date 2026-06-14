const fs = require('fs');
const path = require('path');

function replaceInDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!['node_modules', '.next', '.git'].includes(file)) {
        replaceInDirectory(fullPath);
      }
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('text-[10px]')) {
        content = content.replace(/text-\[10px\]/g, 'text-xs');
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

replaceInDirectory(path.join(__dirname, '..'));
console.log('Replaced all text-[10px] with text-xs');
