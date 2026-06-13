"use client";

import { useCart } from "@/hooks/use-cart";
import { formatCurrency, getImgSrc, cn } from "@/lib/utils";
import { Trash2, ShoppingBag, ArrowLeft, Plus, Minus, CreditCard, Tag, CheckCircle2, LogIn, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import { useLanguage } from "@/hooks/use-language";
import { useState, useEffect, useMemo } from "react";
import { useGlobalData } from "@/hooks/use-global-data";
import { useRole } from "@/hooks/use-role";
import { Coupon } from "@/types";
import { toast } from "sonner";

export default function CartPage() {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    totalCount, 
    discountedTotal, 
    discountSummary, 
    appliedCoupon, 
    applyCoupon, 
    removeCoupon, 
    clearCart 
  } = useCart();
  const { addOrder, purchaseItems, coupons: allCoupons } = useGlobalData();
  const { t } = useLanguage();
  const { user, tier, role } = useRole();
  const router = useRouter();

  const isRestricted = role === "founder" || role === "partner";

  const [couponCode, setCouponCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [showCouponSelector, setShowCouponSelector] = useState(false);
  
  // Real owned coupons logic
  const [userOwnedCodes, setUserOwnedCodes] = useState<string[]>([]);
  const [usedCoupons, setUsedCoupons] = useState<string[]>([]);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const res = await fetch(`/api/user-data/${user.id}`);
          if (res.ok) {
            const data = await res.json();
            setUserOwnedCodes(data.coupons || []);
            // History check for used coupons could be more robust, 
            // but we'll use a specific 'used_coupons' key for this demo.
            const savedUsed = localStorage.getItem(`used_coupons_${user.id}`);
            if (savedUsed) setUsedCoupons(JSON.parse(savedUsed));
          }
        } catch (e) {
          console.error("Failed to load user coupons", e);
        }
      }
    };
    loadUserData();
  }, [user]);

  const myAvailableCoupons = useMemo(() => {
    return allCoupons.filter(c => userOwnedCodes.includes(c.code));
  }, [allCoupons, userOwnedCodes]);

  const handleApplyCouponInput = () => {
    const code = couponCode.toUpperCase().trim();
    
    if (!userOwnedCodes.includes(code)) {
      toast.error("คุณไม่มีคูปองนี้ / You don't own this coupon");
      return;
    }

    if (usedCoupons.includes(code)) {
      toast.error("คุณใช้โค้ดนี้ไปแล้ว / You have already used this coupon");
      return;
    }

    const coupon = allCoupons.find(c => c.code === code);
    if (coupon) {
      applyCoupon(coupon);
      setCouponCode("");
      toast.success(`ใช้คูปอง ${code} สำเร็จ!`);
    } else {
      toast.error("โค้ดไม่ถูกต้อง / Invalid coupon code");
    }
  };

  const selectCoupon = (coupon: Coupon) => {
    if (usedCoupons.includes(coupon.code)) {
      toast.error("คุณใช้โค้ดนี้ไปแล้ว / You have already used this coupon");
      return;
    }
    applyCoupon(coupon);
    setShowCouponSelector(false);
    toast.success(`ใช้คูปอง ${coupon.code} สำเร็จ!`);
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบก่อนชำระเงิน");
      router.push("/login");
      return;
    }

    if (!customerName.trim()) {
      toast.error("กรุณาใส่ชื่อผู้รับ");
      return;
    }

    if (appliedCoupon) {
      const newUsed = [...usedCoupons, appliedCoupon.code];
      setUsedCoupons(newUsed);
      localStorage.setItem(`used_coupons_${user.id}`, JSON.stringify(newUsed));
    }

    await purchaseItems(items.map(i => ({ productId: i.id, quantity: i.quantity })));

    const newOrder: any = {
      id: `ORD-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`,
      customerId: user.id,
      customerName: customerName,
      totalAmount: discountedTotal,
      originalAmount: discountSummary.subtotal,
      discounts: {
        tier: discountSummary.tierDiscount,
        bulk: discountSummary.bulkDiscount,
        coupon: discountSummary.couponDiscount,
        couponCode: appliedCoupon?.code || null,
        total: discountSummary.totalDiscount
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      paymentStatus: 'paid',
      items: items.map(i => ({
        productId: i.id,
        productName: i.name,
        quantity: i.quantity,
        price: i.price
      })),
      reviewedItems: []
    };

    await addOrder(newOrder);
    setIsPaid(true);
    clearCart();
    toast.success("สั่งซื้อสินค้าสำเร็จ!");
  };

  if (isPaid) {
    return (
      <div className="container mx-auto p-8 min-h-[60vh] flex flex-col items-center justify-center space-y-6 animate-in zoom-in-95 duration-700">
        <div className="p-8 rounded-full bg-emerald-500/10 shadow-inner">
          <CheckCircle2 className="h-20 w-20 text-emerald-500 animate-bounce" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black tracking-tight text-emerald-600">{t.cart.paymentSuccess}</h2>
          <p className="text-muted-foreground font-bold text-lg">{t.cart.paymentSuccessDesc}</p>
          <p className="font-black text-primary uppercase text-sm">Thank you, {customerName}!</p>
        </div>
        <Link href="/" className="mt-8 h-14 px-8 rounded-xl bg-primary text-primary-foreground font-black flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-primary/20 cursor-pointer">
          <ArrowLeft className="h-5 w-5" /> {t.cart.startShopping}
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto p-8 min-h-[60vh] flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-700">
        <div className="p-8 rounded-full bg-muted shadow-inner">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black tracking-tight">{t.cart.empty}</h2>
          <p className="text-muted-foreground font-medium">{t.cart.emptyDesc}</p>
        </div>
        <Link href="/products" className="h-14 px-8 rounded-xl bg-primary text-primary-foreground font-black flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-primary/20 cursor-pointer">
          <ArrowLeft className="h-5 w-5" /> {t.cart.startShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {isRestricted ? (
        <div className="bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-200 dark:border-rose-800 rounded-2xl p-4 lg:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-800">
              <CreditCard className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="font-black text-rose-900 dark:text-rose-100">{t.cart.restrictedTitle}</p>
              <p className="text-sm text-rose-700 dark:text-rose-300">{t.cart.restrictedDesc}</p>
            </div>
          </div>
        </div>
      ) : !user && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-4 lg:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-800">
              <LogIn className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-black text-amber-900 dark:text-amber-100">Login Required for Checkout</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">Please login to complete your purchase</p>
            </div>
          </div>
          <Link href="/login" className="h-12 px-6 rounded-xl bg-amber-500 text-white font-black hover:bg-amber-600 transition-all flex items-center gap-2 cursor-pointer shadow-lg">
            <LogIn className="h-5 w-5" /> Login Now
          </Link>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight">{t.cart.title} ({totalCount})</h1>
        <button onClick={clearCart} className="text-sm font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-2">
          <Trash2 className="h-4 w-4" /> {t.cart.clearAll}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-card border rounded-2xl p-4 lg:p-6 flex flex-col sm:flex-row gap-4 lg:gap-6 shadow-sm hover:shadow-md transition-shadow group relative">
              <Link href={`/products/${item.id}`} className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-xl overflow-hidden border bg-muted flex-shrink-0 mx-auto sm:mx-0 cursor-pointer block">
                <NextImage src={getImgSrc(item.image)} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
              </Link>
              <div className="flex-1 flex flex-col justify-between text-center sm:text-left">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <Link href={`/products/${item.id}`} className="text-lg lg:text-xl font-black tracking-tight leading-tight hover:text-primary transition-colors cursor-pointer block">
                      {item.name}
                    </Link>
                    <p className="text-[10px] lg:text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">{item.category}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-2 rounded-lg border text-muted-foreground hover:text-rose-50 hover:bg-rose-50 transition-all cursor-pointer hidden sm:block">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div className="flex items-center gap-3 bg-muted/50 p-1 rounded-lg border mx-auto sm:mx-0">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                      className="p-1 rounded-md hover:bg-background transition-colors cursor-pointer"
                    >
                      <Minus className="h-3 w-3 lg:h-4 lg:w-4" />
                    </button>
                    <span className="font-black text-xs lg:text-sm px-1 lg:px-2 w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                      className="p-1 rounded-md hover:bg-background transition-colors cursor-pointer"
                    >
                      <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
                    </button>
                  </div>
                  <div className="text-lg lg:text-xl font-black text-primary">{formatCurrency(item.price * item.quantity)}</div>
                </div>
                {/* Mobile Delete */}
                <button onClick={() => removeFromCart(item.id)} className="mt-4 p-2 text-rose-500 font-bold text-xs flex items-center justify-center gap-1 sm:hidden">
                   <Trash2 className="h-3 w-3" /> Remove Item
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="bg-card border-2 border-primary/10 rounded-3xl p-6 lg:p-8 shadow-xl shadow-primary/5 space-y-6 sticky top-24">
            <h3 className="text-2xl font-black tracking-tight">{t.cart.summary}</h3>
            
            {/* Customer Name */}
            <div className="space-y-2 pb-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recipient Name / ชื่อผู้รับ</label>
              <input 
                type="text" 
                placeholder="Enter your name..."
                required
                className="w-full px-5 py-3 rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-primary outline-none font-bold text-sm"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            {/* Coupon Section */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1 group">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder={t.cart.discountCode}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-transparent bg-muted/50 focus:bg-background focus:border-primary/20 outline-none transition-all font-bold uppercase text-sm"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                </div>
                <button onClick={handleApplyCouponInput} className="px-4 lg:px-6 rounded-xl bg-secondary font-black text-xs lg:text-sm hover:bg-secondary/80 transition-all cursor-pointer">
                  {t.cart.apply}
                </button>
              </div>
              
              <button 
                onClick={() => setShowCouponSelector(true)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-primary/5 border-2 border-primary/10 hover:bg-primary/10 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-primary" />
                  <span className="text-xs font-black uppercase tracking-widest text-primary">เลือกคูปองของคุณ ({myAvailableCoupons.length})</span>
                </div>
                <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="space-y-4">
              {/* VIP Badge */}
              {tier === 'VIP' && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                  <span>VIP Member</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded">-10%</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-muted-foreground uppercase text-[10px] tracking-widest">
                <span>{t.cart.subtotal}</span>
                <span>{formatCurrency(discountSummary.subtotal)}</span>
              </div>
              <div className="flex justify-between font-bold text-muted-foreground uppercase text-[10px] tracking-widest">
                <span>{t.cart.shipping}</span>
                <span className="text-emerald-500">{tier === 'VIP' ? 'ฟรี (VIP)' : t.cart.free}</span>
              </div>

              {/* Tier Discount */}
              {discountSummary.tierDiscount > 0 && (
                <div className="flex justify-between font-bold text-amber-500 uppercase text-[10px] tracking-widest">
                  <span>ส่วนลด VIP (10%)</span>
                  <span>-{formatCurrency(discountSummary.tierDiscount)}</span>
                </div>
              )}

              {/* Bulk Discount */}
              {discountSummary.bulkDiscount > 0 && (
                <div className="flex justify-between font-bold text-blue-500 uppercase text-[10px] tracking-widest">
                  <span>ส่วนลดจำนวนมาก</span>
                  <span>-{formatCurrency(discountSummary.bulkDiscount)}</span>
                </div>
              )}

              {/* Coupon Discount */}
              {appliedCoupon && (
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2 font-bold text-rose-500 uppercase text-[10px] tracking-widest">
                    <Tag className="h-3 w-3" />
                    <span>Coupon: {appliedCoupon.code}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-rose-500">-{formatCurrency(discountSummary.couponDiscount)}</span>
                    <button onClick={removeCoupon} className="p-1 hover:bg-rose-50 rounded cursor-pointer">
                      <Minus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              <div className="h-px bg-muted w-full my-2" />
              <div className="flex justify-between items-end">
                <span className="font-black text-base lg:text-lg">{t.cart.total}</span>
                <span className="text-2xl lg:text-3xl font-black text-primary tracking-tighter">{formatCurrency(discountedTotal)}</span>
              </div>

              {/* Savings Badge */}
              {discountSummary.totalDiscount > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 text-center">
                  <p className="text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-widest">
                    ประหยัด {formatCurrency(discountSummary.totalDiscount)} ในการสั่งซื้อนี้!
                  </p>
                </div>
              )}
            </div>
            <button 
              onClick={handleCheckout}
              disabled={isRestricted}
              className={cn(
                "w-full h-14 lg:h-16 rounded-xl font-black text-base lg:text-lg shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer",
                isRestricted 
                  ? "bg-muted text-muted-foreground cursor-not-allowed grayscale" 
                  : "bg-primary text-primary-foreground shadow-primary/20 hover:opacity-90 active:scale-95"
              )}
            >
              <CreditCard className="h-5 w-5 lg:h-6 lg:w-6" /> {isRestricted ? t.cart.restrictedTitle : t.cart.checkout}
            </button>
          </div>
        </div>
      </div>

      {/* Coupon Selector Modal */}
      {showCouponSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-md rounded-[2.5rem] border-2 border-primary/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-primary text-primary-foreground flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                <Tag className="h-6 w-6" /> คูปองที่ฉันเก็บไว้
              </h3>
              <button onClick={() => setShowCouponSelector(false)} className="p-2 hover:bg-white/10 rounded-full cursor-pointer"><X /></button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {myAvailableCoupons.length > 0 ? myAvailableCoupons.map((coupon) => {
                const isUsed = usedCoupons.includes(coupon.code);
                const isSelected = appliedCoupon?.code === coupon.code;
                const isMeetingMin = discountSummary.subtotal >= (coupon.minPurchase || 0);

                return (
                  <div 
                    key={coupon.code}
                    onClick={() => !isUsed && isMeetingMin && selectCoupon(coupon)}
                    className={cn(
                      "p-5 rounded-2xl border-2 transition-all flex justify-between items-center group relative overflow-hidden",
                      isUsed ? "bg-muted opacity-50 grayscale cursor-not-allowed" : 
                      isSelected ? "border-primary bg-primary/5 cursor-default" : 
                      !isMeetingMin ? "opacity-60 border-muted grayscale cursor-not-allowed" :
                      "border-muted hover:border-primary/30 bg-card cursor-pointer"
                    )}
                  >
                    <div className="space-y-1 relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg tracking-tight">{coupon.code}</span>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                        {isUsed && <span className="text-[8px] font-black uppercase bg-muted-foreground text-white px-2 py-0.5 rounded">USED</span>}
                      </div>
                      <p className="text-xs font-bold text-muted-foreground">{coupon.description}</p>
                      {!isMeetingMin && !isUsed && (
                        <p className="text-[9px] font-black text-rose-500 uppercase">ซื้อเพิ่มอีก {formatCurrency((coupon.minPurchase || 0) - discountSummary.subtotal)} เพื่อใช้โค้ดนี้</p>
                      )}
                    </div>
                    <div className="text-right relative z-10">
                      <p className="text-2xl font-black text-primary tracking-tighter">
                        {coupon.type === 'percent' ? `-${coupon.discount}%` : `-฿${coupon.discount}`}
                      </p>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-12 space-y-4">
                  <div className="p-4 rounded-full bg-muted w-16 h-16 flex items-center justify-center mx-auto">
                    <Tag className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                  <p className="text-muted-foreground font-bold italic uppercase text-xs">คุณยังไม่ได้เก็บคูปองใดๆ / No coupons collected</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-muted/20">
              <button 
                onClick={() => setShowCouponSelector(false)}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:opacity-90 transition-all cursor-pointer"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
