import fs from 'fs';

const [,, keyPath, enText, thText] = process.argv;

if (!keyPath || !enText || !thText) {
  console.error("Usage: node add-translation.js <keyPath> <enText> <thText>");
  process.exit(1);
}

function setValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

const enPath = './lib/locales/en.json';
const thPath = './lib/locales/th.json';

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const thData = JSON.parse(fs.readFileSync(thPath, 'utf8'));

setValue(enData, keyPath, enText);
setValue(thData, keyPath, thText);

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
fs.writeFileSync(thPath, JSON.stringify(thData, null, 2), 'utf8');

console.log(`Added ${keyPath}`);
