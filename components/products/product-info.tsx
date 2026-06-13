"use client";

import { Product } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { Star, ShoppingCart, ShieldCheck, Truck, Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import AIInsights from "./ai-insights";
import NextImage from "next/image";
import { useCart } from "@/hooks/use-cart";
import AIBundleSuggest from "./ai-bundle-suggest";

export default function ProductInfo({ product, allProducts }: { product: Product, allProducts: Product[] }) {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  
  // Calculate delivery date (2 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 2);
  const deliveryStr = deliveryDate.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden border bg-muted shadow-inner group">
            <NextImage 
              src={product.image} 
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              priority
            />
            {product.isOfficial && (
              <div className="absolute top-4 left-4 px-3 py-1 bg-amber-500 text-white text-xs font-black uppercase tracking-widest rounded-lg shadow-sm">
                {t.products.officialBadge}
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex gap-2">
              <span className="px-4 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">
                {product.category}
              </span>
              {product.storeName && (
                <span className="px-4 py-1.5 rounded-lg border border-muted-foreground/20 text-muted-foreground text-xs font-bold">
                  {product.storeName}
                </span>
              )}
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-3 py-1 rounded-lg font-black">
                <Star className="h-4 w-4 fill-current" />
                {product.rating}
              </div>
              <span className="text-muted-foreground font-bold">
                {product.reviews.length} {t.products.reviews}
              </span>
            </div>
          </div>

          <div className="text-5xl font-black text-primary tracking-tighter">
            {formatCurrency(product.price)}
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed font-medium">
            {product.fullDescription || product.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-y">
            <div className="flex items-center gap-3 text-sm font-black uppercase tracking-wide">
              <div className="p-2 rounded-xl bg-muted text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              {t.products.warranty}
            </div>
            <div className="flex items-center gap-3 text-sm font-black uppercase tracking-wide">
              <div className="p-2 rounded-xl bg-muted text-primary">
                <Truck className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span>{t.products.shipping}</span>
                <span className="text-xs text-muted-foreground">{t.products.deliveryEst} {deliveryStr}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={() => addToCart(product)}
              className="flex-1 h-16 rounded-xl bg-primary text-primary-foreground font-black text-lg hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 cursor-pointer group"
            >
              <ShoppingCart className="h-6 w-6 group-hover:rotate-12 transition-transform" /> {t.products.addToCart}
            </button>
            <button 
              onClick={() => {
                addToCart(product);
                alert("Proceeding to checkout... (MVP Demo)");
              }}
              className="px-8 h-16 rounded-xl border-2 border-primary/10 font-black text-lg hover:bg-muted active:scale-95 transition-all cursor-pointer"
            >
              {t.products.buyNow}
            </button>
          </div>
        </div>
      </div>

      {/* AI Bundle Suggestion */}
      {allProducts && allProducts.length > 0 && (
        <AIBundleSuggest currentProduct={product} allProducts={allProducts} />
      )}

      {/* AI Insights & Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-12 border-t">
        <div className="lg:col-span-2 space-y-12">
          <AIInsights product={product} />
          
          <div className="space-y-6">
            <h2 className="text-3xl font-black tracking-tight">{t.products.specs}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(product.specs || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-5 rounded-xl bg-card border shadow-sm group hover:border-primary/20 transition-colors">
                  <span className="text-muted-foreground font-black uppercase text-xs tracking-widest">{key}</span>
                  <span className="font-black text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-black tracking-tight">{t.products.customerReviews}</h2>
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="p-6 rounded-2xl border bg-card space-y-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <span className="font-black text-primary">{review.user}</span>
                  <div className="flex gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("h-3 w-3", i < review.rating ? "fill-current" : "text-muted")} />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground font-medium italic">"{review.comment}"</p>
                <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-tighter">{review.date}</p>
              </div>
            ))}
            {product.reviews.length === 0 && (
              <div className="p-10 text-center rounded-2xl border-2 border-dashed bg-muted/20">
                <p className="text-muted-foreground font-bold italic">{t.products.noReviews}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
