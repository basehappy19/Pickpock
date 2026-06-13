"use client";

import { useLanguage } from "@/hooks/use-language";
import NextImage from "next/image";
import Link from "next/link";
import { ArrowRight, Star, ShieldCheck, Tag } from "lucide-react";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";

export default function HomepageClient({ products }: { products: Product[] }) {
  const { t } = useLanguage();

  const officialProducts = products.filter(p => p.isOfficial).slice(0, 4);
  const featuredProducts = products.filter(p => !p.isOfficial).slice(0, 8);

  return (
    <div className="space-y-12 lg:space-y-16 pb-16 animate-in fade-in duration-700">
      {/* Hero Banner */}
      <div className="relative bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-rainbow-gradient opacity-10 animate-shimmer" />
        <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-32 relative z-10">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-tight drop-shadow-sm">
              {t.home.heroTitle}
            </h1>
            <p className="text-lg lg:text-xl font-medium opacity-90 max-w-lg">
              {t.home.heroSubtitle}
            </p>
            <div className="pt-4 flex gap-4">
              <Link href="/products" className="h-14 px-8 bg-background text-foreground rounded-xl font-black flex items-center justify-center hover:scale-105 transition-transform shadow-xl cursor-pointer">
                {t.home.shopNow} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 space-y-12 lg:space-y-16">
        {/* Categories */}
        <section className="space-y-6">
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight">{t.home.categories}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {["Electronics", "Fashion", "Home & Living", "Furniture", "Beauty", "Sports"].map((cat) => (
              <div key={cat} className="aspect-square rounded-2xl bg-muted/50 border hover:bg-primary/5 hover:border-primary/20 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer group">
                <div className="h-12 w-12 rounded-full bg-background shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
                <span className="font-bold text-sm text-center">{cat}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Official Stores */}
        {officialProducts.length > 0 && (
          <section className="space-y-6 p-6 lg:p-10 rounded-3xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 border-2 border-amber-500/20">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-amber-600" />
              <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-amber-700 dark:text-amber-500">{t.home.officialStores}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {officialProducts.map(product => (
                <Link key={product.id} href={`/products/${product.id}`} className="group bg-card rounded-2xl border overflow-hidden hover:shadow-xl transition-all cursor-pointer">
                  <div className="aspect-square relative bg-muted">
                    <NextImage src={product.image} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 25vw" />
                    <div className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                      {t.products.officialBadge}
                    </div>
                  </div>
                  <div className="p-5 space-y-2">
                    <h3 className="font-bold line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-black text-primary">{formatCurrency(product.price)}</span>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="h-3 w-3 fill-current" /> {product.rating}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Daily Discover */}
        <section className="space-y-6">
          <div className="flex justify-between items-end px-2">
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight">{t.home.dailyDiscover}</h2>
            <Link href="/products" className="text-primary font-bold hover:underline text-sm lg:text-base">{t.common.view} All</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 px-1">
            {featuredProducts.map(product => (
              <Link key={product.id} href={`/products/${product.id}`} className="group bg-card rounded-2xl border overflow-hidden hover:shadow-xl transition-all cursor-pointer">
                <div className="aspect-square relative bg-muted">
                  <NextImage src={product.image} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 25vw" />
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-background/90 backdrop-blur text-[10px] font-black uppercase tracking-widest rounded-lg border shadow-sm">
                    {product.storeName}
                  </div>
                </div>
                <div className="p-4 lg:p-5 space-y-2">
                  <h3 className="font-bold line-clamp-2 text-xs lg:text-sm group-hover:text-primary transition-colors leading-snug h-10">{product.name}</h3>
                  <div className="flex justify-between items-end pt-2">
                    <span className="text-base lg:text-xl font-black text-primary">{formatCurrency(product.price)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
