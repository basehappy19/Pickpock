"use client";

import { useState, useEffect, useMemo } from "react";
import { Order, Review, Product } from "@/types";
import { useLanguage } from "@/hooks/use-language";
import { formatCurrency, formatDate, cn, getImgSrc } from "@/lib/utils";
import { Package, Star, MessageSquare, CheckCircle2, X, Loader2, Box } from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import { useRole } from "@/hooks/use-role";
import AccessRestricted from "@/components/shared/access-restricted";
import { useGlobalData } from "@/hooks/use-global-data";
import { toast } from "sonner";

export default function HistoryPage() {
  const { t, language } = useLanguage();
  const { role, user } = useRole();
  const { orders, products, updateProduct } = useGlobalData();
  
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{orderId: string, productId: string, productName: string} | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter and sort orders for the logged-in user (newest first)
  const userOrders = useMemo(() => {
    return [...orders]
      .filter(o => o.customerId === user?.id)
      // Hide orders that are CANCELLED or have no valid items currently in the shop
      .filter(o => {
        const hasValidItems = o.items.some(item => products.some(p => p.id === item.productId));
        return o.status.toLowerCase() !== "cancelled" && hasValidItems;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, products, user]);

  // Secondary filter for items within an order (hide specific items if their product is gone)
  const getValidItems = (orderItems: any[]) => {
    return orderItems.filter(item => products.some(p => p.id === item.productId));
  };

  if (role !== "customer") {
    return <AccessRestricted requiredRole={["customer"]} currentPage="Purchase History" />;
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !user) return;

    setIsSubmitting(true);
    
    try {
      // 1. Find product and add review to products.json
      const product = products.find(p => p.id === selectedItem.productId);
      if (product) {
        const newReview: Review = {
          id: `rev-${Date.now()}`,
          user: user.name,
          rating,
          comment,
          date: new Date().toISOString().split('T')[0],
          productId: product.id
        };
        
        const updatedReviews = [newReview, ...(product.reviews || [])];
        const newRating = parseFloat(((product.rating * (product.reviews?.length || 0) + rating) / (updatedReviews.length)).toFixed(1));
        
        const updatedProduct = {
          ...product,
          reviews: updatedReviews,
          rating: newRating
        };
        
        await fetch("/api/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedProduct)
        });
      }

      // 2. Mark item as reviewed in ecommerce_orders.json
      const order = orders.find(o => o.id === selectedItem.orderId);
      if (order) {
        const updatedOrder = {
          ...order,
          reviewedItems: [...(order.reviewedItems || []), selectedItem.productId]
        };
        
        await fetch("/api/orders", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedOrder)
        });
      }

      // 3. Force re-fetch global data to sync UI
      window.location.reload();

      toast.success(t.reviews.success);
    } catch (error) {
      console.error("Failed to submit review", error);
      toast.error("Failed to save review to JSON database");
    } finally {
      setIsSubmitting(false);
      setIsReviewModalOpen(false);
      setSelectedItem(null);
    }
  };

  if (userOrders.length === 0) {
    return (
      <div className="container mx-auto p-8 min-h-[60vh] flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-700 text-center">
        <div className="p-8 rounded-full bg-muted shadow-inner">
          <Package className="h-16 w-16 text-muted-foreground/50" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight">{t.history.noHistory}</h2>
          <p className="text-muted-foreground font-medium">{t.history.subtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-0 sm:p-4 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-700 pb-28 lg:pb-8">
      <div className="space-y-2 text-center lg:text-left px-4 sm:px-0 mt-4 sm:mt-0">
        <h1 className="text-4xl font-semibold tracking-tight uppercase tracking-tighter">
          {t.history.title}
        </h1>
        <p className="text-muted-foreground font-medium">{t.history.subtitle}</p>
      </div>

      <div className="space-y-8">
        {userOrders.map((order) => (
          <div key={order.id} className="bg-card border-y sm:border-2 border-primary/5 sm:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
            {/* Order Header / Row Join */}
            <div className="p-6 lg:p-8 border-b bg-muted/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-3xl bg-background border shadow-inner text-primary">
                  <Package className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-xl lg:text-2xl tracking-tighter">{order.id}</h3>
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-widest border",
                      order.status.toLowerCase() === "delivered" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                      order.status.toLowerCase() === "shipped" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                      order.status.toLowerCase() === "pending" ? "bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse" :
                      "bg-muted text-muted-foreground border-muted-foreground/20"
                    )}>
                      {t.orders.status[order.status.toLowerCase() as keyof typeof t.orders.status] || order.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-[0.1em]">
                    {t.history.orderDate} {formatDate(order.createdAt, language)}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:items-end gap-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t.history.totalInvestment}</p>
                <div className="text-3xl lg:text-4xl font-semibold text-primary tracking-tighter">
                  {formatCurrency(order.totalAmount)}
                </div>
                {order.discounts && order.discounts.total > 0 && (
                  <div className="flex flex-col items-end mt-2 pt-2 border-t border-primary/10 w-full md:w-64">
                    <div className="flex justify-between w-full text-xs font-medium text-muted-foreground uppercase">
                      <span>{t.history.subtotal}</span>
                      <span>{formatCurrency(order.originalAmount || order.totalAmount)}</span>
                    </div>
                    {order.discounts.tier > 0 && (
                      <div className="flex justify-between w-full text-xs font-semibold text-emerald-600 uppercase">
                        <span>{t.history.vipDiscount}</span>
                        <span>-{formatCurrency(order.discounts.tier)}</span>
                      </div>
                    )}
                    {order.discounts.coupon > 0 && (
                      <div className="flex justify-between w-full text-xs font-semibold text-rose-600 uppercase">
                        <span>Coupon ({order.discounts.couponCode})</span>
                        <span>-{formatCurrency(order.discounts.coupon)}</span>
                      </div>
                    )}
                    <div className="flex justify-between w-full text-xs font-semibold text-primary uppercase mt-1">
                      <span>{t.history.netPrice}</span>
                      <span>{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items Table Join */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-muted/10">
                  <tr>
                    <th className="px-8 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t.history.productDetails}</th>
                    <th className="px-8 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground hidden sm:table-cell">{t.history.price}</th>
                    <th className="px-8 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground hidden sm:table-cell text-center">{t.history.qty}</th>
                    <th className="px-8 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground text-right">{t.history.subtotal}</th>
                    <th className="px-8 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t.history.action}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/30">
                  {order.items.map((item, idx) => {
                    const isReviewed = order.reviewedItems?.includes(item.productId);
                    const productData = products.find(p => p.id === item.productId);

                    return (
                      <tr key={idx} className="group hover:bg-muted/5 transition-colors">
                        <td className="px-8 py-6">
                          <Link href={`/product/${item.productId}`} className="flex items-center gap-6 cursor-pointer group/link block w-full">
                            <div className="relative h-20 w-20 rounded-2xl overflow-hidden border bg-muted flex-shrink-0 shadow-sm group-hover/link:scale-105 transition-transform duration-500">
                              {productData?.image ? (
                                <NextImage 
                                  src={getImgSrc(productData.image)} 
                                  alt={item.productName} 
                                  fill 
                                  className="object-cover" 
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-muted">
                                  <Box className="h-8 w-8 text-muted-foreground/20" />
                                </div>
                              )}
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-semibold text-base lg:text-lg leading-tight group-hover/link:text-primary transition-colors group-hover/link:underline">
                                {item.productName || productData?.name}
                              </h4>
                              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest no-underline">
                                {productData?.category ? ((t.categories as Record<string, string>)[productData.category] || productData.category) : "General"}
                              </p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-8 py-6 hidden sm:table-cell font-medium text-sm">
                          {formatCurrency(item.price || 0)}
                        </td>
                        <td className="px-8 py-6 hidden sm:table-cell text-center font-semibold">
                          {item.quantity}
                        </td>
                        <td className="px-8 py-6 text-right font-semibold text-primary">
                          {formatCurrency((item.price || 0) * item.quantity)}
                        </td>
                        <td className="px-8 py-6">
                          {isReviewed ? (
                            <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-semibold uppercase tracking-tighter border border-emerald-100">
                              <CheckCircle2 className="h-3 w-3" />
                              {t.history.reviewed}
                            </div>
                          ) : (
                            <button 
                              onClick={() => {
                                setSelectedItem({ orderId: order.id, productId: item.productId, productName: item.productName });
                                setIsReviewModalOpen(true);
                              }}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-tighter hover:opacity-90 transition-all shadow-lg shadow-primary/10 cursor-pointer active:scale-95 whitespace-nowrap"
                            >
                              <Star className="h-3 w-3" />
                              {t.history.writeReview}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center sm:p-4 p-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card w-full h-[100dvh] sm:h-auto max-w-lg sm:rounded-[2.5rem] sm:border-2 border-primary/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="p-8 bg-rainbow-gradient border-b flex justify-between items-center text-primary shrink-0">
              <h3 className="text-2xl font-semibold tracking-tight uppercase tracking-tighter">{t.reviews.submitTitle}</h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full cursor-pointer transition-colors"><X /></button>
            </div>
            <form onSubmit={handleReviewSubmit} className="p-8 space-y-8 flex-1 overflow-y-auto">
              <div className="text-center space-y-4">
                <p className="font-semibold text-muted-foreground uppercase text-xs tracking-widest">{selectedItem.productName}</p>
                <div className="flex justify-center gap-2 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      type="button" 
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star className={`h-12 w-12 ${star <= rating ? "fill-current" : "opacity-20"}`} />
                    </button>
                  ))}
                </div>
                <p className="text-xl font-semibold text-primary uppercase tracking-tighter">{rating} / 5 STARS</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-2">{t.reviews.rating}</label>
                <textarea 
                  required
                  placeholder={t.reviews.commentPlaceholder}
                  className="w-full h-32 px-6 py-4 rounded-3xl bg-muted/50 border-none focus:ring-2 focus:ring-primary outline-none font-medium text-sm resize-none"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-semibold text-lg shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <MessageSquare className="h-6 w-6" />}
                {t.reviews.submit}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
