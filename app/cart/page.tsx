"use client";

import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { Trash2, ShoppingBag, ArrowLeft, Plus, Minus, CreditCard } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { useLanguage } from "@/hooks/use-language";

export default function CartPage() {
  const { items, removeFromCart, addToCart, totalCount, totalPrice, clearCart } = useCart();
  const { t } = useLanguage();

  if (items.length === 0) {
    return (
      <div className="container mx-auto p-8 min-h-[60vh] flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-700">
        <div className="p-8 rounded-full bg-muted shadow-inner">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black tracking-tight">Your cart is empty</h2>
          <p className="text-muted-foreground font-medium">Looks like you haven't added anything to your cart yet.</p>
        </div>
        <Link href="/products" className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-black flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-primary/20 cursor-pointer">
          <ArrowLeft className="h-5 w-5" /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black tracking-tight">Shopping Cart ({totalCount})</h1>
        <button onClick={clearCart} className="text-sm font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-2">
          <Trash2 className="h-4 w-4" /> Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-card border rounded-[2rem] p-6 flex flex-col sm:flex-row gap-6 shadow-sm hover:shadow-md transition-shadow group">
              <div className="relative h-32 w-full sm:w-32 rounded-2xl overflow-hidden border bg-muted flex-shrink-0">
                <NextImage src={item.image} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xl font-black tracking-tight leading-tight">{item.name}</h3>
                    <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mt-1">{item.category}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-2.5 rounded-xl border text-muted-foreground hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div className="flex items-center gap-3 bg-muted/50 p-1 rounded-xl border">
                    <button onClick={() => removeFromCart(item.id)} className="p-1.5 rounded-lg hover:bg-background transition-colors cursor-pointer"><Minus className="h-4 w-4" /></button>
                    <span className="font-black text-sm px-2 w-4 text-center">{item.quantity}</span>
                    <button onClick={() => addToCart(item)} className="p-1.5 rounded-lg hover:bg-background transition-colors cursor-pointer"><Plus className="h-4 w-4" /></button>
                  </div>
                  <div className="text-xl font-black text-primary">{formatCurrency(item.price * item.quantity)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="bg-card border-2 border-primary/10 rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 space-y-6 sticky top-24">
            <h3 className="text-2xl font-black tracking-tight">Order Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between font-bold text-muted-foreground uppercase text-xs tracking-widest">
                <span>Subtotal</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between font-bold text-muted-foreground uppercase text-xs tracking-widest">
                <span>Shipping</span>
                <span className="text-emerald-500">FREE</span>
              </div>
              <div className="h-px bg-muted w-full my-4" />
              <div className="flex justify-between items-end">
                <span className="font-black text-lg">Total</span>
                <span className="text-3xl font-black text-primary tracking-tighter">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
            <button className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer">
              <CreditCard className="h-6 w-6" /> Checkout Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
