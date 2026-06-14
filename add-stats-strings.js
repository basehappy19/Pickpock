import fs from 'fs';

const enPath = './lib/locales/en.json';
const thPath = './lib/locales/th.json';

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const thData = JSON.parse(fs.readFileSync(thPath, 'utf8'));

enData.dashboard.stats.globalRevenue = "Global Revenue";
enData.dashboard.stats.mallRevenue = "Mall Revenue";
enData.dashboard.vsPrevPeriod = "vs previous period";

thData.dashboard.stats.globalRevenue = "ยอดขายรวม";
thData.dashboard.stats.mallRevenue = "ยอดขายระบบ";
thData.dashboard.vsPrevPeriod = "เทียบกับช่วงก่อนหน้า";

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
fs.writeFileSync(thPath, JSON.stringify(thData, null, 2), 'utf8');

console.log('Added stat strings.');
