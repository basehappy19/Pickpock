"use client";

import { useGlobalData } from "@/hooks/use-global-data";
import { cn, formatCurrency, formatDate, getImgSrc } from "@/lib/utils";
import { Package, Truck, CheckCircle2, Clock, Search, ShieldCheck, User, Eye } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useRole } from "@/hooks/use-role";
import AccessRestricted from "@/components/shared/access-restricted";
import Link from "next/link";

export default function OrdersPage() {
  const { t } = useLanguage();
  const { orders, products, updateOrderStatus } = useGlobalData();
  const { role, user } = useRole();

  if (role === "customer") {
    return <AccessRestricted requiredRole={["founder", "partner"]} currentPage="Orders Management" />;
  }

  // Filter orders based on items belonging to the seller or all for founder
  const filteredOrders = orders.filter(order => {
    if (role === "founder") return true;
    
    // For Partner (Store Owner), show orders that contain products from their store
    if (role === "partner" && user?.store) {
      return order.items.some(item => {
        const prod = products.find(p => p.id === item.productId);
        return prod && prod.storeId === user.store?.store_id;
      });
    }

    return false;
  });

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'shipped': return <Truck className="h-4 w-4 text-blue-500" />;
      case 'processing': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-amber-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    return t.orders.status[status.toLowerCase() as keyof typeof t.orders.status] || status;
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-8 animate-in fade-in duration-700 pb-20 lg:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">
             {role === "founder" ? "Platform Orders" : (user?.store?.name || "Store Orders")}
          </h1>
          <p className="text-muted-foreground font-bold">
             {role === "founder" ? "Monitor every transaction across the platform." : `Manage orders for ${user?.store?.name || "your store"}.`}
          </p>
        </div>
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input 
            type="text" 
            placeholder={t.orders.searchPlaceholder}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-card focus:border-primary outline-none transition-all font-bold"
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="p-20 text-center rounded-[3rem] border-4 border-dashed bg-muted/20">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground font-black text-xl uppercase tracking-widest">No orders found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-card border-2 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/5 hover:shadow-primary/10 transition-all border-primary/5">
              <div className="p-8 border-b bg-muted/30 flex flex-wrap justify-between items-center gap-6">
                <div className="flex items-center gap-5">
                  <div className="p-4 rounded-[1.5rem] bg-background border-2 border-primary/10 shadow-lg shadow-primary/5 text-primary">
                    <Package className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl tracking-tight">{order.id}</h3>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-70">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-70">{t.orders.totalAmount}</p>
                    <p className="text-2xl font-black text-primary tracking-tighter">{formatCurrency(order.totalAmount)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select 
                        className={cn(
                            "text-[10px] font-black uppercase tracking-tight bg-background border-2 rounded-xl px-4 py-2.5 outline-none cursor-pointer transition-all shadow-sm",
                            order.status.toUpperCase() === "PENDING" ? "border-amber-500/20 text-amber-600 focus:border-amber-500" : 
                            order.status.toUpperCase() === "DELIVERED" ? "border-emerald-500/20 text-emerald-600 focus:border-emerald-500" :
                            "border-primary/20 text-primary focus:border-primary"
                        )}
                        value={order.status.toUpperCase()}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    >
                        <option value="PENDING">{t.orders.status.pending}</option>
                        <option value="PROCESSING">{t.orders.status.processing}</option>
                        <option value="SHIPPED">{t.orders.status.shipped}</option>
                        <option value="DELIVERED">{t.orders.status.delivered}</option>
                        <option value="CANCELLED">{t.orders.status.cancelled}</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-muted">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t.orders.items}</span>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t.orders.qtyPrice}</span>
                  </div>
                  <div className="space-y-4">
                    {order.items.map((item, idx) => {
                      const product = products.find(p => p.id === item.productId);
                      return (
                        <div key={idx} className="flex justify-between items-center group">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-muted overflow-hidden border-2 border-transparent group-hover:border-primary/20 transition-all shadow-sm">
                                <img src={getImgSrc(product?.image)} className="w-full h-full object-cover" alt={item.productName} />
                            </div>
                            <div>
                                <Link href={`/products/${item.productId}`} className="font-black text-sm lg:text-base hover:text-primary transition-colors">{item.productName}</Link>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{product?.category || "Category"}</p>
                            </div>
                          </div>
                          <div className="flex gap-6 text-sm font-black items-center">
                            <span className="text-muted-foreground bg-muted px-2 py-1 rounded-lg">x{item.quantity}</span>
                            <span className="text-primary text-base tracking-tighter">{formatCurrency(item.price)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t-2 border-dashed border-muted">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary uppercase border-2 border-primary/20 shadow-inner">
                      {order.customerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-base font-black text-foreground uppercase tracking-tight leading-none mb-1">{order.customerName}</p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-70">
                        {t.orders.customer} ID: <span className="text-primary">{order.customerId}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl bg-muted text-foreground font-black text-[10px] uppercase tracking-widest hover:bg-muted/80 transition-all cursor-pointer border-2 border-transparent hover:border-primary/10 shadow-sm flex items-center justify-center gap-2">
                        <Eye className="h-4 w-4" />
                        {t.orders.viewDetails}
                    </button>
                    <button className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all cursor-pointer shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
                        Print Invoice
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
