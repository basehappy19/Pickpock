"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types";
import { Sparkles, Loader2, Plus, ShoppingCart } from "lucide-react";
import NextImage from "next/image";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useLanguage } from "@/hooks/use-language";

export default function AIBundleSuggest({ currentProduct, allProducts }: { currentProduct: Product, allProducts: Product[] }) {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const [bundleProduct, setBundleProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Realistic AI Bundle Suggestion Logic
    const timer = setTimeout(() => {
      const getComplementaryCategory = (category: string, name: string) => {
        const n = name.toLowerCase();
        const c = category.toLowerCase();
        
        if (n.includes('headphone') || n.includes('earbuds') || n.includes('airpods')) {
          return { categories: ['Electronics', 'Accessories'], keywords: ['case', 'power bank', 'charger', 'stand'] };
        }
        if (n.includes('watch')) {
          return { categories: ['Electronics', 'Accessories'], keywords: ['strap', 'band', 'screen protector', 'case'] };
        }
        if (n.includes('phone') || n.includes('iphone') || n.includes('samsung')) {
          return { categories: ['Electronics', 'Accessories'], keywords: ['case', 'protector', 'charger', 'power bank'] };
        }
        if (c.includes('fashion')) {
          return { categories: ['Fashion', 'Accessories'], keywords: ['bag', 'hat', 'belt', 'socks'] };
        }
        if (c.includes('furniture') || c.includes('home')) {
          return { categories: ['Home & Living', 'Furniture'], keywords: ['decor', 'lamp', 'pillow', 'cushion'] };
        }
        return { categories: [category], keywords: [] };
      };

      const filter = getComplementaryCategory(currentProduct.category, currentProduct.name);
      
      let candidates = allProducts.filter(p => {
        if (p.id === currentProduct.id) return false;
        
        const inCategory = filter.categories.some(cat => p.category.toLowerCase().includes(cat.toLowerCase()));
        const matchesKeyword = filter.keywords.length > 0 
          ? filter.keywords.some(kw => p.name.toLowerCase().includes(kw))
          : true;
          
        return inCategory && matchesKeyword;
      });

      // Fallback: If no strict matches, just take products from the same category
      if (candidates.length === 0) {
        candidates = allProducts.filter(p => p.id !== currentProduct.id && p.category === currentProduct.category);
      }

      if (candidates.length > 0) {
        // Pick one randomly from candidates
        setBundleProduct(candidates[Math.floor(Math.random() * candidates.length)]);
      } else {
        // Final fallback: any other product
        const anyOther = allProducts.find(p => p.id !== currentProduct.id);
        if (anyOther) setBundleProduct(anyOther);
      }
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentProduct, allProducts]);

  if (loading) {
    return (
      <div className="p-6 rounded-[2rem] bg-muted/30 border border-dashed flex items-center gap-4 animate-pulse">
        <Sparkles className="h-6 w-6 text-primary animate-spin" />
        <span className="font-bold text-muted-foreground">{t.products.aiBundleLoading}</span>
      </div>
    );
  }

  if (!bundleProduct) return null;

  return (
    <div className="p-6 lg:p-8 rounded-[2rem] bg-gradient-to-r from-primary/5 to-transparent border border-primary/10 space-y-6">
      <div className="flex items-center gap-2 text-primary font-black tracking-tight">
        <Sparkles className="h-5 w-5 fill-current" />
        {t.products.aiBundleTitle}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-24 rounded-2xl overflow-hidden border bg-muted shadow-sm">
            <NextImage src={currentProduct.image} alt={currentProduct.name} fill className="object-cover" />
          </div>
          <Plus className="h-6 w-6 text-muted-foreground" />
          <div className="relative h-24 w-24 rounded-2xl overflow-hidden border bg-muted shadow-sm group">
            <NextImage src={bundleProduct.image} alt={bundleProduct.name} fill className="object-cover group-hover:scale-110 transition-transform" />
          </div>
        </div>

        <div className="flex-1 space-y-1 text-center sm:text-left">
          <p className="text-sm font-bold line-clamp-1">{currentProduct.name} <span className="text-muted-foreground">x 1</span></p>
          <p className="text-sm font-bold line-clamp-1 text-primary">+ {bundleProduct.name} <span className="text-muted-foreground">x 1</span></p>
          <div className="text-xl font-black pt-2">
            {formatCurrency(currentProduct.price + bundleProduct.price)}
          </div>
        </div>

        <button 
          onClick={() => {
            addToCart(currentProduct);
            addToCart(bundleProduct);
          }}
          className="w-full sm:w-auto px-6 h-12 rounded-xl bg-foreground text-background font-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl"
        >
          <ShoppingCart className="h-4 w-4" /> {t.products.aiBundleAdd}
        </button>
      </div>
    </div>
  );
}
