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
      
      let modified = false;
      
      // We do a temporary replacement to avoid double replacement
      // font-bold -> __FONT_SEMIBOLD__
      // font-black -> __FONT_BOLD__
      
      if (content.includes('font-bold')) {
        content = content.replace(/font-bold/g, '__FONT_SEMIBOLD__');
        modified = true;
      }
      
      if (content.includes('font-black')) {
        content = content.replace(/font-black/g, '__FONT_BOLD__');
        modified = true;
      }
      
      if (modified) {
        content = content.replace(/__FONT_SEMIBOLD__/g, 'font-medium'); // wait, let's make it font-medium
        content = content.replace(/__FONT_BOLD__/g, 'font-semibold');   // and font-semibold
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

replaceInDirectory(path.join(__dirname, '..'));
console.log('Reduced font weights successfully.');
