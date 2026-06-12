export interface Product {
  id: string | number;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  rating?: number;
  reviews?: Review[];
  stock: number;
  createdAt: string;
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface FilterOptions {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'newest';
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}
