import { Product, Order } from "@/types";

export const mockProducts: Product[] = [
  {
    id: "p1",
    name: "AI Smart Watch Pro Gen 2",
    description: "นาฬิกาอัจฉริยะรุ่นเรือธง พร้อมระบบ AI วิเคราะห์สุขภาพเชิงลึก",
    fullDescription: "ยกระดับการดูแลสุขภาพของคุณด้วย AI Smart Watch Pro Gen 2 ที่มาพร้อมกับเซนเซอร์รุ่นใหม่ล่าสุด สามารถตรวจจับอัตราการเต้นของหัวใจ ความดันโลหิต และระดับออกซิเจนในเลือดได้อย่างแม่นยำ พร้อมระบบ AI ที่จะคอยให้คำแนะนำในการออกกำลังกายและพักผ่อนแบบส่วนตัว",
    price: 8900,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    stock: 45,
    rating: 4.9,
    status: 'active',
    createdAt: "2026-06-01T10:00:00Z",
    specs: { "Display": "1.9 inch AMOLED", "Battery": "Up to 14 days", "Water Resistance": "5ATM" },
    reviews: [
      { id: "r1", user: "Somchai", rating: 5, comment: "วัดค่าได้แม่นยำมากครับ AI ให้คำแนะนำดีจริงๆ", date: "2026-06-05", sentiment: 'positive' },
      { id: "r2", user: "Jane", rating: 4, comment: "ดีไซน์สวย แต่สายแอบแข็งไปนิดนึง", date: "2026-06-07", sentiment: 'neutral' }
    ]
  },
  {
    id: "p2",
    name: "Ultra-Noise Cancelling Headphones",
    description: "หูฟังตัดเสียงรบกวนอัจฉริยะ ปรับระดับตามสภาพแวดล้อม",
    fullDescription: "สัมผัสประสบการณ์การฟังเพลงที่บริสุทธิ์ที่สุดด้วยระบบ Adaptive Noise Cancelling ที่ใช้ AI ในการวิเคราะห์เสียงรอบข้างและปรับระดับการตัดเสียงรบกวนให้เหมาะสมโดยอัตโนมัติ ไม่ว่าคุณจะอยู่ในออฟฟิศที่วุ่นวายหรือบนเครื่องบิน",
    price: 12500,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    stock: 12,
    rating: 4.7,
    status: 'active',
    createdAt: "2026-06-02T08:30:00Z",
    specs: { "Driver": "40mm Dynamic", "Battery": "30 hours", "Charging": "USB-C" },
    reviews: [{ id: "r3", user: "Kovit", rating: 5, comment: "ตัดเสียงเงียบกริบ เสียงเบสแน่นสะใจ", date: "2026-06-08", sentiment: 'positive' }]
  },
  {
    id: "p3",
    name: "ErgoFounder Desk Chair",
    description: "เก้าอี้เพื่อสุขภาพสำหรับผู้บริหาร ออกแบบตามสรีรศาสตร์",
    fullDescription: "เก้าอี้ที่ถูกออกแบบมาเพื่อคนที่ต้องนั่งทำงานนานๆ โดยเฉพาะ ด้วยระบบ Dynamic Lumbar Support ที่จะปรับตามการเคลื่อนไหวของหลังคุณ ช่วยลดอาการปวดเมื่อยและเพิ่มประสิทธิภาพในการทำงาน",
    price: 15900,
    category: "Furniture",
    image: "https://images.unsplash.com/photo-1505744386214-51dba16a26fc?w=800&q=80",
    stock: 8,
    rating: 4.8,
    status: 'active',
    createdAt: "2026-05-25T14:20:00Z",
    specs: { "Material": "Breathable Mesh", "Base": "Aluminum Alloy", "Adjustment": "4D" },
    reviews: []
  },
  {
    id: "p4",
    name: "ZenGarden Desk Humidifier",
    description: "เครื่องพ่นไอน้ำเพิ่มความชื้น ดีไซน์มินิมอล ช่วยให้ผ่อนคลาย",
    fullDescription: "สร้างบรรยากาศที่เหมาะสมสำหรับการทำงานหรือการพักผ่อนด้วย ZenGarden Desk Humidifier ที่มาพร้อมกับระบบ Ultrasonic ทำงานเงียบสนิท พร้อมไฟ LED เปลี่ยนสีได้ 7 สี ช่วยเพิ่มความชื้นในอากาศและลดอาการผิวแห้ง",
    price: 1290,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1544101270-29fa5079f63c?w=800&q=80",
    stock: 100,
    rating: 4.5,
    status: 'active',
    createdAt: "2026-06-05T09:00:00Z",
    specs: { "Capacity": "500ml", "Run Time": "12 hours", "Power": "USB" },
    reviews: []
  },
  {
    id: "p5",
    name: "Minimalist Mechanical Keyboard",
    description: "คีย์บอร์ดแมคคานิคอลไร้สาย สัมผัสการพิมพ์ที่ยอดเยี่ยม",
    fullDescription: "ตอบโจทย์โปรแกรมเมอร์และนักเขียนด้วย Minimalist Mechanical Keyboard ขนาด 75% ที่ประหยัดพื้นที่โต๊ะทำงาน พร้อม Switch คุณภาพสูงที่ให้เสียงและสัมผัสที่เป็นเอกลักษณ์ เชื่อมต่อได้ทั้ง Bluetooth และ 2.4GHz",
    price: 4500,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80",
    stock: 20,
    rating: 4.9,
    status: 'active',
    createdAt: "2026-06-08T11:20:00Z",
    specs: { "Switches": "Hot-swappable Brown", "Battery": "4000mAh", "Layout": "75% ANSI" },
    reviews: []
  },
  {
    id: "p6",
    name: "Founder Leather Briefcase",
    description: "กระเป๋าหนังแท้ระดับพรีเมียม สำหรับผู้บริหารยุคใหม่",
    fullDescription: "สะท้อนความภูมิฐานในทุกการประชุมด้วยกระเป๋าหนัง Founder Briefcase ผลิตจากหนังวัวแท้ชั้นดี ออกแบบให้จุของได้เยอะแต่ยังคงความบางเฉียบ มีช่องใส่ Laptop บุด้วยวัสดุกันกระแทกอย่างดี",
    price: 7900,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    stock: 15,
    rating: 4.8,
    status: 'active',
    createdAt: "2026-05-20T16:45:00Z",
    specs: { "Material": "Top-grain Leather", "Fits": "up to 16 inch Laptop", "Warranty": "Lifetime" },
    reviews: []
  },
  {
    id: "p7",
    name: "Smart LED Studio Light",
    description: "ไฟสตูดิโออัจฉริยะ ปรับสีและระดับความสว่างผ่านแอป",
    fullDescription: "เพิ่มคุณภาพให้กับการประชุมออนไลน์หรือการทำ Content ด้วย Smart LED Studio Light ที่ให้แสงนุ่มนวล ไม่แสบตา ปรับค่าสี (CRI) ได้แม่นยำ และควบคุมทุกอย่างได้ง่ายๆ ผ่านสมาร์ทโฟน",
    price: 3200,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&q=80",
    stock: 30,
    rating: 4.6,
    status: 'active',
    createdAt: "2026-06-10T13:10:00Z",
    specs: { "Brightness": "2500 Lumens", "Color Temp": "2700K - 6500K", "CRI": ">95" },
    reviews: []
  },
  {
    id: "p8",
    name: "Nordic Ceramic Vase Set",
    description: "ชุดแจกันเซรามิกสไตล์นอร์ดิก ตกแต่งห้องให้ดูหรูหรา",
    fullDescription: "เปลี่ยนมุมเดิมๆ ให้ดูมีคลาสด้วยชุดแจกันเซรามิก 3 ชิ้น ที่มีรูปทรงและขนาดต่างกัน ผลิตด้วยกรรมวิธีแฮนด์เมด ให้ผิวสัมผัสที่เป็นธรรมชาติและโทนสีที่อบอุ่น เข้าได้กับทุกสไตล์การแต่งบ้าน",
    price: 2400,
    category: "Home & Living",
    image: "https://images.unsplash.com/photo-1578500484721-f39c764e9c6d?w=800&q=80",
    stock: 50,
    rating: 4.7,
    status: 'active',
    createdAt: "2026-06-01T08:00:00Z",
    specs: { "Material": "High-fired Ceramic", "Count": "3 pieces", "Finish": "Matte Sand" },
    reviews: []
  }
];

export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customerId: "c1",
    customerName: "สมชาย รักดี",
    totalAmount: 8900,
    status: 'delivered',
    createdAt: "2026-06-10T09:15:00Z",
    paymentStatus: 'paid',
    items: [{ productId: "p1", productName: "AI Smart Watch Pro Gen 2", quantity: 1, price: 8900 }]
  },
  {
    id: "ORD-002",
    customerId: "c2",
    customerName: "วิภาวิน แสงทอง",
    totalAmount: 25000,
    status: 'processing',
    createdAt: "2026-06-11T15:40:00Z",
    paymentStatus: 'paid',
    items: [{ productId: "p2", productName: "Ultra-Noise Cancelling Headphones", quantity: 2, price: 12500 }]
  }
];
