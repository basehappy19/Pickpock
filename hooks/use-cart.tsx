"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Product } from "@/types";
import { useRole } from "./use-role";

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useRole();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialLoad = useRef(true);

  // Load cart data
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      if (user) {
        try {
          const res = await fetch(`/api/user-data/${user.id}`);
          if (res.ok) {
            const data = await res.json();
            setItems(data.cart || []);
          }
        } catch (e) {
          console.error("Failed to fetch cart from server", e);
        }
      } else {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          try {
            setItems(JSON.parse(savedCart));
          } catch (e) {
            console.error("Failed to parse cart from localStorage", e);
          }
        } else {
          setItems([]);
        }
      }
      setIsLoading(false);
      isInitialLoad.current = false;
    };

    loadCart();
  }, [user]);

  // Sync cart data to server or localStorage
  useEffect(() => {
    if (isInitialLoad.current) return;

    const syncCart = async () => {
      if (user) {
        try {
          await fetch(`/api/user-data/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cart: items })
          });
        } catch (e) {
          console.error("Failed to sync cart to server", e);
        }
      } else {
        localStorage.setItem("cart", JSON.stringify(items));
      }
    };

    const timeoutId = setTimeout(syncCart, 500); // Debounce sync
    return () => clearTimeout(timeoutId);
  }, [items, user]);

  const addToCart = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = async () => {
    setItems([]);
    if (user) {
      try {
        await fetch(`/api/user-data/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart: [] })
        });
      } catch (e) {
        console.error("Failed to clear cart on server", e);
      }
    } else {
      localStorage.setItem("cart", JSON.stringify([]));
    }
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, totalCount, totalPrice, isLoading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
