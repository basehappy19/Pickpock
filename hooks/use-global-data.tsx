"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, Order, Coupon } from "@/types";
import { initialProducts, initialOrders, initialCoupons } from "@/lib/initial-data";

interface DataContextType {
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  setProducts: (products: Product[]) => void;
  setOrders: (orders: Order[]) => void;
  updateProduct: (product: Product) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addOrder: (order: Order) => void;
  purchaseItems: (items: { productId: string, quantity: number }[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProductsState] = useState<Product[]>([]);
  const [orders, setOrdersState] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);

  const fetchData = async () => {
    try {
      const prodRes = await fetch("/api/products");
      const ordRes = await fetch("/api/orders");
      
      let currentProds: any[] = [];

      if (prodRes.ok) {
        const rawProds = await prodRes.json();
        // Map JSON back to App Type
        const mappedProds = rawProds.map((p: any) => ({
          id: p.product_id || p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          stock: p.stock,
          image: p.image,
          description: p.description,
          rating: p.rating || 0,
          reviews: Array.isArray(p.reviews) ? p.reviews : [],
          storeId: p.storeId,
          isOfficial: p.isOfficial || false,
          createdAt: p.createdAt || new Date().toISOString()
        }));
        currentProds = rawProds; // Keep raw for join
        setProductsState(mappedProds);
      }

      if (ordRes.ok) {
        const rawOrds = await ordRes.json();
        const mappedOrds = rawOrds.map((o: any) => ({
          id: o.order_id,
          customerId: o.user_id,
          customerName: "User " + o.user_id,
          totalAmount: o.total_price,
          status: o.status.toLowerCase(),
          createdAt: o.timestamp,
          paymentStatus: 'paid',
          reviewedItems: o.reviewed_items || [], // Consistent naming for frontend
          items: (o.items || []).map((item: any) => {
            // Standardize item fields from JSON
            const pId = item.productId || item.product_id;
            const product = currentProds.find((p: any) => (p.product_id || p.id) === pId);

            return {
              productId: pId,
              productName: item.productName || product?.name || "Premium Product",
              quantity: item.quantity || item.qty || 1,
              price: item.price || product?.price || 0
            };
          })
        }));
        setOrdersState(mappedOrds);
      }

    } catch (e) {
      console.error("Failed to fetch data from API, using initial-data", e);
      setProductsState(initialProducts);
      setOrdersState(initialOrders);
    }
  };

  // Initialize data from API
  useEffect(() => {
    fetchData();
  }, []);

  const addProduct = async (p: Product) => {
    setProductsState([p, ...products]);
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p)
    });
  };

  const updateProduct = async (p: Product) => {
    setProductsState(products.map(item => item.id === p.id ? p : item));
    await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p)
    });
  };

  const deleteProduct = async (id: string) => {
    setProductsState(products.filter(p => p.id !== id));
    await fetch(`/api/products?id=${id}`, { method: "DELETE" });
  };

  const addOrder = async (o: Order) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(o)
      });
      if (res.ok) {
        await fetchData(); // Force re-fetch to get accurate state from JSON
      }
    } catch (e) {
      console.error("Failed to add order", e);
    }
  };

  const purchaseItems = async (boughtItems: { productId: string, quantity: number }[]) => {
    const updatedProducts = [...products];
    
    for (const item of boughtItems) {
      const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
      if (productIndex !== -1) {
        const product = updatedProducts[productIndex];
        const newStock = Math.max(0, product.stock - item.quantity);
        const updatedProduct = { ...product, stock: newStock };
        
        try {
          await fetch("/api/products", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedProduct)
          });
        } catch (e) {
          console.error(`Failed to sync stock for product ${item.productId}`, e);
        }
      }
    }
    
    await fetchData(); // Force re-fetch to ensure all users see new stock levels
  };

  return (
    <DataContext.Provider value={{ 
      products, orders, coupons, 
      setProducts: setProductsState, 
      setOrders: setOrdersState, 
      addProduct, updateProduct, deleteProduct, addOrder,
      purchaseItems
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useGlobalData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useGlobalData must be used within a DataProvider");
  }
  return context;
}
