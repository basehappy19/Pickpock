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
    specs: {
      "Display": "1.9 inch AMOLED",
      "Battery": "Up to 14 days",
      "Water Resistance": "5ATM",
      "Connectivity": "Bluetooth 5.3, WiFi"
    },
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
    specs: {
      "Driver": "40mm Dynamic",
      "Battery": "30 hours (ANC on)",
      "Charging": "USB-C Fast Charge",
      "Weight": "250g"
    },
    reviews: [
      { id: "r3", user: "Kovit", rating: 5, comment: "ตัดเสียงเงียบกริบ เสียงเบสแน่นสะใจ", date: "2026-06-08", sentiment: 'positive' }
    ]
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
    specs: {
      "Material": "Breathable Mesh",
      "Base": "Aluminum Alloy",
      "Adjustment": "4D Armrests, Seat Depth",
      "Max Weight": "150kg"
    },
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
