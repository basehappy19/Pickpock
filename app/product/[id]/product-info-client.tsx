"use client";

import { useGlobalData } from "@/hooks/use-global-data";
import { notFound } from "next/navigation";
import ProductInfo from "@/components/products/product-info";

export default function ProductInfoClient({ productId }: { productId: string }) {
  const { products } = useGlobalData();
  const product = products.find(p => p.id === productId);

  if (!product && products.length > 0) {
    notFound();
  }

  if (products.length === 0) return null; // Wait for hydration

  return (
    <div className="container mx-auto p-4 lg:p-8">
      <ProductInfo product={product!} allProducts={products} />
    </div>
  );
}
