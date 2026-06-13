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

export interface FilterOptions {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'newest';
}

export interface Coupon {
  code: string;
  discount: number;
  type: 'percent' | 'fixed';
  description: string;
  claimed?: boolean;
}
