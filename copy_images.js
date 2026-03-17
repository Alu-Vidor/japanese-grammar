const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\danii\\.gemini\\antigravity\\brain\\9b128271-b4b8-4e61-af30-8d211d2286bc';
const destDir = path.join(__dirname, 'src', 'assets', 'lessons');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

let count = 0;
const files = fs.readdirSync(srcDir);
files.forEach(file => {
  if (file.endsWith('.png') && file.includes('_bg_')) {
    const newName = file.replace(/_\d+\.png$/, '.png');
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, newName));
    console.log(`Copied ${file} to ${newName}`);
    count++;
  }
});

console.log(`Total copied: ${count}`);
