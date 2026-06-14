"use client";

import { useLanguage } from "@/hooks/use-language";
import NextImage from "next/image";
import Link from "next/link";
import { ArrowRight, Star, ShieldCheck, Gift, Sparkles, TrendingUp, Clock } from "lucide-react";
import { Product } from "@/types";
import { useRole } from "@/hooks/use-role";
import { useGlobalData } from "@/hooks/use-global-data";
import { formatCurrency, cn, getImgSrc } from "@/lib/utils";
import { useState, useEffect } from "react";
import { initialCoupons } from "@/lib/initial-data";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { toast } from "sonner";

const CATEGORIES = [
  { name: "Electronics",      icon: "💻", href: "/products?category=Electronics" },
  { name: "Fashion",          icon: "👗", href: "/products?category=Fashion" },
  { name: "Home & Living",    icon: "🏠", href: "/products?category=Home+%26+Living" },
  { name: "Furniture",        icon: "🛋️", href: "/products?category=Furniture" },
  { name: "Beauty",           icon: "💄", href: "/products?category=Beauty" },
  { name: "Sports",           icon: "⚽", href: "/products?category=Sports" },
  { name: "Toys",             icon: "🧸", href: "/products?category=Toys" },
  { name: "Food",             icon: "🍜", href: "/products?category=Food" },
  { name: "Books",            icon: "📚", href: "/products?category=Books" },
  { name: "Baby & Kids",      icon: "👶", href: "/products?category=Baby+%26+Kids" },
  { name: "Health",           icon: "💊", href: "/products?category=Health" },
  { name: "Music",            icon: "🎵", href: "/products?category=Music" },
  { name: "Art",              icon: "🎨", href: "/products?category=Art" },
  { name: "Home & Garden",     icon: "🌻", href: "/products?category=Home+%26+Garden" },
  { name: "Stationery",       icon: "✏️", href: "/products?category=Stationery" },
  { name: "Gaming & Tech",    icon: "🎮", href: "/products?category=Gaming+%26+Tech" },
  { name: "Student Lifestyle", icon: "🎓", href: "/products?category=Student+Lifestyle" },
  { name: "Jewelry",          icon: "💎", href: "/products?category=Jewelry" },
  { name: "Pets",             icon: "🐕", href: "/products?category=Pets" },
  { name: "Automotive",       icon: "🚗", href: "/products?category=Automotive" },
  { name: "Travel",           icon: "✈️", href: "/products?category=Travel" },
  { name: "Kitchen",          icon: "🍳", href: "/products?category=Kitchen" },
  { name: "Office",           icon: "💼", href: "/products?category=Office" },
];

function SectionHeader({
  title,
  icon: Icon,
  href,
}: {
  title: string;
  icon?: React.ElementType;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="flex items-center gap-2 text-sm font-medium text-foreground">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ดูทั้งหมด
        </Link>
      )}
    </div>
  );
}

