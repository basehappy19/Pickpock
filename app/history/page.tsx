"use client";

import { useState, useEffect } from "react";
import { Order, Review, Product } from "@/types";
import { useLanguage } from "@/hooks/use-language";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Package, Star, MessageSquare, CheckCircle2, ChevronRight, X, Loader2 } from "lucide-react";
import NextImage from "next/image";
import { mockProducts } from "@/lib/initial-data";
import { useRole } from "@/hooks/use-role";
import AccessRestricted from "@/components/shared/access-restricted";

export default function HistoryPage() {
  const { t } = useLanguage();
  const { role } = useRole();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{orderId: string, productId: string, productName: string} | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSearching] = useState(false);

  useEffect(() => {
    // Load local history (including newly paid orders)
    const savedOrders = localStorage.getItem("orderHistory");
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  if (role !== "customer") {
    return <AccessRestricted requiredRole={["customer"]} currentPage="Purchase History" />;
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      const updatedOrders = orders.map(o => {
        if (o.id === selectedItem.orderId) {
          return {
            ...o,
            reviewedItems: [...(o.reviewedItems || []), selectedItem.productId]
          };
        }
        return o;
      });
      
      setOrders(updatedOrders);
      localStorage.setItem("orderHistory", JSON.stringify(updatedOrders));
      setIsReviewModalOpen(false);
      setIsSearching(false);
      setSelectedItem(null);
      setRating(5);
      setComment("");
      alert(t.reviews.success);
    }, 1000);
  };

  if (orders.length === 0) {
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
        <h1 className="text-4xl font-black tracking-tight">{t.history.title}</h1>
        <p className="text-muted-foreground font-medium">{t.history.subtitle}</p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-card border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6 border-b bg-muted/20 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-background border shadow-sm">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-black text-lg">{order.id}</h3>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{t.history.orderDate} {formatDate(order.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-black uppercase tracking-widest border border-emerald-500/20">
                  {t.orders.status[order.status as keyof typeof t.orders.status] || order.status}
                </span>
                <div className="text-xl font-black text-primary">{formatCurrency(order.totalAmount)}</div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {order.items.map((item, idx) => {
                const isReviewed = order.reviewedItems?.includes(item.productId);
                const productData = mockProducts.find(p => p.id === item.productId);

                return (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 first:pt-0 last:pb-0 border-b last:border-0 border-muted/50">
                    <div className="relative h-20 w-20 rounded-xl overflow-hidden border bg-muted flex-shrink-0">
                      <NextImage src={productData?.image || ""} alt={item.productName} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-sm lg:text-base leading-tight">{item.productName}</h4>
                      <p className="text-xs text-muted-foreground font-bold mt-1">x{item.quantity} • {formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isReviewed ? (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground text-xs font-black uppercase tracking-widest border">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {t.history.reviewed}
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            setSelectedItem({ orderId: order.id, productId: item.productId, productName: item.productName });
                            setIsReviewModalOpen(true);
                          }}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 cursor-pointer"
                        >
                          <Star className="h-3.5 w-3.5" />
                          {t.history.writeReview}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-lg rounded-3xl border-2 border-primary/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-rainbow-gradient border-b flex justify-between items-center">
              <h3 className="text-2xl font-black tracking-tight">{t.reviews.submitTitle}</h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full cursor-pointer"><X /></button>
            </div>
            <form onSubmit={handleReviewSubmit} className="p-8 space-y-8">
              <div className="text-center space-y-4">
                <p className="font-bold text-muted-foreground uppercase text-xs tracking-widest">{selectedItem.productName}</p>
                <div className="flex justify-center gap-2 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      type="button" 
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star className={`h-10 w-10 ${star <= rating ? "fill-current" : ""}`} />
                    </button>
                  ))}
                </div>
                <p className="text-lg font-black text-primary uppercase">{rating} / 5 STARS</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.reviews.rating}</label>
                <textarea 
                  required
                  placeholder={t.reviews.commentPlaceholder}
                  className="w-full h-32 px-5 py-4 rounded-2xl bg-muted/50 border-none focus:ring-2 focus:ring-primary outline-none font-medium text-sm resize-none"
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
