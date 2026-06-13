"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product } from "@/types";

interface CompareContextType {
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
  maxItems: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);
const MAX_COMPARE_ITEMS = 4;

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<Product[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("compareList");
    if (saved) {
      setCompareList(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("compareList", JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = useCallback((product: Product) => {
    setCompareList((prev) => {
      if (prev.find((p) => p.id === product.id)) {
        return prev;
      }
      if (prev.length >= MAX_COMPARE_ITEMS) {
        return prev;
      }
      return [...prev, product];
    });
  }, []);

  const removeFromCompare = useCallback((productId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const isInCompare = useCallback((productId: string) => {
    return compareList.some((p) => p.id === productId);
  }, [compareList]);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  return (
    <CompareContext.Provider
      value={{ compareList, addToCompare, removeFromCompare, isInCompare, clearCompare, maxItems: MAX_COMPARE_ITEMS }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
