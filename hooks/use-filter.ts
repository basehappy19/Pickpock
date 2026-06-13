"use client";

import { useMemo, useState } from "react";
import { Product, FilterOptions } from "@/types";

export function useFilter(initialData: Product[]) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    category: "all",
    sortBy: "newest",
  });

  const filteredData = useMemo(() => {
    let result = [...initialData];

    // Search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
      );
    }

    // Category
    if (filters.category && filters.category !== "all") {
      result = result.filter((item) => item.category === filters.category);
    }

    // Sort
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    // Official / Partner Filter
    if (filters.isOfficial) {
      result = result.filter(item => item.isOfficial || item.storeId === "mall");
    }
    if (filters.isPartner) {
      result = result.filter(item => !item.isOfficial && item.storeId !== "mall");
    }

    return result;
  }, [initialData, filters]);

  const updateFilter = (newFilters: Partial<FilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const categories = useMemo(() => {
    const cats = new Set(initialData.map((item) => item.category));
    return ["all", ...Array.from(cats)];
  }, [initialData]);

  const resetFilters = () => {
    setFilters({
      search: "",
      category: "all",
      sortBy: "newest",
    });
  };

  return {
    filteredData,
    filters,
    updateFilter,
    resetFilters,
    categories,
  };
}
