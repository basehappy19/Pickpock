"use client";

import { useLanguage } from "@/hooks/use-language";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { Heart, X, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { useState } from "react";

export default function WishlistPage() {
  const { t } = useLanguage();
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [removedItems, setRemovedItems] = useState<Set<string>>(new Set());

  const handleMoveToCart = (product: any) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  const handleRemove = (productId: string) => {
    setRemovedItems(new Set([...removedItems, productId]));
    setTimeout(() => {
      removeFromWishlist(productId);
      setRemovedItems(new Set([...removedItems].filter(id => id !== productId)));
    }, 300);
  };

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto p-4 lg:p-8 min-h-[60vh] flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-700 text-center">
        <div className="p-8 rounded-full bg-muted shadow-inner">
          <Heart className="h-16 w-16 text-muted-foreground/50" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight">{t.wishlist.empty}</h2>
          <p className="text-muted-foreground font-medium">{t.wishlist.emptyDesc}</p>
        </div>
        <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all shadow-xl shadow-primary/20 cursor-pointer">
          <ShoppingBag className="h-5 w-5" />
          {t.wishlist.startBrowsing}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-8 animate-in fade-in duration-700 pb-20 lg:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-semibold tracking-tight uppercase tracking-tighter flex items-center gap-3">
            <Heart className="h-8 w-8 text-rose-500 fill-rose-500" />
            {t.wishlist.title}
          </h1>
          <p className="text-muted-foreground font-medium">
            {t.common.totalItems.replace("{count}", String(wishlist.length))}
          </p>
        </div>
        <button
          onClick={clearWishlist}
          className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-sm transition-all cursor-pointer"
        >
          {t.wishlist.clearAll}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <div
            key={product.id}
            className={`group bg-card rounded-2xl border overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col ${
              removedItems.has(product.id) ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
          >
            <div className="relative aspect-square bg-muted overflow-hidden">
              <NextImage
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <button
                onClick={() => handleRemove(product.id)}
                className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur text-rose-500 hover:text-rose-600 hover:bg-background transition-all shadow-sm cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
              {product.stock > 0 ? (
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-medium uppercase tracking-wider">
                  {t.product.inStock}
                </div>
              ) : (
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-medium uppercase tracking-wider">
                  {t.product.outOfStock}
                </div>
              )}
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">{product.category}</p>
                <h3 className="font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-muted">
                <div className="text-xl font-semibold text-primary">{formatCurrency(product.price)}</div>
                <div className="flex items-center gap-1">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-xs ${i < Math.floor(product.rating) ? "fill-current" : "opacity-30"}`}>★</span>
                    ))}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">({Number(product.rating).toFixed(1)})</span>
                </div>
              </div>

              <button
                onClick={() => handleMoveToCart(product)}
                disabled={product.stock === 0}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
              >
                <ShoppingBag className="h-4 w-4" />
                {t.wishlist.moveToCart}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
