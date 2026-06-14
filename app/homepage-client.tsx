"use client";

import { useLanguage } from "@/hooks/use-language";
import NextImage from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Gift, Sparkles, TrendingUp, Clock } from "lucide-react";
import { Product } from "@/types";
import { useRole } from "@/hooks/use-role";
import { useGlobalData } from "@/hooks/use-global-data";
import { cn } from "@/lib/utils";
import { initialCoupons } from "@/lib/initial-data";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { useCouponClaim } from "@/hooks/use-coupon-claim";
import { SectionHeader } from "@/components/ui/section-header";
import { ProductCard } from "@/components/products/product-card";
import { CategoryGrid } from "@/components/home/category-grid";

export default function HomepageClient({
  initialProducts = [],
}: {
  initialProducts?: Product[];
}) {
  const { t } = useLanguage();
  const { recentlyViewed } = useRecentlyViewed();

  const products = initialProducts ?? [];
  const aiRecommended  = products.slice(0, 4);
  const popularTrending = products.slice(4, 12);
  const newArrivals    = products.slice(12, 16);

  const { user } = useRole();
  const { orders } = useGlobalData();
  const { claimedCodes, handleClaim } = useCouponClaim(user, orders);

  return (
    <div className="container mx-auto p-4 lg:p-8 animate-in fade-in duration-500">

      {/* ── Hero ── */}
      <section className="bg-background border-b px-4 lg:px-8 py-12 lg:py-16">
        <div className="max-w-xl mx-auto lg:mx-0 space-y-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary border rounded-full px-3 py-1">
            <NextImage src="/brand/mascot.jpeg" width={16} height={16} className="h-4 w-4 object-cover rounded-full" alt="AI Mascot" />
            AI-Powered Shopping
          </span>
          <h1 className="text-3xl lg:text-4xl font-medium leading-tight tracking-tight">
            {t.home.heroTitle}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t.home.heroSubtitle}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 h-10 px-5 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            aria-label="Shop Now"
          >
            {t.home.shopNow}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <div className="divide-y">

        {/* ── Categories ── */}
        <section className="px-4 lg:px-8 py-6">
          <SectionHeader title={t.home.categories} />
          <CategoryGrid />
        </section>

        {/* ── Vouchers ── */}
        <section className="px-4 lg:px-8 py-6">
          <SectionHeader
            title={t.home.vouchers}
            icon={Gift}
            href="/vouchers"
          />
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
            {initialCoupons.map((coupon, i) => {
              const claimed = claimedCodes.includes(coupon.code);
              return (
                <div
                  key={`coupon-${coupon.code}-${i}`}
                  className="min-w-45 bg-card border rounded-xl p-4 flex flex-col gap-2 shrink-0"
                >
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {coupon.code}
                  </p>
                  <p className="text-xl font-medium">
                    {coupon.type === "percent"
                      ? `${coupon.discount}% OFF`
                      : `฿${coupon.discount} OFF`}
                  </p>
                  <button
                    onClick={() => handleClaim(coupon.code)}
                    disabled={claimed || !user}
                    aria-label={`Claim coupon ${coupon.code}`}
                    className={cn(
                      "mt-1 h-8 w-full rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      claimed
                        ? "bg-secondary text-muted-foreground cursor-default"
                        : !user
                        ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                        : "bg-secondary hover:bg-border text-foreground cursor-pointer"
                    )}
                  >
                    {claimed ? (
                      <>
                        <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                        {t.home.claimed}
                      </>
                    ) : (
                       <>
                        <Gift className="h-3 w-3" aria-hidden="true" />
                        {!user ? "เข้าสู่ระบบเพื่อเก็บ" : t.home.claim}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── AI Recommended ── */}
        <section className="px-4 lg:px-8 py-6 bg-background">
          <SectionHeader
            title="แนะนำสำหรับคุณ"
            icon={Sparkles}
            href="/products"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {aiRecommended.map((product, i) => (
              <ProductCard
                key={`ai-${product.id || i}`}
                product={product}
                priority={i < 2} // Add priority to the first 2 images for LCP
              />
            ))}
          </div>
        </section>

        {/* ── Popular / Trending ── */}
        <section className="px-4 lg:px-8 py-6">
          <SectionHeader
            title={t.home.dailyDiscover}
            icon={TrendingUp}
            href="/products"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {popularTrending.map((product, i) => (
              <ProductCard
                key={`pop-${product.id || i}`}
                product={product}
                badge={product.isOfficial ? t.dashboard.officialMall : t.dashboard.partnerStore}
              />
            ))}
          </div>
        </section>

        {/* ── New Arrivals ── */}
        {newArrivals.length > 0 && (
          <section className="px-4 lg:px-8 py-6 bg-background">
            <SectionHeader
              title="สินค้ามาใหม่"
              href="/products?sort=newest"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {newArrivals.map((product, i) => (
                <ProductCard
                  key={`new-${product.id || i}`}
                  product={product}
                  badge="ใหม่"
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Recently Viewed ── */}
        {recentlyViewed.length > 0 && (
          <section className="px-4 lg:px-8 py-6">
            <SectionHeader
              title={t.recentlyViewed.title}
              icon={Clock}
              href="/recently-viewed"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {recentlyViewed.slice(0, 4).map((product, i) => (
                <ProductCard
                  key={`rec-${product.id || i}`}
                  product={product}
                  badge="เคยดู"
                />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}