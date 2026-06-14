const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../../lib/users.json');
const storesPath = path.join(__dirname, '../../lib/stores.json');
const productsPath = path.join(__dirname, '../../lib/products.json');

const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
const stores = JSON.parse(fs.readFileSync(storesPath, 'utf8'));
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

const generateId = (prefix) => prefix + '-' + Math.random().toString(36).substr(2, 9);

const newPartners = [
  {
    storeName: "ByteZone Gaming",
    email: "bytezone@example.com",
    category: "Electronics",
    desc: "ร้านจำหน่ายอุปกรณ์เกมมิ่งเกียร์คุณภาพสูง ตอบโจทย์ทุกไลฟ์สไตล์ของนักเรียนและเกมเมอร์ตัวจริง ในราคาสุดคุ้ม",
    items: [
      { name: "Pro Gaming Mouse", price: 1290, desc: "เมาส์เกมมิ่งเซ็นเซอร์แม่นยำสูง ปรับ DPI ได้ถึง 16000 พร้อมไฟ RGB", img: "https://images.unsplash.com/photo-1527814050087-37938154798c?w=800" },
      { name: "Mechanical Keyboard (Blue Switch)", price: 2190, desc: "คีย์บอร์ดแบบ Mechanical พิมพ์สนุก เล่นเกมมันส์ แสงไฟ RGB ปรับได้ 10 โหมด", img: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800" },
      { name: "7.1 Surround Headset", price: 1590, desc: "หูฟังเกมมิ่งระบบเสียง 7.1 รอบทิศทาง ได้ยินทุกฝีเท้า ไมค์ตัดเสียงรบกวน", img: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800" },
      { name: "Speed Edition Mousepad", price: 350, desc: "แผ่นรองเมาส์ขนาด XL เย็บขอบอย่างดี พื้นผิวเรียบเนียน ลากเมาส์ลื่นไม่มีสะดุด", img: "https://images.unsplash.com/photo-1621245025983-4ce432d0cbcc?w=800" },
      { name: "HD Streaming Webcam", price: 1890, desc: "กล้องเว็บแคมความละเอียด 1080p 60fps สำหรับสตรีมเมอร์และเรียนออนไลน์ ภาพคมชัด", img: "https://images.unsplash.com/photo-1587826315801-1311b747063c?w=800" }
    ]
  },
  {
    storeName: "SmartLife Gadget",
    email: "smartlife@example.com",
    category: "Electronics",
    desc: "คัดสรร Gadget และอุปกรณ์ไอทีอัจฉริยะ เพื่อยกระดับการใช้ชีวิตประจำวันของคุณให้สะดวกสบายยิ่งขึ้น",
    items: [
      { name: "Fast Charge Power Bank 20000mAh", price: 890, desc: "พาวเวอร์แบงค์ความจุสูง รองรับชาร์จไว 20W พกพาสะดวก นำขึ้นเครื่องได้", img: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800" },
      { name: "True Wireless Earbuds", price: 1490, desc: "หูฟังไร้สาย TWS เบสหนัก แบตเตอรี่อึดทน เชื่อมต่อเร็วด้วย Bluetooth 5.3", img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800" },
      { name: "Fitness Smart Watch", price: 2490, desc: "นาฬิกาสมาร์ทวอทช์ วัดชีพจร การนอนหลับ และโหมดออกกำลังกายกว่า 100 แบบ", img: "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800" },
      { name: "Adjustable Phone Stand", price: 250, desc: "แท่นวางมือถือและแท็บเล็ตอลูมิเนียม ปรับระดับได้ แข็งแรง ทนทาน", img: "https://images.unsplash.com/photo-1586521995568-39abaa0c2311?w=800" },
      { name: "GaN 65W Charger", price: 1190, desc: "หัวชาร์จเทคโนโลยี GaN ขนาดกะทัดรัด จ่ายไฟ 65W ชาร์จได้ทั้งมือถือและแล็ปท็อป", img: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800" }
    ]
  },
  {
    storeName: "Campus Essentials",
    email: "campus@example.com",
    category: "Stationery",
    desc: "ศูนย์รวมของใช้จำเป็นสำหรับนักเรียนและนักศึกษา ดีไซน์สวย ใช้งานได้จริง ในราคาที่เป็นมิตร",
    items: [
      { name: "Minimalist Backpack", price: 790, desc: "กระเป๋าเป้สไตล์มินิมอล มีช่องใส่แล็ปท็อป 15 นิ้ว กันน้ำ จุของได้เยอะ", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800" },
      { name: "Thermal Water Bottle 500ml", price: 450, desc: "กระบอกน้ำเก็บอุณหภูมิ ร้อน-เย็น ได้นาน 12 ชั่วโมง วัสดุสแตนเลส 304 ปลอดภัย", img: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800" },
      { name: "Eye-Care Desk Lamp", price: 650, desc: "โคมไฟอ่านหนังสือถนอมสายตา แสงไฟ LED ปรับความสว่างได้ 3 ระดับ ไม่กระพริบ", img: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800" },
      { name: "Premium Gel Pen Set (12 Colors)", price: 290, desc: "เซ็ตปากกาเจล 12 สีสันสดใส เขียนลื่น แห้งไว เหมาะสำหรับการจดเลคเชอร์และทำสรุป", img: "https://images.unsplash.com/photo-1585336261022-680e284a81fd?w=800" },
      { name: "Desk Organizer Box", price: 350, desc: "กล่องจัดระเบียบโต๊ะเรียน มีช่องแบ่งหลายขนาด ช่วยให้การทำงานและเรียนเป็นระเบียบขึ้น", img: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800" }
    ]
  },
  {
    storeName: "Cozy Living",
    email: "cozy@example.com",
    category: "Home & Garden",
    desc: "ตกแต่งพื้นที่ส่วนตัวของคุณให้อบอุ่นและน่าอยู่ยิ่งขึ้น ด้วยของแต่งห้องสไตล์โคซี่ ดีไซน์ทันสมัย",
    items: [
      { name: "Nordic Floor Lamp", price: 1590, desc: "โคมไฟตั้งพื้นสไตล์นอร์ดิก ดีไซน์เรียบหรู สร้างบรรยากาศอบอุ่นให้กับห้องของคุณ", img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800" },
      { name: "Stackable Storage Box", price: 390, desc: "กล่องเก็บของพลาสติกหนา ซ้อนได้หลายชั้น ช่วยประหยัดพื้นที่และจัดระเบียบห้อง", img: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800" },
      { name: "Ergonomic Memory Foam Pillow", price: 890, desc: "หมอนเมมโมรี่โฟม ออกแบบตามหลักสรีรศาสตร์ รองรับต้นคอ ลดอาการปวดเมื่อย", img: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=800" },
      { name: "Foldable Wood Desk", price: 1290, desc: "โต๊ะทำงานไม้พับเก็บได้ ประหยัดพื้นที่ กางใช้งานง่าย แข็งแรงรับน้ำหนักได้ดี", img: "https://images.unsplash.com/photo-1592085817812-421711e74fbb?w=800" },
      { name: "Bohemian Wall Tapestry", price: 450, desc: "ผ้าแขวนผนังตกแต่งห้องสไตล์โบฮีเมียน ลวดลายสวยงาม เปลี่ยนห้องธรรมดาให้มีสไตล์", img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800" }
    ]
  }
];

newPartners.forEach(partner => {
  const userId = generateId('u');
  const storeId = generateId('s');

  users.push({
    id: userId,
    name: partner.storeName + " Owner",
    email: partner.email,
    password: "1234",
    role: "partner",
    isVip: false
  });

  const productIds = [];

  partner.items.forEach(item => {
    const pId = generateId('p');
    productIds.push(pId);
    products.push({
      id: pId,
      name: item.name,
      price: item.price,
      category: partner.category,
      stock: 100,
      image: item.img,
      description: item.desc,
      rating: 5,
      reviews: [],
      storeId: storeId,
      isOfficial: false,
      createdAt: new Date().toISOString()
    });
  });

  stores.push({
    store_id: storeId,
    name: partner.storeName,
    owner_id: userId,
    description: partner.desc,
    status: "active",
    rating: 5,
    products: productIds,
    joined_at: new Date().toISOString(),
    views: 0
  });
});

fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
fs.writeFileSync(storesPath, JSON.stringify(stores, null, 2));
fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));

console.log("Successfully added 4 partners and their products!");
