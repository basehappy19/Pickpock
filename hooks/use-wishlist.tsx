"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { Product } from "@/types";
import { useRole } from "./use-role";

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  moveToCart: (productId: string) => void;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useRole();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialLoad = useRef(true);

  // Load wishlist data
  useEffect(() => {
    const loadWishlist = async () => {
      setIsLoading(true);
      if (user) {
        try {
          const res = await fetch(`/api/user-data/${user.id}`);
          if (res.ok) {
            const data = await res.json();
            setWishlist(data.wishlist || []);
          }
        } catch (e) {
          console.error("Failed to fetch wishlist from server", e);
        }
      } else {
        const saved = localStorage.getItem("wishlist");
        if (saved) {
          try {
            setWishlist(JSON.parse(saved));
          } catch (e) {
            console.error("Failed to parse wishlist from localStorage", e);
          }
        } else {
          setWishlist([]);
        }
      }
      setIsLoading(false);
      isInitialLoad.current = false;
    };

    loadWishlist();
  }, [user]);

  // Sync wishlist data to server or localStorage
  useEffect(() => {
    if (isInitialLoad.current) return;

    const syncWishlist = async () => {
      if (user) {
        try {
          await fetch(`/api/user-data/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ wishlist: wishlist })
          });
        } catch (e) {
          console.error("Failed to sync wishlist to server", e);
        }
      } else {
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
      }
    };

    const timeoutId = setTimeout(syncWishlist, 500); // Debounce sync
    return () => clearTimeout(timeoutId);
  }, [wishlist, user]);

  const addToWishlist = useCallback((product: Product) => {
    setWishlist((prev) => {
      if (prev.find((p) => p.id === product.id)) {
        return prev;
      }
      return [...prev, product];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.some((p) => p.id === productId);
  }, [wishlist]);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  const moveToCart = useCallback((productId: string) => {
    removeFromWishlist(productId);
  }, [removeFromWishlist]);

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist, moveToCart, isLoading }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
