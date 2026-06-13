/**
 * Analytics Service - KPI calculations and statistics
 * Handles all data analysis for Founder and Partner dashboards
 */

import { Product, Order } from '@/types';

// Type definitions
export interface KPIMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  averageOrderValue: number;
  conversionRate: number;
  customerRetention: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

export interface StorePerformance {
  storeId: string;
  storeName: string;
  revenue: number;
  orders: number;
  avgRating: number;
  topProducts: string[];
  growthRate: number;
}

export interface ProductAnalytics {
  productId: string;
  productName: string;
  totalSold: number;
  revenue: number;
  views: number;
  conversionRate: number;
  avgRating: number;
  stockStatus: 'healthy' | 'low' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

/**
 * Calculate overall KPI metrics for Founder dashboard
 */
export function calculateFounderKPIs(
  orders: Order[],
  products: Product[],
  users: any[]
): KPIMetrics {
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalUsers = users.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const conversionRate = totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0;

  // Calculate retention (simplified - users who made more than 1 order)
  const userOrderCount = new Map<string, number>();
  orders.forEach(o => {
    userOrderCount.set(o.customerId, (userOrderCount.get(o.customerId) || 0) + 1);
  });
  const returningUsers = Array.from(userOrderCount.values()).filter(count => count > 1).length;
  const customerRetention = totalUsers > 0 ? (returningUsers / totalUsers) * 100 : 0;

  return {
    totalRevenue,
    totalOrders,
    totalProducts,
    totalUsers,
    averageOrderValue,
    conversionRate,
    customerRetention
  };
}

/**
 * Calculate store-specific KPIs for Partner dashboard
 */
export function calculatePartnerKPIs(
  storeId: string,
  orders: Order[],
  products: Product[]
): KPIMetrics {
  const storeProducts = products.filter(p => p.storeId === storeId);
  const storeProductIds = new Set(storeProducts.map(p => p.id));

  const storeOrders = orders.filter(o =>
    o.items.some(item => storeProductIds.has(item.productId))
  );

  const totalRevenue = storeOrders.reduce((sum, o) => {
    const orderStoreRevenue = o.items.reduce((itemSum, item) => {
      return storeProductIds.has(item.productId) ? itemSum + (item.price * item.quantity) : itemSum;
    }, 0);
    return sum + orderStoreRevenue;
  }, 0);

  const totalProducts = storeProducts.length;
  const totalOrders = storeOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Get unique customers
  const uniqueCustomers = new Set(storeOrders.map(o => o.customerId)).size;
  const conversionRate = uniqueCustomers > 0 ? (totalOrders / uniqueCustomers) * 100 : 0;

  return {
    totalRevenue,
    totalOrders,
    totalProducts,
    totalUsers: uniqueCustomers,
    averageOrderValue,
    conversionRate,
    customerRetention: 0 // Partner doesn't see this
  };
}

/**
 * Generate time-series data for revenue chart
 */
export function generateRevenueChartData(
  orders: Order[],
  period: 'daily' | 'weekly' | 'monthly' = 'daily'
): ChartDataPoint[] {
  const now = new Date();
  const data: ChartDataPoint[] = [];

  const periods = period === 'daily' ? 7 : period === 'weekly' ? 4 : 12;
  const periodMs = period === 'daily' ? 86400000 : period === 'weekly' ? 604800000 : 2592000000;

  for (let i = periods - 1; i >= 0; i--) {
    const endDate = new Date(now.getTime() - (i * periodMs));
    const startDate = new Date(endDate.getTime() - periodMs);

    const periodOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= startDate && orderDate < endDate;
    });

    const revenue = periodOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    data.push({
      label: period === 'daily'
        ? endDate.toLocaleDateString('th-TH', { weekday: 'short' })
        : period === 'weekly'
        ? `Week ${periods - i}`
        : endDate.toLocaleDateString('th-TH', { month: 'short' }),
      value: revenue,
      date: endDate.toISOString()
    });
  }

  return data;
}

/**
 * Generate category distribution data
 */
