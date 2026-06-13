"use client";

import { useLanguage } from "@/hooks/use-language";
import NextImage from "next/image";
import Link from "next/link";
import { ArrowRight, Star, ShieldCheck, Tag, Sparkles, Gift } from "lucide-react";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { initialCoupons } from "@/lib/initial-data";

export default function HomepageClient({ products }: { products: Product[] }) {
  const { t } = useLanguage();
  const [claimedCodes, setClaimedCodes] = useState<string[]>([]);

  const officialProducts = products.filter(p => p.isOfficial).slice(0, 4);
  const featuredProducts = products.filter(p => !p.isOfficial).slice(0, 8);

  const handleClaim = (code: string) => {
    if (claimedCodes.includes(code)) return;
    setClaimedCodes([...claimedCodes, code]);
    alert(`Voucher ${code} collected! You can use it at checkout.`);
  };

  return (
    <div className="space-y-12 lg:space-y-16 pb-20 lg:pb-16 animate-in fade-in duration-700 text-center lg:text-left">
      {/* Hero Banner */}
      <div className="relative bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-rainbow-gradient opacity-10 animate-shimmer" />
        <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-32 relative z-10">
          <div className="max-w-2xl space-y-6 mx-auto lg:mx-0">
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-tight drop-shadow-sm">
              {t.home.heroTitle}
            </h1>
            <p className="text-lg lg:text-xl font-medium opacity-90 max-w-lg mx-auto lg:mx-0">
              {t.home.heroSubtitle}
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/products" className="h-14 px-8 bg-background text-foreground rounded-xl font-black flex items-center justify-center hover:scale-105 transition-transform shadow-xl cursor-pointer">
                {t.home.shopNow} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 space-y-12 lg:space-y-16">
        
        {/* Vouchers Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <Gift className="h-6 w-6 text-rose-500" />
             <h2 className="text-2xl lg:text-3xl font-black tracking-tight">{t.home.vouchers}</h2>
          </div>
          <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
            {initialCoupons.map((coupon) => (
              <div key={coupon.code} className="min-w-[280px] bg-rose-500 text-white rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10 space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest opacity-80">{coupon.code}</p>
                  <h3 className="text-3xl font-black">{coupon.type === 'percent' ? `${coupon.discount}% OFF` : `฿${coupon.discount} OFF`}</h3>
                  <p className="text-[10px] font-bold opacity-90 uppercase tracking-tighter">Min. spend ฿0</p>
                </div>
                <button 
                  onClick={() => handleClaim(coupon.code)}
                  disabled={claimedCodes.includes(coupon.code)}
                  className="mt-6 h-10 w-full rounded-xl bg-white text-rose-500 font-black text-sm hover:bg-rose-50 transition-colors disabled:opacity-50 disabled:bg-white/80 cursor-pointer"
                >
                  {claimedCodes.includes(coupon.code) ? t.home.claimed : t.home.claim}
                </button>
              </div>
            ))}
          </div>
        </section>

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

        {/* AI Recommended Picks */}
        <section className="space-y-6 p-6 lg:p-10 rounded-3xl bg-rainbow-gradient border-2 border-primary/10">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight">{t.home.officialStores}</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {featuredProducts.slice(0, 4).map(product => (
              <Link key={product.id} href={`/products/${product.id}`} className="group bg-card rounded-2xl border overflow-hidden hover:shadow-xl transition-all cursor-pointer text-left">
                <div className="aspect-square relative bg-muted">
                  <NextImage src={product.image} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 25vw" />
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-bold line-clamp-1 group-hover:text-primary transition-colors text-sm">{product.name}</h3>
                  <span className="text-base font-black text-primary block">{formatCurrency(product.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Daily Discover */}
        <section className="space-y-6">
          <div className="flex justify-between items-end px-2">
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight">{t.home.dailyDiscover}</h2>
            <Link href="/products" className="text-primary font-bold hover:underline text-sm lg:text-base">{t.common.view} All</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 px-1">
            {featuredProducts.map(product => (
              <Link key={product.id} href={`/products/${product.id}`} className="group bg-card rounded-2xl border overflow-hidden hover:shadow-xl transition-all cursor-pointer text-left">
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
