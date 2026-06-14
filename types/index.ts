export interface Product {
  id: string;
  name: string;
  description: string;
  fullDescription?: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  reviews: Review[];
  stock: number;
  status: 'active' | 'out_of_stock' | 'draft';
  createdAt: string;
  specs?: Record<string, string>;
  storeName?: string;
  storeId?: string;
  isOfficial?: boolean;
  weight?: string;
  dimensions?: string;
  warranty?: string;
  additionalDetails?: string;
  aiPriceAdjusted?: boolean;
}

export interface Review {
  id: string;
  user: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  productId?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  originalAmount?: number;
  discounts?: {
    tier: number;
    bulk: number;
    coupon: number;
    couponCode?: string | null;
    total: number;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  paymentStatus: 'paid' | 'unpaid';
  reviewedItems?: string[]; // IDs of products already reviewed
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Store {
  store_id: string;
  name: string;
  owner_id: string;
  description: string;
  status: string;
  rating: number;
  products?: string[];
  joined_at?: string;
  views?: number;
  image?: string;
}

export interface FilterOptions {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'newest';
  isOfficial?: boolean;
  isPartner?: boolean;
  storeId?: string;
}

export interface Coupon {
  code: string;
  discount: number;
  type: 'percent' | 'fixed';
  description: string;
  claimed?: boolean;
  minPurchase?: number;
  maxDiscount?: number;
  expiresAt?: string;
  applicableTiers?: Tier[];
  applicableCategory?: string;
  applicableRoles?: Role[];
  newMemberOnly?: boolean;
}

export type Tier = 'MEMBER' | 'VIP';
export type Role = 'customer' | 'founder' | 'partner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  tier: Tier;
  store?: {
    store_id: string;
    name: string;
    status: string;
  } | null;
  vipExpiresAt?: string;
  totalSpent?: number;
  points?: number;
}

export interface DiscountRule {
  id: string;
  name: string;
  type: 'tier_discount' | 'bulk_discount' | 'flash_sale' | 'coupon';
  tier?: Tier;
  minQuantity?: number;
  discountPercent: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  productIds?: string[];
  categoryIds?: string[];
}
