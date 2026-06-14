"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { Product } from "@/types";
import { useRole } from "./use-role";

interface RecentlyViewedContextType {
  recentlyViewed: Product[];
  addToRecentlyViewed: (product: Product) => void;
  clearRecentlyViewed: () => void;
  isLoading: boolean;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);
const MAX_RECENT_ITEMS = 10;

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const { user } = useRole();
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialLoad = useRef(true);

  // Load recently viewed data
  useEffect(() => {
    const loadRecentlyViewed = async () => {
      setIsLoading(true);
      if (user) {
        try {
          const res = await fetch(`/api/user-data/${user.id}`);
          if (res.ok) {
            const data = await res.json();
            setRecentlyViewed(data.recentlyViewed || []);
          }
        } catch (e) {
          console.error("Failed to fetch recently viewed from server", e);
        }
      } else {
        const saved = localStorage.getItem("recentlyViewed");
        if (saved) {
          try {
            setRecentlyViewed(JSON.parse(saved));
          } catch (e) {
            console.error("Failed to parse recently viewed from localStorage", e);
          }
        } else {
          setRecentlyViewed([]);
        }
      }
      setIsLoading(false);
      isInitialLoad.current = false;
    };

    loadRecentlyViewed();
  }, [user]);

  // Sync recently viewed data to server or localStorage
  useEffect(() => {
    if (isInitialLoad.current) return;

    const syncRecentlyViewed = async () => {
      // Always store recently viewed locally to persist across guest/logged-in states
      localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));
      
      if (user) {
        try {
          await fetch(`/api/user-data/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recentlyViewed: recentlyViewed })
          });
        } catch (e) {
          console.error("Failed to sync recently viewed to server", e);
        }
      }
    };

    const timeoutId = setTimeout(syncRecentlyViewed, 500); // Debounce sync
    return () => clearTimeout(timeoutId);
  }, [recentlyViewed, user]);

  const addToRecentlyViewed = useCallback((product: Product) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, MAX_RECENT_ITEMS);
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
  }, []);

  return (
    <RecentlyViewedContext.Provider value={{ recentlyViewed, addToRecentlyViewed, clearRecentlyViewed, isLoading }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (context === undefined) {
    throw new Error("useRecentlyViewed must be used within a RecentlyViewedProvider");
  }
  return context;
}
