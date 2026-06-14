"use client";

import { useLanguage } from "@/hooks/use-language";
import { useCompare } from "@/hooks/use-compare";
import { formatCurrency } from "@/lib/utils";
import { GitCompare, X, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { useState } from "react";

export default function ComparePage() {
  const { t } = useLanguage();
  const { compareList, removeFromCompare, clearCompare, maxItems } = useCompare();
  const [removedItems, setRemovedItems] = useState<Set<string>>(new Set());

  const handleRemove = (productId: string) => {
    setRemovedItems(new Set([...removedItems, productId]));
    setTimeout(() => {
      removeFromCompare(productId);
      setRemovedItems(new Set([...removedItems].filter(id => id !== productId)));
    }, 300);
  };

  if (compareList.length === 0) {
    return (
      <div className="container mx-auto p-4 lg:p-8 min-h-[60vh] flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-700 text-center">
        <div className="p-8 rounded-full bg-muted shadow-inner">
          <GitCompare className="h-16 w-16 text-muted-foreground/50" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">{t.compare.empty}</h2>
          <p className="text-muted-foreground font-medium">{t.compare.emptyDesc}</p>
        </div>
        <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-black hover:opacity-90 transition-all shadow-xl shadow-primary/20 cursor-pointer">
          <Plus className="h-5 w-5" />
          {t.wishlist.startBrowsing}
        </Link>
      </div>
    );
  }

  const specs = [
    { key: "category", label: t.compare.specs.category },
    { key: "price", label: t.compare.specs.price, format: (v: any) => formatCurrency(v) },
    { key: "stock", label: t.compare.specs.stock },
    { key: "rating", label: t.compare.specs.rating, format: (v: any) => `${Number(v || 0).toFixed(1)} / 5` },
    { key: "storeName", label: t.compare.specs.store },
    { key: "isOfficial", label: t.compare.specs.official, format: (v: any) => v ? "✓" : "-" },
    { key: "weight", label: t.dashboard?.extendedFields?.weight || "Weight", format: (v: any) => v || "-" },
    { key: "dimensions", label: t.dashboard?.extendedFields?.dimensions || "Dimensions", format: (v: any) => v || "-" },
    { key: "warranty", label: t.dashboard?.extendedFields?.warranty || "Warranty", format: (v: any) => v || "-" },
    { key: "additionalDetails", label: t.dashboard?.extendedFields?.additionalDetails || "Details", format: (v: any) => v || "-" },
  ];

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-8 animate-in fade-in duration-700 pb-20 lg:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight uppercase tracking-tighter flex items-center gap-3">
            <GitCompare className="h-8 w-8 text-primary" />
            {t.compare.title}
          </h1>
          <p className="text-muted-foreground font-bold">
            {t.common.totalItems.replace("{count}", String(compareList.length))}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/products"
            className="px-4 py-2 rounded-xl border border-primary/20 text-primary hover:bg-primary/5 font-black text-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t.compare.add}
          </Link>
          <button
            onClick={clearCompare}
            className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-black text-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {t.compare.clearAll}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Products Header */}
          <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `200px repeat(${compareList.length}, 1fr)` }}>
            <div />
            {compareList.map((product) => (
              <div
                key={product.id}
                className={`relative transition-all duration-300 ${
                  removedItems.has(product.id) ? "opacity-0 scale-95" : "opacity-100 scale-100"
                }`}
              >
                <button
                  onClick={() => handleRemove(product.id)}
                  className="absolute -top-2 -right-2 p-1.5 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-sm cursor-pointer z-10"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="bg-card rounded-2xl border overflow-hidden shadow-sm p-4 text-center">
                  <div className="w-24 h-24 mx-auto relative bg-muted rounded-xl overflow-hidden mb-3">
                    <NextImage src={product.image} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">{product.category}</p>
                    <h3 className="font-black text-sm leading-tight line-clamp-2">{product.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="space-y-3">
            {specs.map((spec) => (
              <div
                key={spec.key}
                className="grid gap-4 items-center p-4 rounded-xl bg-card border"
                style={{ gridTemplateColumns: `200px repeat(${compareList.length}, 1fr)` }}
              >
                <div className="font-bold text-sm text-muted-foreground">{spec.label}</div>
                {compareList.map((product) => (
                  <div key={product.id} className="text-center">
                    <span className="font-black">
                      {spec.format ? spec.format(product[spec.key as keyof typeof product]) : (product[spec.key as keyof typeof product] as string)}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="grid gap-4 mt-6" style={{ gridTemplateColumns: `200px repeat(${compareList.length}, 1fr)` }}>
            <div />
            {compareList.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="h-12 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20"
              >
                {t.compare.viewDetails}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
