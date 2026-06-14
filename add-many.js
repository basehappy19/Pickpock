import fs from 'fs';

const enPath = './lib/locales/en.json';
const thPath = './lib/locales/th.json';

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const thData = JSON.parse(fs.readFileSync(thPath, 'utf8'));

enData.categories = {
  'Electronics': 'Electronics',
  'Fashion': 'Fashion',
  'Home & Living': 'Home & Living',
  'Furniture': 'Furniture',
  'Beauty': 'Beauty',
  'Sports': 'Sports',
  'Food': 'Food',
  'Home': 'Home'
};

thData.categories = {
  'Electronics': 'อิเล็กทรอนิกส์',
  'Fashion': 'แฟชั่น',
  'Home & Living': 'บ้านและที่อยู่อาศัย',
  'Furniture': 'เฟอร์นิเจอร์',
  'Beauty': 'ความงาม',
  'Sports': 'กีฬา',
  'Food': 'อาหาร',
  'Home': 'บ้าน'
};

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
fs.writeFileSync(thPath, JSON.stringify(thData, null, 2), 'utf8');

console.log('Added categories to locales.');
