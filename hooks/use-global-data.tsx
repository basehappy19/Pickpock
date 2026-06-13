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

  // Initialize data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await fetch("/api/products");
        const ordRes = await fetch("/api/orders");
        
        if (prodRes.ok) {
          const rawProds = await prodRes.json();
          // Map JSON back to App Type
          const mappedProds = rawProds.map((p: any) => ({
            id: p.product_id,
            name: p.name,
            category: p.category,
            price: p.price,
            stock: p.stock,
            image: p.image,
            rating: 4.5,
            reviews: [],
            status: 'active',
            createdAt: new Date().toISOString(),
            storeName: "MSU MALL Official",
            isOfficial: true,
          }));
          setProductsState(mappedProds);
        }

        if (ordRes.ok) {
          const rawOrds = await ordRes.json();
          const mappedOrds = rawOrds.map((o: any) => ({
            id: o.order_id,
            customerId: o.user_id,
            customerName: "Customer " + o.user_id,
            totalAmount: o.total_price,
            status: o.status.toLowerCase(),
            createdAt: o.timestamp,
            paymentStatus: 'paid',
            items: []
          }));
          setOrdersState(mappedOrds);
        }
      } catch (e) {
        console.error("Failed to fetch data from API, using initial-data", e);
        setProductsState(initialProducts);
        setOrdersState(initialOrders);
      }
    };

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
    setOrdersState([o, ...orders]);
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(o)
    });
  };

  const purchaseItems = (boughtItems: { productId: string, quantity: number }[]) => {
    const newProds = products.map(p => {
      const item = boughtItems.find(i => i.productId === p.id);
      if (item) {
        const updated = { ...p, stock: Math.max(0, p.stock - item.quantity) };
        updateProduct(updated);
        return updated;
      }
      return p;
    });
    setProductsState(newProds);
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
