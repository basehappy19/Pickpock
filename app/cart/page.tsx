"use client";

import { useCart } from "@/hooks/use-cart";
import { formatCurrency, getImgSrc, cn } from "@/lib/utils";
import { Trash2, ShoppingBag, ArrowLeft, Plus, Minus, CreditCard, Tag, CheckCircle2, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import { useLanguage } from "@/hooks/use-language";
import { useState } from "react";
import { initialCoupons } from "@/lib/initial-data";
import { useGlobalData } from "@/hooks/use-global-data";
import { useRole } from "@/hooks/use-role";

export default function CartPage() {
  const { items, removeFromCart, addToCart, updateQuantity, totalCount, totalPrice, discountedTotal, discountSummary, appliedCoupon, applyCoupon, removeCoupon, clearCart } = useCart();
  const { addOrder, purchaseItems } = useGlobalData();
  const { t } = useLanguage();
  const { user, tier, role } = useRole();
  const router = useRouter();

  const isRestricted = role === "founder" || role === "partner";

  const [couponCode, setCouponCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isPaid, setIsPaid] = useState(false);

  const handleApplyCoupon = () => {
    const coupon = initialCoupons.find(c => c.code === couponCode.toUpperCase());
    if (coupon) {
      applyCoupon(coupon);
      setCouponCode("");
    } else {
      alert("Invalid coupon code / โค้ดไม่ถูกต้อง");
    }
  };

  const handleCheckout = async () => {
    // Check if user is logged in
    if (!user) {
      alert("Please login to checkout / กรุณาเข้าสู่ระบบก่อนชำระเงิน");
      router.push("/login");
      return;
    }

    if (!customerName.trim()) {
      alert("Please enter your name before checkout / กรุณาใส่ชื่อของคุณก่อนชำระเงิน");
      return;
    }

    // Reduce stock globally and sync to JSON
    await purchaseItems(items.map(i => ({ productId: i.id, quantity: i.quantity })));

    // Create real order object with discount summary
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

    // Add order to global state and sync to ecommerce_orders.json
    await addOrder(newOrder);

    // Finalize process
    setIsPaid(true);
    clearCart(); // This now correctly clears from server if logged in
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
    <div className="container mx-auto p-4 lg:p-8 space-y-8 animate-in fade-in duration-700">
      {isRestricted ? (
        <div className="bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-200 dark:border-rose-800 rounded-2xl p-4 lg:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-800">
              <CreditCard className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="font-black text-rose-900 dark:text-rose-100">Management Account Restricted</p>
              <p className="text-sm text-rose-700 dark:text-rose-300">Founders and Partners are not allowed to make purchases. Please use a member account.</p>
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
            <div key={item.id} className="bg-card border rounded-2xl p-4 lg:p-6 flex flex-col sm:flex-row gap-4 lg:gap-6 shadow-sm hover:shadow-md transition-shadow group">
              <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-xl overflow-hidden border bg-muted flex-shrink-0 mx-auto sm:mx-0">
                <NextImage src={getImgSrc(item.image)} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex-1 flex flex-col justify-between text-center sm:text-left">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg lg:text-xl font-black tracking-tight leading-tight">{item.name}</h3>
                    <p className="text-[10px] lg:text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">{item.category}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-2 rounded-lg border text-muted-foreground hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer hidden sm:block">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div className="flex items-center gap-3 bg-muted/50 p-1 rounded-lg border mx-auto sm:mx-0">
                    <button onClick={() => removeFromCart(item.id)} className="p-1 rounded-md hover:bg-background transition-colors cursor-pointer"><Minus className="h-3 w-3 lg:h-4 lg:w-4" /></button>
                    <span className="font-black text-xs lg:text-sm px-1 lg:px-2 w-4 text-center">{item.quantity}</span>
                    <button onClick={() => addToCart(item)} className="p-1 rounded-md hover:bg-background transition-colors cursor-pointer"><Plus className="h-3 w-3 lg:h-4 lg:w-4" /></button>
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
              <button onClick={handleApplyCoupon} className="px-4 lg:px-6 rounded-xl bg-secondary font-black text-xs lg:text-sm hover:bg-secondary/80 transition-all cursor-pointer">
                {t.cart.apply}
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
              <CreditCard className="h-5 w-5 lg:h-6 lg:w-6" /> {isRestricted ? "Restricted for Management" : t.cart.checkout}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
