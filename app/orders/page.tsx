"use client";

import { useGlobalData } from "@/hooks/use-global-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Package, Truck, CheckCircle2, Clock, Search, ShieldCheck, User } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useRole } from "@/hooks/use-role";
import AccessRestricted from "@/components/shared/access-restricted";

export default function OrdersPage() {
  const { t } = useLanguage();
  const { orders, products } = useGlobalData();
  const { role } = useRole();

  if (role === "customer") {
    return <AccessRestricted requiredRole={["founder"]} currentPage="Orders Management" />;
  }

  // Filter orders based on items belonging to the seller or all for founder
  const filteredOrders = orders.filter(order => {
    if (role === "founder") return true;
    // For Seller, only show orders that contain products they "own" 
    // (In this mock, let's say products NOT from MSU Official belong to the seller)
    return order.items.some(item => {
      const prod = products.find(p => p.id === item.productId);
      return prod && !prod.isOfficial;
    });
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'shipped': return <Truck className="h-4 w-4 text-blue-500" />;
      case 'processing': return <Clock className="h-4 w-4 text-amber-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    return t.orders.status[status as keyof typeof t.orders.status] || status;
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-8 animate-in fade-in duration-700 pb-20 lg:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
             {role === "founder" ? "Platform Orders" : "Store Orders"}
          </h1>
          <p className="text-muted-foreground font-medium">
             {role === "founder" ? "Monitor every transaction across the platform." : t.orders.subtitle}
          </p>
        </div>
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input 
            type="text" 
            placeholder={t.orders.searchPlaceholder}
            className="w-full pl-10 pr-4 py-3 rounded-xl border bg-card focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="p-20 text-center rounded-3xl border-2 border-dashed bg-muted/20">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground font-bold">No orders found / ยังไม่มีคำสั่งซื้อ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-card border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="p-6 border-b bg-muted/20 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-background border shadow-sm">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg">{order.id}</h3>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t.orders.totalAmount}</p>
                    <p className="text-xl font-black text-primary">{formatCurrency(order.totalAmount)}</p>
                  </div>
                  <div className="px-4 py-2 rounded-full border bg-background flex items-center gap-2 font-bold text-sm shadow-sm">
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{getStatusText(order.status)}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-tighter">{t.orders.items}</span>
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-tighter">{t.orders.qtyPrice}</span>
                  </div>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="font-bold text-sm lg:text-base">{item.productName}</div>
                      <div className="flex gap-4 text-sm font-black">
                        <span className="text-muted-foreground">x{item.quantity}</span>
                        <span className="text-primary">{formatCurrency(item.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 flex justify-between items-center pt-6 border-t border-dashed">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary uppercase border border-primary/20">
                      {order.customerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-foreground uppercase tracking-tight">{order.customerName}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">{t.orders.customer} ID: {order.customerId}</p>
                    </div>
                  </div>
                  <button className="px-6 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-black text-xs uppercase tracking-widest hover:bg-secondary/80 transition-all cursor-pointer border shadow-sm">
                    {t.orders.viewDetails}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
