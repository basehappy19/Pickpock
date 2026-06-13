import { Product, Order, Coupon } from "@/types";
import productsJson from "./products.json";
import ordersJson from "./ecommerce_orders.json";

interface RawProduct {
  id?: string;
  product_id?: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  rating?: number;
  reviews?: any[];
  stock: number;
  isOfficial?: boolean;
  storeId?: string;
  createdAt?: string;
  specs?: Record<string, any>;
}

interface RawOrder {
  order_id: string;
  user_id: string;
  total_price: number;
  status: string;
  timestamp: string;
  items: {
    product_id: string;
    qty: number;
  }[];
}

// Helper to map JSON to App Product Type
export const mapProduct = (p: RawProduct): Product => ({
  id: p.id || p.product_id || "",
  name: p.name,
  description: p.description || p.name + " - High-quality product curated for Pickpock Mall.",
  fullDescription: p.name + " is a premium selection from Pickpock Mall. Designed for performance and style.",
  price: p.price,
  category: p.category,
  image: p.image || "https://placehold.co/600x600?text=Pickpock+Mall",
  rating: parseFloat(Number(p.rating || 4.5).toFixed(1)),
  reviews: p.reviews || [],
  stock: p.stock,
  status: 'active',
  createdAt: p.createdAt || new Date().toISOString(),
  storeName: "Pickpock Mall",
  isOfficial: p.isOfficial || true,
  storeId: p.storeId || "mall",
  specs: p.specs || { "Origin": "MSU Premium", "Material": "Grade A", "Warranty": "1 Year" }
});

// Initial products mapped for the application
export const initialProducts: Product[] = (productsJson as RawProduct[]).map(mapProduct);

// Initial orders mapped for the application
export const initialOrders: Order[] = (ordersJson as RawOrder[]).map((o) => ({
  id: o.order_id,
  customerId: o.user_id,
  customerName: "User " + o.user_id,
  totalAmount: o.total_price,
  status: o.status.toLowerCase() as any,
  createdAt: o.timestamp,
  paymentStatus: 'paid',
  items: o.items.map((item) => ({
    productId: item.product_id,
    productName: "Product " + item.product_id,
    quantity: item.qty,
    price: 0
  })),
  reviewedItems: []
}));

export const initialCoupons: Coupon[] = [
  { code: "FOUNDER10", discount: 10, type: "percent", description: "10% Off for Founders" },
  { code: "MSU500", discount: 500, type: "fixed", description: "฿500 Off MSU Special" }
];
