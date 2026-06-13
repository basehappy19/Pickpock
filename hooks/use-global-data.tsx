"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, Order, Coupon } from "@/types";
import { mockProducts, mockOrders, mockCoupons } from "@/lib/mock-data";

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
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);

  // Initialize data from localStorage or mock
  useEffect(() => {
    const savedProducts = localStorage.getItem("global_products");
    const savedOrders = localStorage.getItem("global_orders");

    if (savedProducts) setProductsState(JSON.parse(savedProducts));
    else {
      setProductsState(mockProducts);
      localStorage.setItem("global_products", JSON.stringify(mockProducts));
    }

    if (savedOrders) setOrdersState(JSON.parse(savedOrders));
    else {
      setOrdersState(mockOrders);
      localStorage.setItem("global_orders", JSON.stringify(mockOrders));
    }
  }, []);

  // Persist changes
  const setProducts = (prods: Product[]) => {
    setProductsState(prods);
    localStorage.setItem("global_products", JSON.stringify(prods));
  };

  const setOrders = (ords: Order[]) => {
    setOrdersState(ords);
    localStorage.setItem("global_orders", JSON.stringify(ords));
  };

  const addProduct = (p: Product) => {
    const newProds = [p, ...products];
    setProducts(newProds);
  };

  const updateProduct = (p: Product) => {
    const newProds = products.map(item => item.id === p.id ? p : item);
    setProducts(newProds);
  };

  const deleteProduct = (id: string) => {
    const newProds = products.filter(p => p.id !== id);
    setProducts(newProds);
  };

  const addOrder = (o: Order) => {
    const newOrders = [o, ...orders];
    setOrders(newOrders);
  };

  const purchaseItems = (boughtItems: { productId: string, quantity: number }[]) => {
    const newProds = products.map(p => {
      const item = boughtItems.find(i => i.productId === p.id);
      if (item) {
        return { ...p, stock: Math.max(0, p.stock - item.quantity) };
      }
      return p;
    });
    setProducts(newProds);
  };

  return (
    <DataContext.Provider value={{ 
      products, orders, coupons, 
      setProducts, setOrders, 
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
