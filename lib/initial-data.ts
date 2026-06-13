import { Product, Order, Coupon } from "@/types";
import productsJson from "./products.json";
import ordersJson from "./ecommerce_orders.json";
import { ProductSchema, OrderSchema, CouponSchema } from "./schemas";

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

const DEFAULT_IMAGE = "https://placehold.co/600x600?text=Pickpock+Mall";

const sanitizeString = (value: any): string => {
  if (typeof value !== "string") return "";
  return value.trim().replace(/[<>]/g, "");
};

const sanitizeUrl = (url: any): string => {
  if (!url || typeof url !== "string") return DEFAULT_IMAGE;
  const sanitized = sanitizeString(url);
  if (!sanitized || sanitized === "null" || sanitized === "undefined") return DEFAULT_IMAGE;
  try {
    new URL(sanitized);
    return sanitized;
  } catch {
    return DEFAULT_IMAGE;
  }
};

const sanitizePrice = (price: any): number => {
  const num = Number(price);
  if (isNaN(num) || num < 0) return 0;
  return Math.min(num, 999999999);
};

const sanitizeRating = (rating: any): number => {
  const num = Number(rating);
  if (isNaN(num)) return 4.5;
  return Math.max(0, Math.min(5, num));
};

const sanitizeStock = (stock: any): number => {
  const num = Number(stock);
  if (isNaN(num)) return 0;
  return Math.max(0, Math.floor(num));
};

export const mapProduct = (p: RawProduct): Product => {
  const sanitized = {
    id: sanitizeString(p.id || p.product_id || `product-${Date.now()}-${Math.random()}`),
    name: sanitizeString(p.name || "Unnamed Product"),
    description: sanitizeString(p.description || `${p.name} - High-quality product curated for Pickpock Mall.`),
    fullDescription: sanitizeString(p.description || `${p.name} is a premium selection from Pickpock Mall. Designed for performance and style.`),
    price: sanitizePrice(p.price),
    category: sanitizeString(p.category || "General"),
    image: sanitizeUrl(p.image),
    rating: sanitizeRating(p.rating),
    reviews: Array.isArray(p.reviews) ? p.reviews : [],
    stock: sanitizeStock(p.stock),
    status: 'active' as const,
    createdAt: sanitizeString(p.createdAt) || new Date().toISOString(),
    storeName: "Pickpock Mall",
    isOfficial: Boolean(p.isOfficial),
    storeId: sanitizeString(p.storeId) || "mall",
    specs: typeof p.specs === "object" && p.specs !== null ? p.specs : { "Origin": "MSU Premium", "Material": "Grade A", "Warranty": "1 Year" }
  };

  const validated = ProductSchema.safeParse(sanitized);
  return validated.success ? validated.data : sanitized;
};

export const initialProducts: Product[] = (productsJson as RawProduct[]).map(mapProduct);

export const initialOrders: Order[] = (ordersJson as RawOrder[]).map((o) => {
  const sanitized = {
    id: sanitizeString(o.order_id || `order-${Date.now()}`),
    customerId: sanitizeString(o.user_id),
    customerName: `User ${sanitizeString(o.user_id)}`,
    totalAmount: sanitizePrice(o.total_price),
    status: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(o.status.toLowerCase())
      ? o.status.toLowerCase() as any
      : 'pending',
    createdAt: sanitizeString(o.timestamp) || new Date().toISOString(),
    paymentStatus: 'paid' as const,
    items: Array.isArray(o.items) ? o.items.map((item) => ({
      productId: sanitizeString(item.product_id),
      productName: `Product ${sanitizeString(item.product_id)}`,
      quantity: Math.max(1, Math.floor(Number(item.qty) || 1)),
      price: 0
    })) : [],
    reviewedItems: []
  };

  const validated = OrderSchema.safeParse(sanitized);
  return validated.success ? validated.data : sanitized;
});

export const initialCoupons: Coupon[] = [
  { code: "FOUNDER10", discount: 10, type: "percent" as const, description: "10% Off for Founders", minPurchase: 0 },
  { code: "MSU500", discount: 500, type: "fixed" as const, description: "฿500 Off MSU Special", minPurchase: 1000 },
  { code: "VIP20", discount: 20, type: "percent" as const, description: "VIP Exclusive 20% Off", minPurchase: 500, applicableTiers: ["VIP" as const] },
  { code: "NEWUSER", discount: 150, type: "fixed" as const, description: "New Customer Welcome", minPurchase: 300 },
].map(c => {
  const validated = CouponSchema.safeParse(c);
  return validated.success ? validated.data : c;
}) as Coupon[];
