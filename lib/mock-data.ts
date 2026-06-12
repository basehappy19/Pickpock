import { Product } from "@/types";

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "AI Smart Watch Pro",
    description: "นาฬิกาอัจฉริยะพร้อมระบบวิเคราะห์สุขภาพด้วย AI",
    price: 5900,
    category: "Electronics",
    stock: 25,
    rating: 4.8,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Wireless Headphones",
    description: "หูฟังไร้สายระบบตัดเสียงรบกวนอัจฉริยะ",
    price: 3200,
    category: "Electronics",
    stock: 15,
    rating: 4.5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Ergonomic Chair",
    description: "เก้าอี้เพื่อสุขภาพ นั่งสบายตลอดทั้งวัน",
    price: 8500,
    category: "Furniture",
    stock: 10,
    rating: 4.9,
    createdAt: new Date().toISOString(),
  }
];
