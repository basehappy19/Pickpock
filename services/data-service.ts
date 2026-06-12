import { Product } from "@/types";
import { mockProducts } from "@/lib/mock-data";

// This service runs ONLY on the server for initial SSR
export const dataService = {
  async getProducts(): Promise<Product[]> {
    // Simulate API delay/fetch
    // In the actual hackathon, this will read the JSON file using 'fs' or fetch from a local API
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockProducts), 50); // Small delay to simulate fetch
    });
  },

  async getProductById(id: string): Promise<Product | undefined> {
    const products = await this.getProducts();
    return products.find((p) => p.id === id);
  }
};
