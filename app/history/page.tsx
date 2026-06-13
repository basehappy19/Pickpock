"use client";

import { useState, useEffect } from "react";
import { Order, Review, Product } from "@/types";
import { useLanguage } from "@/hooks/use-language";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Package, Star, MessageSquare, CheckCircle2, X, Loader2, Box } from "lucide-react";
import NextImage from "next/image";
import { useRole } from "@/hooks/use-role";
import AccessRestricted from "@/components/shared/access-restricted";
import { useGlobalData } from "@/hooks/use-global-data";

export default function HistoryPage() {
  const { t } = useLanguage();
  const { role, user } = useRole();
  const { orders, products, updateProduct } = useGlobalData();
  
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{orderId: string, productId: string, productName: string} | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter orders for the logged-in user
  const userOrders = orders.filter(o => o.customerId === user?.id);

  if (role !== "customer") {
    return <AccessRestricted requiredRole={["customer"]} currentPage="Purchase History" />;
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !user) return;

    setIsSubmitting(true);
    
    // 1. Update the order to mark item as reviewed
    const updatedOrders = orders.map(o => {
      if (o.id === selectedItem.orderId) {
        return {
          ...o,
          reviewedItems: [...(o.reviewedItems || []), selectedItem.productId]
        };
      }
      return o;
    });

    // 2. Add review to the product
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
      
      const updatedProduct = {
        ...product,
        reviews: [newReview, ...(product.reviews || [])],
        // Update avg rating
        rating: parseFloat(((product.rating * (product.reviews?.length || 0) + rating) / ((product.reviews?.length || 0) + 1)).toFixed(1))
      };
      
      await updateProduct(updatedProduct);
    }

    // Since we don't have a specific Order Update API, we rely on the product update 
    // or we could add an /api/orders update later. For now, this syncs the UI.
    
    setTimeout(() => {
      setIsReviewModalOpen(false);
      setIsSubmitting(false);
      setSelectedItem(null);
      setRating(5);
      setComment("");
      alert(t.reviews.success);
    }, 800);
  };

  if (userOrders.length === 0) {
    return (
      <div className="container mx-auto p-8 min-h-[60vh] flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-700 text-center">
        <div className="p-8 rounded-full bg-muted shadow-inner">
          <Package className="h-16 w-16 text-muted-foreground/50" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">{t.history.noHistory}</h2>
          <p className="text-muted-foreground font-medium">{t.history.subtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-8 animate-in fade-in duration-700 pb-20 lg:pb-8">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-4xl font-black tracking-tight uppercase tracking-tighter">
          {t.history.title}
        </h1>
        <p className="text-muted-foreground font-bold">{t.history.subtitle}</p>
      </div>

      <div className="space-y-8">
        {userOrders.map((order) => (
          <div key={order.id} className="bg-card border-2 border-primary/5 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
            {/* Order Header / Row Join */}
            <div className="p-6 lg:p-8 border-b bg-muted/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-3xl bg-background border shadow-inner text-primary">
                  <Package className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-black text-xl lg:text-2xl tracking-tighter">{order.id}</h3>
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                      {t.orders.status[order.status as keyof typeof t.orders.status] || order.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.1em]">
                    {t.history.orderDate} {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:items-end gap-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Investment</p>
                <div className="text-3xl lg:text-4xl font-black text-primary tracking-tighter">
                  {formatCurrency(order.totalAmount)}
                </div>
              </div>
            </div>

            {/* Order Items Table Join */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-muted/10">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product Details</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden sm:table-cell">Price</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden sm:table-cell text-center">Qty</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Subtotal</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/30">
                  {order.items.map((item, idx) => {
                    const isReviewed = order.reviewedItems?.includes(item.productId);
                    const productData = products.find(p => p.id === item.productId);

                    return (
                      <tr key={idx} className="group hover:bg-muted/5 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-6">
                            <div className="relative h-20 w-20 rounded-2xl overflow-hidden border bg-muted flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-500">
                              {productData?.image ? (
                                <NextImage 
                                  src={productData.image} 
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
                              <h4 className="font-black text-base lg:text-lg leading-tight group-hover:text-primary transition-colors">
                                {item.productName || productData?.name}
                              </h4>
                              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                                {productData?.category || "General"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 hidden sm:table-cell font-bold text-sm">
                          {formatCurrency(item.price || 0)}
                        </td>
                        <td className="px-8 py-6 hidden sm:table-cell text-center font-black">
                          {item.quantity}
                        </td>
                        <td className="px-8 py-6 text-right font-black text-primary">
                          {formatCurrency((item.price || 0) * item.quantity)}
                        </td>
                        <td className="px-8 py-6">
                          {isReviewed ? (
                            <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-tighter border border-emerald-100">
                              <CheckCircle2 className="h-3 w-3" />
                              {t.history.reviewed}
                            </div>
                          ) : (
                            <button 
                              onClick={() => {
                                setSelectedItem({ orderId: order.id, productId: item.productId, productName: item.productName });
                                setIsReviewModalOpen(true);
                              }}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-tighter hover:opacity-90 transition-all shadow-lg shadow-primary/10 cursor-pointer active:scale-95 whitespace-nowrap"
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-lg rounded-[2.5rem] border-2 border-primary/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-rainbow-gradient border-b flex justify-between items-center text-primary">
              <h3 className="text-2xl font-black tracking-tight uppercase tracking-tighter">{t.reviews.submitTitle}</h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full cursor-pointer transition-colors"><X /></button>
            </div>
            <form onSubmit={handleReviewSubmit} className="p-8 space-y-8">
              <div className="text-center space-y-4">
                <p className="font-black text-muted-foreground uppercase text-xs tracking-widest">{selectedItem.productName}</p>
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
                <p className="text-xl font-black text-primary uppercase tracking-tighter">{rating} / 5 STARS</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">{t.reviews.rating}</label>
                <textarea 
                  required
                  placeholder={t.reviews.commentPlaceholder}
                  className="w-full h-32 px-6 py-4 rounded-3xl bg-muted/50 border-none focus:ring-2 focus:ring-primary outline-none font-bold text-sm resize-none"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
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
