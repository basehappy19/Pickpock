import fs from 'fs';

const enPath = './lib/locales/en.json';
const thPath = './lib/locales/th.json';

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const thData = JSON.parse(fs.readFileSync(thPath, 'utf8'));

enData.dashboard.founderInsights = {
  reasonIncrease: "High demand / Low stock",
  reasonDecrease: "Slow moving item",
  typing: "AI IS TYPING..."
};

thData.dashboard.founderInsights = {
  reasonIncrease: "ขายดี/สต็อกน้อย",
  reasonDecrease: "สินค้าเคลื่อนไหวช้า",
  typing: "AI กำลังพิมพ์..."
};

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
fs.writeFileSync(thPath, JSON.stringify(thData, null, 2), 'utf8');

console.log('Added founder insights translations.');
