"use client";

import { Product } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { Star, ShoppingCart, ShieldCheck, Truck, RotateCcw, Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import AIInsights from "./ai-insights";

export default function ProductInfo({ product }: { product: Product }) {
  const { t } = useLanguage();

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-[2.5rem] overflow-hidden border bg-muted shadow-inner group">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-8">
          <div className="space-y-4">
            <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
              {product.category}
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-3 py-1 rounded-lg font-bold">
                <Star className="h-4 w-4 fill-current" />
                {product.rating}
              </div>
              <span className="text-muted-foreground font-medium">
                {product.reviews.length} reviews
              </span>
            </div>
          </div>

          <div className="text-4xl font-bold text-primary tracking-tighter">
            {formatCurrency(product.price)}
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed">
            {product.fullDescription || product.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-y">
            <div className="flex items-center gap-3 text-sm font-semibold">
              <div className="p-2 rounded-xl bg-muted text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              1 Year Warranty
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold">
              <div className="p-2 rounded-xl bg-muted text-primary">
                <Truck className="h-5 w-5" />
              </div>
              Free Shipping
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
              <ShoppingCart className="h-5 w-5" /> Add to Cart
            </button>
            <button className="px-8 h-14 rounded-2xl border-2 font-bold hover:bg-muted transition-all">
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* AI Insights & Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-12 border-t">
        <div className="lg:col-span-2 space-y-8">
          <AIInsights product={product} />
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Product Specifications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(product.specs || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between p-4 rounded-2xl bg-muted/50 border">
                  <span className="text-muted-foreground font-medium">{key}</span>
                  <span className="font-bold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="p-5 rounded-2xl border bg-card space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold">{review.user}</span>
                  <div className="flex gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("h-3 w-3", i < review.rating ? "fill-current" : "text-muted")} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </div>
            ))}
            {product.reviews.length === 0 && (
              <p className="text-muted-foreground italic">No reviews yet. Be the first!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