export function generateCategoryDistribution(products: Product[]): Array<{ category: string; count: number; percentage: number }> {
  const categoryCount = new Map<string, number>();
  products.forEach(p => {
    categoryCount.set(p.category, (categoryCount.get(p.category) || 0) + 1);
  });

  const total = products.length;
  return Array.from(categoryCount.entries()).map(([category, count]) => ({
    category,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0
  })).sort((a, b) => b.count - a.count);
}

/**
 * Calculate store performance ranking
 */
export function calculateStorePerformance(
  orders: Order[],
  products: Product[],
  stores: any[]
): StorePerformance[] {
  return stores.map(store => {
    const storeProducts = products.filter(p => p.storeId === store.store_id);
    const storeProductIds = new Set(storeProducts.map(p => p.id));

    const storeOrders = orders.filter(o =>
      o.items.some(item => storeProductIds.has(item.productId))
    );

    const revenue = storeOrders.reduce((sum, o) => {
      return sum + o.items.reduce((itemSum, item) => {
        return storeProductIds.has(item.productId) ? itemSum + (item.price * item.quantity) : itemSum;
      }, 0);
    }, 0);

    // Top products by revenue
    const productRevenue = new Map<string, number>();
    storeOrders.forEach(o => {
      o.items.forEach(item => {
        if (storeProductIds.has(item.productId)) {
          productRevenue.set(
            item.productId,
            (productRevenue.get(item.productId) || 0) + (item.price * item.quantity)
          );
        }
      });
    });

    const topProducts = Array.from(productRevenue.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => storeProducts.find(p => p.id === id)?.name || 'Unknown');

    return {
      storeId: store.store_id,
      storeName: store.name,
      revenue,
      orders: storeOrders.length,
      avgRating: store.rating || 0,
      topProducts,
      growthRate: Math.random() * 20 - 5 // Placeholder - would need historical data
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

/**
 * Calculate individual product analytics
 */
export function calculateProductAnalytics(
  productId: string,
  orders: Order[],
  products: Product[]
): ProductAnalytics {
  const product = products.find(p => p.id === productId);
  if (!product) {
    throw new Error('Product not found');
  }

  let totalSold = 0;
  let revenue = 0;

  orders.forEach(o => {
    o.items.forEach(item => {
      if (item.productId === productId) {
        totalSold += item.quantity;
        revenue += item.price * item.quantity;
      }
    });
  });

  // Calculate conversion rate (simplified - orders with this product / total views)
  // In real implementation, would track views separately
  const views = Math.floor(Math.random() * 1000) + 100; // Placeholder
  const conversionRate = views > 0 ? (totalSold / views) * 100 : 0;

  // Stock status
  const stockStatus: 'healthy' | 'low' | 'critical' =
    product.stock > 20 ? 'healthy' : product.stock > 5 ? 'low' : 'critical';

  // Trend (would need historical data)
  const trend: 'up' | 'down' | 'stable' = 'stable';

  return {
    productId,
    productName: product.name,
    totalSold,
    revenue,
    views,
    conversionRate,
    avgRating: product.rating,
    stockStatus,
    trend
  };
}

/**
 * Get low stock alerts
 */
export function getLowStockProducts(products: Product[], threshold: number = 10): Product[] {
  return products
    .filter(p => p.stock <= threshold)
    .sort((a, b) => a.stock - b.stock);
}

/**
 * Calculate revenue share between Official and Partner stores
 */
export function calculateRevenueShare(orders: Order[], products: Product[]): {
  officialRevenue: number;
  partnerRevenue: number;
  officialPercentage: number;
  partnerPercentage: number;
} {
  const officialProductIds = new Set(
    products.filter(p => p.isOfficial || p.storeId === 'mall').map(p => p.id)
  );

  let officialRevenue = 0;
  let partnerRevenue = 0;

  orders.forEach(o => {
    o.items.forEach(item => {
      if (officialProductIds.has(item.productId)) {
        officialRevenue += item.price * item.quantity;
      } else {
        partnerRevenue += item.price * item.quantity;
      }
    });
  });

  const total = officialRevenue + partnerRevenue;
  const officialPercentage = total > 0 ? (officialRevenue / total) * 100 : 0;
  const partnerPercentage = total > 0 ? (partnerRevenue / total) * 100 : 0;

  return {
    officialRevenue,
    partnerRevenue,
    officialPercentage,
    partnerPercentage
  };
}
