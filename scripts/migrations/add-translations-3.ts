import fs from 'fs';

const enPath = './lib/locales/en.json';
const thPath = './lib/locales/th.json';

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const thData = JSON.parse(fs.readFileSync(thPath, 'utf8'));

function setValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

const translations = [
  { key: 'products.left', en: "LEFT", th: "ชิ้น" },
  { key: 'products.out', en: "OUT", th: "หมด" },
  { key: 'products.copied', en: "Link copied to clipboard!", th: "คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว!" },
  { key: 'products.restrictedTitle', en: "Manager account restricted", th: "บัญชีผู้จัดการถูกจำกัดการซื้อ" },
  { key: 'products.restrictedDesc', en: "Founder and Partner accounts are not allowed to make purchases. Please use a regular member account.", th: "Founder และ Partner ไม่ได้รับอนุญาตให้สั่งซื้อสินค้า กรุณาใช้บัญชีสมาชิกทั่วไปเพื่อสั่งซื้อ" },
  { key: 'products.officialStore', en: "Official Store", th: "ร้านค้าทางการ" },
  { key: 'products.stockAlert1', en: "Only ", th: "เหลือเพียง " },
  { key: 'products.stockAlert2', en: " left in stock!", th: " ชิ้นในสต็อก!" },
  { key: 'products.outOfStock', en: "Out of Stock", th: "สินค้าหมด" },
  { key: 'products.defaultDesc', en: "Elevate your lifestyle with this premium product, designed for outstanding performance and style. Part of our AI curated collection.", th: "ยกระดับไลฟ์สไตล์ของคุณด้วยผลิตภัณฑ์พรีเมียมชิ้นนี้ ที่ออกแบบมาเพื่อประสิทธิภาพและสไตล์ที่โดดเด่น ส่วนหนึ่งของคอลเลกชันที่คัดสรรโดย AI ของเรา" },
  { key: 'products.shippingDetails', en: "Shipping", th: "การจัดส่ง" },
  { key: 'products.freeShipping', en: "Free Nationwide Shipping", th: "ส่งฟรีทั่วประเทศ" },
  { key: 'products.warrantyDetails', en: "Warranty", th: "การรับประกัน" },
  { key: 'products.oneYearWarranty', en: "1 Year Warranty", th: "รับประกัน 1 ปี" },
  { key: 'products.restrictedManager', en: "Restricted for Manager", th: "ถูกจำกัดสำหรับผู้จัดการ" },
  { key: 'products.addedToCart', en: "Added to Cart", th: "เพิ่มลงรถเข็นแล้ว" },
  { key: 'products.shareProduct', en: "Share this product", th: "แชร์สินค้านี้" },
  { key: 'products.inquiry', en: "Inquire", th: "สอบถามข้อมูล" },
  { key: 'products.tabsData.description', en: "Description", th: "รายละเอียด" },
  { key: 'products.tabsData.specs', en: "Specifications", th: "ข้อมูลทางเทคนิค" },
  { key: 'products.tabsData.reviews', en: "Reviews", th: "รีวิว" },
  { key: 'products.marketing.title1', en: "Ultimate ", th: "ที่สุดของ " },
  { key: 'products.marketing.title2', en: "Experience", th: "ประสบการณ์" },
  { key: 'products.marketing.desc', en: "This premium product is designed to provide the best experience for our customers. We focus on durability, beauty, and performance in every detail.", th: "สินค้าพรีเมียมในหมวดหมู่นี้ถูกออกแบบมาเพื่อให้ได้รับประสบการณ์ที่ดีที่สุดสำหรับลูกค้าของเรา เรามุ่งเน้นที่ความทนทาน ความสวยงาม และประสิทธิภาพในทุกรายละเอียด" },
  { key: 'products.marketing.feature1', en: "Premium Materials", th: "วัสดุคุณภาพเยี่ยม" },
  { key: 'products.marketing.feature2', en: "Eco-friendly Packaging", th: "บรรจุภัณฑ์ที่เป็นมิตรต่อสิ่งแวดล้อม" },
  { key: 'products.marketing.feature3', en: "User-centric Design", th: "การออกแบบที่เน้นผู้ใช้เป็นศูนย์กลาง" },
  { key: 'products.reviewDetails.total1', en: "From ", th: "จากทั้งหมด " },
  { key: 'products.reviewDetails.total2', en: " reviews", th: " รีวิว" },
  { key: 'products.reviewDetails.verified', en: "Verified Purchase • ", th: "ยืนยันการซื้อแล้ว • " },
  { key: 'products.reviewDetails.sentimentPrefix', en: "AI Sentiment: ", th: "ความรู้สึกโดย AI: " },
  { key: 'products.reviewDetails.positive', en: "Positive", th: "เชิงบวก" },
  { key: 'products.reviewDetails.negative', en: "Negative", th: "เชิงลบ" },
  { key: 'products.reviewDetails.neutral', en: "Neutral", th: "กลาง" },
  { key: 'products.reviewDetails.noReviews', en: "No reviews yet. Be the first to review this product!", th: "ยังไม่มีรีวิว ร่วมเป็นคนแรกที่รีวิวสินค้านี้!" },
  { key: 'products.storeData.fastReply', en: "Fast Reply", th: "ตอบกลับรวดเร็ว" },
  { key: 'products.storeData.visitStore', en: "Visit Store →", th: "เยี่ยมชมร้านค้า →" },
  { key: 'products.related.title1', en: "You may ", th: "สินค้าที่คุณ " },
  { key: 'products.related.title2', en: "also like", th: "อาจสนใจ" },
  { key: 'products.related.fromCategory', en: "From category ", th: "จากหมวดหมู่ " },
  { key: 'products.related.viewAll', en: "View All", th: "ดูทั้งหมด" }
];

for (const t of translations) {
  setValue(enData, t.key, t.en);
  setValue(thData, t.key, t.th);
}

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2), 'utf8');
fs.writeFileSync(thPath, JSON.stringify(thData, null, 2), 'utf8');

console.log('Added product info translations.');
