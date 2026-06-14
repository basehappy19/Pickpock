import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
  name: z.string().min(1, "Product name is required").max(500, "Product name too long"),
  description: z.string().transform((val) => val || "No description available"),
  fullDescription: z.string().optional(),
  price: z.number()
    .nonnegative("Price cannot be negative")
    .max(999999999, "Price exceeds maximum allowed")
    .default(0),
  category: z.string().min(1, "Category is required"),
  image: z.string().url("Invalid image URL").catch("https://placehold.co/600x600?text=No+Image"),
  rating: z.number().min(0).max(5).default(4.5),
  reviews: z.array(z.object({
    id: z.string(),
    user: z.string(),
    avatar: z.string().optional(),
    rating: z.number().min(0).max(5),
    comment: z.string(),
    date: z.string(),
    sentiment: z.enum(["positive", "negative", "neutral"]).optional(),
    productId: z.string().optional(),
  })).default([]),
  stock: z.number().int().nonnegative().default(0),
  status: z.enum(["active", "out_of_stock", "draft"]).default("active"),
  createdAt: z.string().default(() => new Date().toISOString()),
  specs: z.record(z.string(), z.any()).default({}),
  storeName: z.string().default("Pickpock Mall"),
  storeId: z.string().default("mall"),
  isOfficial: z.boolean().default(true),
});

export const OrderSchema = z.object({
  id: z.string().min(1, "Order ID is required"),
  customerId: z.string(),
  customerName: z.string().default("Guest Customer"),
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string().default("Unknown Product"),
    quantity: z.number().int().positive().default(1),
    price: z.number().nonnegative().default(0),
  })).default([]),
  totalAmount: z.number().nonnegative().default(0),
  originalAmount: z.number().nonnegative().optional(),
  discounts: z.object({
    tier: z.number().nonnegative().default(0),
    bulk: z.number().nonnegative().default(0),
    coupon: z.number().nonnegative().default(0),
    couponCode: z.string().nullable().default(null),
    total: z.number().nonnegative().default(0),
  }).optional(),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).default("pending"),
  createdAt: z.string().default(() => new Date().toISOString()),
  paymentStatus: z.enum(["paid", "unpaid"]).default("unpaid"),
  reviewedItems: z.array(z.string()).default([]),
});

export const CouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required").toUpperCase(),
  discount: z.number().nonnegative().max(100, "Discount percentage cannot exceed 100%"),
  type: z.enum(["percent", "fixed"]),
  description: z.string().min(1, "Description is required"),
  claimed: z.boolean().default(false),
  minPurchase: z.number().nonnegative().default(0),
  maxDiscount: z.number().nonnegative().optional(),
  expiresAt: z.string().optional(),
  applicableTiers: z.array(z.enum(["MEMBER", "VIP"])).optional(),
  applicableCategory: z.string().optional(),
  applicableRoles: z.array(z.enum(["customer", "founder", "partner"])).optional(),
  newMemberOnly: z.boolean().optional(),
});

export const StoreSchema = z.object({
  store_id: z.string(),
  name: z.string().min(1, "Store name is required"),
  owner_id: z.string(),
  description: z.string().transform((val) => val || "No description available"),
  status: z.enum(["active", "pending", "suspended"]).default("active"),
  rating: z.number().min(0).max(5).default(0),
  products: z.array(z.string()).default([]),
  joined_at: z.string().default(() => new Date().toISOString()),
  views: z.number().int().nonnegative().default(0),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["customer", "founder", "partner"]),
  tier: z.enum(["MEMBER", "VIP"]).default("MEMBER"),
  store: z.object({
    store_id: z.string(),
    name: z.string(),
    status: z.string(),
  }).nullable().default(null),
  vipExpiresAt: z.string().optional(),
  totalSpent: z.number().nonnegative().default(0),
  points: z.number().int().nonnegative().default(0),
});

export type ValidatedProduct = z.infer<typeof ProductSchema>;
export type ValidatedOrder = z.infer<typeof OrderSchema>;
export type ValidatedCoupon = z.infer<typeof CouponSchema>;
export type ValidatedStore = z.infer<typeof StoreSchema>;
export type ValidatedUser = z.infer<typeof UserSchema>;
