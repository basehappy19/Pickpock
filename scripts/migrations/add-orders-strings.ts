import fs from 'fs';

const enPath = './lib/locales/en.json';
const thPath = './lib/locales/th.json';

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const thData = JSON.parse(fs.readFileSync(thPath, 'utf8'));

enData.orders.founderSubtitle = "Monitor every transaction across the platform.";
enData.orders.partnerSubtitle = "Manage orders for {storeName}.";

thData.orders.founderSubtitle = "ติดตามทุกธุรกรรมบนแพลตฟอร์ม";
thData.orders.partnerSubtitle = "จัดการคำสั่งซื้อสำหรับ {storeName}";

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
fs.writeFileSync(thPath, JSON.stringify(thData, null, 2), 'utf8');

console.log('Added order subtitles strings.');
