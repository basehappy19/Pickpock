"use client";

import { useGlobalData } from "@/hooks/use-global-data";
import ProductListContent from "@/components/products/product-list-content";

export default function ProductsPage() {
  const { products } = useGlobalData();

  return (
    <div className="container mx-auto p-4 lg:p-8">
      <ProductListContent initialProducts={products} />
    </div>
  );
}
