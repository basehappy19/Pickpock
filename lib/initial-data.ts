import productsJson from "./products.json";
import ordersJson from "./ecommerce_orders.json";
import { Product, Order, Coupon } from "@/types";

// Source of truth directly from JSON files
export const initialProductsRaw = productsJson;
export const initialOrdersRaw = ordersJson;

// Helper to map JSON to App Product Type
export const mapProduct = (p: any): Product => ({
  id: p.product_id,
  name: p.name,
  description: p.name + " - High-quality product curated for MSU MALL.",
  fullDescription: p.name + " is a premium selection from our official mall. Designed for performance and style.",
  price: p.price,
  category: p.category,
  image: p.image,
  rating: parseFloat((4 + Math.random() * 0.9).toFixed(1)),
  reviews: [],
  stock: p.stock,
  status: 'active',
  createdAt: new Date().toISOString(),
  storeName: "MSU MALL Official",
  isOfficial: true,
  specs: { "Origin": "MSU Premium", "Material": "Grade A", "Warranty": "1 Year" }
});

// Initial products mapped for the application
export const initialProducts: Product[] = productsJson.map(mapProduct);

// Initial orders mapped for the application
export const initialOrders: Order[] = ordersJson.map((o: any) => ({
  id: o.order_id,
  customerId: o.user_id,
  customerName: "Customer " + o.user_id,
  totalAmount: o.total_price,
  status: o.status.toLowerCase() as any,
  createdAt: o.timestamp,
  paymentStatus: 'paid',
  items: o.items.map((item: any) => ({
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
