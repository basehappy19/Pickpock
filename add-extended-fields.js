import fs from 'fs';

const enPath = './lib/locales/en.json';
const thPath = './lib/locales/th.json';

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const thData = JSON.parse(fs.readFileSync(thPath, 'utf8'));

enData.dashboard.extendedFields = {
  weight: "Weight (e.g., kg/g)",
  dimensions: "Dimensions (WxLxH)",
  warranty: "Warranty (years/months)",
  additionalDetails: "Additional Details",
  optional: "(Optional)",
  weightPlaceholder: "e.g., 1.5 kg",
  dimensionsPlaceholder: "e.g., 10x20x5 cm",
  warrantyPlaceholder: "e.g., 1 Year",
  additionalDetailsPlaceholder: "Enter any other product details..."
};

thData.dashboard.extendedFields = {
  weight: "น้ำหนัก (เช่น kg/g)",
  dimensions: "ขนาด (กว้างxยาวxสูง)",
  warranty: "การรับประกัน (ปี/เดือน)",
  additionalDetails: "รายละเอียดเพิ่มเติม",
  optional: "(เลือกได้)",
  weightPlaceholder: "เช่น 1.5 kg",
  dimensionsPlaceholder: "เช่น 10x20x5 cm",
  warrantyPlaceholder: "เช่น 1 ปี",
  additionalDetailsPlaceholder: "ระบุรายละเอียดอื่นๆ ของสินค้า..."
};

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
fs.writeFileSync(thPath, JSON.stringify(thData, null, 2), 'utf8');

console.log('Added extended fields translations.');
