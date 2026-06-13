import { Product, Order } from "@/types";
import { initialProducts, initialOrders } from "@/lib/initial-data";

// This service runs ONLY on the server for initial SSR
export const dataService = {
  async getProducts(): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(initialProducts), 20);
    });
  },

  async getProductById(id: string): Promise<Product | undefined> {
    const products = await this.getProducts();
    return products.find((p) => p.id === id);
  },

  async getOrders(): Promise<Order[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(initialOrders), 20);
    });
  },

  async getStats() {
    const products = await this.getProducts();
    const orders = await this.getOrders();
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    return {
      totalRevenue,
      totalOrders: orders.length,
      totalProducts: products.length,
      avgRating: 4.8 // Mock avg
    };
  }
};
