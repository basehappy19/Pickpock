"use client";

import { useLanguage } from "@/hooks/use-language";
import NextImage from "next/image";
import Link from "next/link";
import { ArrowRight, Star, ShieldCheck, Tag, Sparkles, Gift, TrendingUp, Zap, Eye, Clock } from "lucide-react";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { initialCoupons } from "@/lib/initial-data";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCompare } from "@/hooks/use-compare";
import { cn } from "@/lib/utils";

export default function HomepageClient({ products }: { products: Product[] }) {
  const { t } = useLanguage();
  const [claimedCodes, setClaimedCodes] = useState<string[]>([]);
  const { recentlyViewed } = useRecentlyViewed();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { addToCompare } = useCompare();

  // Since we simplified to MSU MALL only, all products are official.
  // We'll just slice different parts of the list for sections.
  const aiRecommended = products.slice(0, 4);
  const popularTrending = products.slice(4, 12);
  const newArrivals = products.slice(12, 16);

  const handleClaim = (code: string) => {
    if (claimedCodes.includes(code)) return;
    setClaimedCodes([...claimedCodes, code]);
    alert(`Voucher ${code} collected! You can use it at checkout.`);
  };

  const getImgSrc = (src: string) => {
    if (!src || src.trim() === "") return "https://placehold.co/600x600?text=MSU+MALL";
    return src;
  };

  return (
    <div className="space-y-12 lg:space-y-16 pb-20 lg:pb-16 animate-in fade-in duration-700 text-center lg:text-left">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-primary via-purple-600 to-pink-600 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-premium-gradient opacity-20" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>
        <div className="container mx-auto px-4 lg:px-8 py-20 lg:py-32 relative z-10">
          <div className="max-w-2xl space-y-6 mx-auto lg:mx-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-bold">
              <Sparkles className="h-4 w-4" />
              AI-Powered Shopping Experience
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-tight drop-shadow-sm">
              {t.home.heroTitle}
            </h1>
            <p className="text-lg lg:text-xl font-medium opacity-90 max-w-lg mx-auto lg:mx-0">
              {t.home.heroSubtitle}
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/products" className="h-14 px-8 bg-background text-primary rounded-xl font-black flex items-center justify-center hover:scale-105 transition-transform shadow-xl cursor-pointer animate-pulse-glow">
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
             <Gift className="h-7 w-7 text-rose-500" />
             <h2 className="text-2xl lg:text-3xl font-black tracking-tight">{t.home.vouchers}</h2>
          </div>
          <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
            {initialCoupons.map((coupon) => (
              <div key={coupon.code} className="min-w-[280px] bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group border-2 border-white/10 shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 transition-all duration-300">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 h-20 w-20 bg-white/5 rounded-full blur-xl" />
                <div className="relative z-10 space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest opacity-80">{coupon.code}</p>
                  <h3 className="text-3xl font-black">{coupon.type === 'percent' ? `${coupon.discount}% OFF` : `฿${coupon.discount} OFF`}</h3>
                  <p className="text-[10px] font-bold opacity-90 uppercase tracking-tighter">Min. spend ฿0 • No expiry</p>
                </div>
                <button
                  onClick={() => handleClaim(coupon.code)}
                  disabled={claimedCodes.includes(coupon.code)}
                  className="mt-6 h-10 w-full rounded-xl bg-white text-rose-600 font-black text-sm hover:bg-rose-50 transition-colors disabled:opacity-50 disabled:bg-white/80 cursor-pointer shadow-md group-hover:shadow-lg transition-shadow"
                >
                  {claimedCodes.includes(coupon.code) ? (
                    <span className="flex items-center justify-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> {t.home.claimed}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Gift className="h-4 w-4" /> {t.home.claim}
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="space-y-6">
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight">{t.home.categories}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "Electronics", icon: "💻", color: "from-blue-500/10 to-blue-600/5" },
              { name: "Fashion", icon: "👗", color: "from-pink-500/10 to-pink-600/5" },
              { name: "Home & Living", icon: "🏠", color: "from-green-500/10 to-green-600/5" },
              { name: "Furniture", icon: "🛋️", color: "from-amber-500/10 to-amber-600/5" },
              { name: "Beauty", icon: "💄", color: "from-purple-500/10 to-purple-600/5" },
              { name: "Sports", icon: "⚽", color: "from-rose-500/10 to-rose-600/5" }
            ].map((cat) => (
              <Link
                key={cat.name}
                href={`/products?category=${cat.name}`}
                className="aspect-square rounded-2xl bg-gradient-to-br border hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center gap-2 cursor-pointer group shadow-sm hover:shadow-md"
                style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="font-bold text-sm text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* AI Recommended Picks */}
        <section className="space-y-6 p-6 lg:p-10 rounded-3xl bg-premium-gradient border-2 border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 rounded-xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight uppercase tracking-tighter">AI Recommended Picks</h2>
            <span className="ml-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">SMART</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 relative z-10">
            {aiRecommended.map(product => (
              <Link key={product.id} href={`/products/${product.id}`} className="group bg-card rounded-2xl border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer text-left h-full flex flex-col shadow-sm">
                <div className="aspect-square relative bg-muted overflow-hidden">
                  <NextImage src={getImgSrc(product.image)} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 25vw" />
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-primary/90 backdrop-blur text-white text-[10px] font-bold uppercase tracking-widest">
                    <Zap className="h-3 w-3 inline mr-1" />AI Pick
                  </div>
                </div>
                <div className="p-4 lg:p-5 space-y-2 flex-1 flex flex-col justify-between">
                  <h3 className="font-black line-clamp-1 group-hover:text-primary transition-colors text-sm">{product.name}</h3>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-base font-black text-primary">{formatCurrency(product.price)}</span>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                       <Star className="h-3 w-3 fill-current" /> {product.rating}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular Trending */}
        <section className="space-y-6">
          <div className="flex justify-between items-end px-2">
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight">{t.home.dailyDiscover}</h2>
            <Link href="/products" className="text-primary font-bold hover:underline text-sm lg:text-base">{t.common.view} All</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 px-1">
            {popularTrending.map(product => (
              <Link key={product.id} href={`/products/${product.id}`} className="group bg-card rounded-2xl border overflow-hidden hover:shadow-xl transition-all cursor-pointer text-left h-full flex flex-col shadow-sm">
                <div className="aspect-square relative bg-muted overflow-hidden">
                  <NextImage src={getImgSrc(product.image)} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 25vw" />
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-background/90 backdrop-blur text-[10px] font-black uppercase tracking-widest rounded-lg border shadow-sm">
                    {product.storeName}
                  </div>
                </div>
                <div className="p-4 lg:p-5 space-y-2 flex-1 flex flex-col justify-between">
                  <h3 className="font-bold line-clamp-2 text-xs lg:text-sm group-hover:text-primary transition-colors leading-snug h-10">{product.name}</h3>
                  <div className="flex justify-between items-end pt-2">
                    <span className="text-base lg:text-xl font-black text-primary">{formatCurrency(product.price)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <section className="space-y-6">
            <div className="flex justify-between items-end px-2">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-primary" />
                <h2 className="text-2xl lg:text-3xl font-black tracking-tight">{t.recentlyViewed.title}</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 px-1">
              {recentlyViewed.slice(0, 4).map(product => (
                <Link key={product.id} href={`/products/${product.id}`} className="group bg-card rounded-2xl border overflow-hidden hover:shadow-xl transition-all cursor-pointer text-left h-full flex flex-col shadow-sm">
                  <div className="aspect-square relative bg-muted overflow-hidden">
                    <NextImage src={getImgSrc(product.image)} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 25vw" />
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-primary/90 backdrop-blur text-white text-[8px] font-bold uppercase tracking-widest">
                      <Eye className="h-3 w-3 inline mr-1" />Viewed
                    </div>
                  </div>
                  <div className="p-4 lg:p-5 space-y-2 flex-1 flex flex-col justify-between">
                    <h3 className="font-bold line-clamp-2 text-xs lg:text-sm group-hover:text-primary transition-colors leading-snug h-10">{product.name}</h3>
                    <div className="flex justify-between items-end pt-2">
                      <span className="text-base lg:text-xl font-black text-primary">{formatCurrency(product.price)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
