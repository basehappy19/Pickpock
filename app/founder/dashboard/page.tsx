"use client";

import { useRole } from "@/hooks/use-role";
import { useLanguage } from "@/hooks/use-language";
import { 
  BarChart3, 
  Users, 
  Package, 
  TrendingUp, 
  ShoppingBag, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  MoreVertical,
  Search,
  Filter,
  Loader2,
  Plus,
  ShieldCheck,
  Star
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import AccessRestricted from "@/components/shared/access-restricted";

export default function FounderDashboardPage() {
  const { role, user } = useRole();
  const { t } = useLanguage();
  const [dashboardData, setDashboardData] = useState<any>({
    orders: [],
    users: [],
    products: [],
    stores: [],
    loading: true
  });

  const isFounder = role === "founder";

  const fetchAllData = async () => {
    try {
      const [ordersRes, usersRes, productsRes, storesRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/users"),
        fetch("/api/products"),
        fetch("/api/stores")
      ]);

      const [orders, users, products, stores] = await Promise.all([
        ordersRes.json(),
        usersRes.json(),
        productsRes.json(),
        storesRes.json()
      ]);

      setDashboardData({
        orders: Array.isArray(orders) ? orders : [],
        users: Array.isArray(users) ? users : [],
        products: Array.isArray(products) ? products : [],
        stores: Array.isArray(stores) ? stores : [],
        loading: false
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
      setDashboardData((prev: any) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const stats = useMemo(() => {
    if (dashboardData.loading) return [];

    const productLookup = dashboardData.products.reduce((acc: any, p: any) => {
      acc[p.product_id || p.id] = p;
      return acc;
    }, {});

    const globalRevenue = dashboardData.orders.reduce((sum: number, o: any) => sum + (o.total_price || 0), 0);
    
    const mallRevenue = dashboardData.orders.reduce((sum: number, o: any) => {
      const orderMallTotal = o.items.reduce((itemSum: number, item: any) => {
        const product = productLookup[item.product_id];
        if (product && (product.isOfficial || product.storeId === "mall")) {
          return o.total_price; 
        }
        return 0;
      }, 0);
      return sum + (orderMallTotal > 0 ? o.total_price : 0);
    }, 0);

    return [
      { label: t.dashboard.stats.revenue + " (Global)", value: formatCurrency(globalRevenue), change: "+12.5%", trend: "up", icon: TrendingUp, color: "text-emerald-500" },
      { label: "Mall Sales (Founder)", value: formatCurrency(mallRevenue), change: "+8.2%", trend: "up", icon: ShoppingBag, color: "text-amber-500" },
      { label: t.dashboard.stats.users, value: dashboardData.users.length.toLocaleString(), change: "+5.2%", trend: "up", icon: Users, color: "text-blue-500" },
      { label: t.dashboard.stats.products, value: dashboardData.products.length.toLocaleString(), change: "-2.1%", trend: "down", icon: Package, color: "text-purple-500" },
    ];
  }, [dashboardData, t]);

  if (!isFounder && !dashboardData.loading) {
    return <AccessRestricted requiredRole={["founder"]} currentPage="Founder Dashboard" />;
  }

  if (dashboardData.loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="font-black text-xs uppercase tracking-widest text-muted-foreground animate-pulse">Syncing platform data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter">{t.dashboard.founderTitle}</h1>
          <p className="text-muted-foreground font-bold">{t.dashboard.founderSubtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border-2 border-primary/5 rounded-[2rem] p-6 shadow-xl shadow-primary/5 space-y-4">
            <div className="flex justify-between items-start">
              <div className={cn("p-3 rounded-2xl bg-muted", stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black tracking-tighter">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card border-2 border-primary/5 rounded-[2.5rem] shadow-2xl shadow-primary/5 overflow-hidden">
          <div className="p-8 border-b">
            <h3 className="text-xl font-black tracking-tight">Active Partner Stores</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-muted/20">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Store Details</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.stats.rating}</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.table.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dashboardData.stores.map((store: any) => (
                  <tr key={store.store_id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary uppercase">
                          {store.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-sm">{store.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground">Owner ID: {store.owner_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-[10px] font-black">{store.rating}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", store.status === "active" ? "bg-emerald-500" : "bg-amber-500")} />
                        <span className="text-[10px] font-black uppercase tracking-tight text-emerald-600">{store.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-card border-2 border-primary/10 rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 space-y-6">
             <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Inventory Alerts</h3>
             <div className="space-y-4">
               {dashboardData.products.filter((p: any) => p.stock < 10).slice(0, 5).map((p: any) => (
                 <div key={p.product_id || p.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-amber-500" />
                      <p className="text-[10px] font-black uppercase truncate max-w-[120px]">{p.name}</p>
                    </div>
                    <span className="text-[10px] font-black text-amber-600">{p.stock} {t.product.quantity}</span>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