function ProductCard({
  product,
  badge,
  priority,
}: {
  product: Product;
  badge?: string;
  priority?: boolean;
}) {
  const imgSrc =
    product.image?.trim() || "https://placehold.co/600x600?text=No+Image";

  return (
    <Link
      href={`/product/${product.id}`}
      className="group bg-card border rounded-xl overflow-hidden flex flex-col hover:border-border/60 transition-colors"
    >
      <div className="aspect-square relative bg-muted overflow-hidden">
        <NextImage
          src={imgSrc}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, 25vw"
          priority={priority}
        />
        {badge && (
          <span className="absolute top-2 left-2 bg-background/90 backdrop-blur border text-[10px] text-muted-foreground px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-muted-foreground leading-snug line-clamp-2 mb-2 h-8">
          {product.name}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{formatCurrency(product.price)}</span>
          {product.rating && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {Number(product.rating).toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function HomepageClient({
  initialProducts = [],
}: {
  initialProducts?: Product[];
}) {
  const { t } = useLanguage();
  const [claimedCodes, setClaimedCodes] = useState<string[]>([]);
  const { recentlyViewed } = useRecentlyViewed();

  const products = initialProducts ?? [];
  const aiRecommended  = products.slice(0, 4);
  const popularTrending = products.slice(4, 12);
  const newArrivals    = products.slice(12, 16);

  const { user } = useRole();
  const { orders } = useGlobalData();

  useEffect(() => {
    if (user) {
      fetch(`/api/user-data/${user.id}`)
        .then(r => r.json())
        .then(data => {
          if (data.coupons) setClaimedCodes(data.coupons);
        });
    } else {
      const guestCoupons = localStorage.getItem("guest_coupons");
      if (guestCoupons) setClaimedCodes(JSON.parse(guestCoupons));
    }
  }, [user]);

  const handleClaim = async (code: string) => {
    if (claimedCodes.includes(code)) return;
    
    // Find the coupon rules
    const coupon = initialCoupons.find(c => c.code === code);
    if (!coupon) return;

    // Check conditions
    if (coupon.newMemberOnly) {
      if (!user) {
        toast.error("กรุณาเข้าสู่ระบบก่อนเก็บคูปองนี้");
        return;
      }
      // Usually, we'd check if user has orders, but for the hackathon context we can assume any logged in user can claim unless they already used it, or check the 'totalSpent' / 'orders'
      // Since we don't have orders directly here, we'll fetch user data or assume they are new if they have no reviews/cart?
      // Let's check user orders from useGlobalData
      const userOrders = orders.filter((o: any) => o.customerId === user.id);
      if (userOrders.length > 0) {
        toast.error("คูปองนี้สำหรับสมาชิกใหม่ที่ไม่เคยสั่งซื้อเท่านั้น");
        return;
      }
    }

    if (coupon.applicableRoles && coupon.applicableRoles.length > 0) {
      if (!user || !coupon.applicableRoles.includes(user.role as any)) {
        toast.error("คุณไม่เข้าเงื่อนไขสำหรับคูปองนี้ (เฉพาะผู้ใช้งานบางประเภท)");
        return;
      }
    }

    const newCoupons = [...claimedCodes, code];
    setClaimedCodes(newCoupons);

    if (user) {
      try {
        await fetch(`/api/user-data/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coupons: newCoupons })
        });
      } catch (e) {
        console.error("Failed to save coupon to user data", e);
      }
    } else {
      localStorage.setItem("guest_coupons", JSON.stringify(newCoupons));
    }

    toast.success(`คูปอง ${code} ถูกเก็บแล้ว!`);
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 animate-in fade-in duration-500">

      {/* ── Hero ── */}
      <section className="bg-background border-b px-4 lg:px-8 py-12 lg:py-16">
        <div className="max-w-xl mx-auto lg:mx-0 space-y-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary border rounded-full px-3 py-1">
            <Sparkles className="h-3 w-3" />
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
          >
            {t.home.shopNow}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <div className="divide-y">

        {/* ── Categories ── */}
        <section className="px-4 lg:px-8 py-6">
          <SectionHeader title={t.home.categories} />
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={`cat-${cat.name}-${i}`}
                href={cat.href}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-[11px] text-muted-foreground text-center leading-tight">
                  {(t.categories as Record<string, string>)[cat.name] || cat.name}
                </span>
              </Link>
            ))}
          </div>
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
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {coupon.code}
                  </p>
                  <p className="text-xl font-medium">
                    {coupon.type === "percent"
                      ? `${coupon.discount}% OFF`
                      : `฿${coupon.discount} OFF`}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    ขั้นต่ำ ฿0 · ไม่มีวันหมดอายุ
                  </p>
                  <button
                    onClick={() => handleClaim(coupon.code)}
                    disabled={claimed}
                    className={cn(
                      "mt-1 h-8 w-full rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors",
                      claimed
                        ? "bg-secondary text-muted-foreground cursor-default"
                        : "bg-secondary hover:bg-border text-foreground cursor-pointer"
                    )}
                  >
                    {claimed ? (
                      <>
                        <ShieldCheck className="h-3 w-3" />
                        {t.home.claimed}
                      </>
                    ) : (
                      <>
                        <Gift className="h-3 w-3" />
                        {t.home.claim}
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {aiRecommended.map((product, i) => (
              <ProductCard
                key={`ai-${product.id || i}`}
                product={product}
                priority={i < 2}
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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