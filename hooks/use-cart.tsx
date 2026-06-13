"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Product, Coupon } from "@/types";
import { useRole } from "./use-role";
import { calculateCartDiscounts } from "@/utils/discounts";

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
  discountedTotal: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  discountSummary: {
    subtotal: number;
    tierDiscount: number;
    bulkDiscount: number;
    couponDiscount: number;
    totalDiscount: number;
    appliedDiscounts: string[];
  };
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, getUserDiscount } = useRole();
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
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
  const cartItems = items.map(item => ({
    productId: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity
  }));

  const discountSummary = calculateCartDiscounts(
    cartItems,
    user?.tier || 'MEMBER',
    appliedCoupon || undefined
  );

  const applyCoupon = (coupon: Coupon) => {
    setAppliedCoupon(coupon);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalCount,
      totalPrice: discountSummary.subtotal,
      discountedTotal: discountSummary.finalTotal,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      discountSummary,
      isLoading
    }}>
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
