/**
 * KPI Dashboard Component
 * Comprehensive analytics for Founder and Partner dashboards
 */

"use client";

import { LineChart, BarChart, DonutChart, StatCard, KPITable } from "./charts";
import { cn, formatCurrency } from "@/lib/utils";
import { TrendingUp, Users, Package, ShoppingBag, Star, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useMemo } from "react";
import { calculateFounderKPIs, generateRevenueChartData, generateCategoryDistribution, calculateStorePerformance, getLowStockProducts, calculateRevenueShare } from "@/services/analytics/analytics-service";
import { Product, Order } from "@/types";
import { useLanguage } from "@/hooks/use-language";

interface KPIDashboardProps {
  orders: Order[];
  products: Product[];
  stores: any[];
  users?: any[];
  storeId?: string; // If provided, filters for specific store (Partner view)
}

export function KPIDashboard({ orders, products, stores, users = [], storeId }: KPIDashboardProps) {
  const { t } = useLanguage();
  const isPartnerView = !!storeId;

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (isPartnerView) {
      const partnerProducts = products.filter(p => p.storeId === storeId);
      const partnerProductIds = new Set(partnerProducts.map(p => p.id));

      const partnerOrders = orders.filter(o =>
        o.items.some(item => partnerProductIds.has(item.productId))
      );

      const totalRevenue = partnerOrders.reduce((sum, o) => {
        return sum + o.items.reduce((itemSum, item) => {
          return partnerProductIds.has(item.productId) ? itemSum + (item.price * item.quantity) : itemSum;
        }, 0);
      }, 0);

      const uniqueCustomers = new Set(partnerOrders.map(o => o.customerId)).size;

      return {
        totalRevenue,
        totalOrders: partnerOrders.length,
        totalProducts: partnerProducts.length,
        totalUsers: uniqueCustomers,
        averageOrderValue: partnerOrders.length > 0 ? totalRevenue / partnerOrders.length : 0,
        conversionRate: uniqueCustomers > 0 ? (partnerOrders.length / uniqueCustomers) * 100 : 0,
        customerRetention: 0
      };
    }

    return calculateFounderKPIs(orders, products, users);
  }, [orders, products, users, storeId, isPartnerView]);

  // Revenue chart data
  const revenueChartData = useMemo(() => {
    const filteredOrders = isPartnerView
      ? orders.filter(o => {
          const partnerProducts = products.filter(p => p.storeId === storeId);
          const partnerProductIds = new Set(partnerProducts.map(p => p.id));
          return o.items.some(item => partnerProductIds.has(item.productId));
        })
      : orders;

    return generateRevenueChartData(filteredOrders, 'daily');
  }, [orders, products, storeId, isPartnerView]);

  // Category distribution
  const categoryData = useMemo(() => {
    const filteredProducts = isPartnerView
      ? products.filter(p => p.storeId === storeId)
      : products;

    return generateCategoryDistribution(filteredProducts);
  }, [products, storeId, isPartnerView]);

  // Revenue share (Founder only)
  const revenueShare = useMemo(() => {
    if (isPartnerView) return null;
    return calculateRevenueShare(orders, products);
  }, [orders, products, isPartnerView]);

  // Store performance (Founder only)
  const storePerformance = useMemo(() => {
    if (isPartnerView) return [];
    return calculateStorePerformance(orders, products, stores);
  }, [orders, products, stores, isPartnerView]);

  // Low stock alerts
  const lowStockProducts = useMemo(() => {
    const filteredProducts = isPartnerView
      ? products.filter(p => p.storeId === storeId)
      : products;

    return getLowStockProducts(filteredProducts, 10);
  }, [products, storeId, isPartnerView]);

  // Stats cards
  const stats = useMemo(() => [
    {
      label: t.dashboard.stats.revenue,
      value: formatCurrency(kpis.totalRevenue),
      change: "+12.5%",
      trend: 'up' as const,
      icon: TrendingUp,
      color: "text-emerald-500"
    },
    {
      label: t.dashboard.orders,
      value: kpis.totalOrders.toLocaleString(),
      change: "+8.2%",
      trend: 'up' as const,
      icon: ShoppingBag,
      color: "text-blue-500"
    },
    {
      label: isPartnerView ? t.dashboard.customers : t.dashboard.users,
      value: kpis.totalUsers.toLocaleString(),
      change: "+5.2%",
      trend: 'up' as const,
      icon: Users,
      color: "text-purple-500"
    },
    {
      label: t.dashboard.products,
      value: kpis.totalProducts.toLocaleString(),
      change: "-2.1%",
      trend: 'down' as const,
      icon: Package,
      color: "text-amber-500"
    }
  ], [kpis, isPartnerView, t]);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-card border-2 border-primary/5 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black tracking-tight uppercase">{t.dashboard.salesTrendTitle}</h3>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t.dashboard.salesPerformanceTitle}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-black uppercase tracking-widest">
              <TrendingUp className="h-3.5 w-3.5" /> {t.dashboard.salesTrendValue}
            </div>
          </div>

          <LineChart
            data={revenueChartData}
            color="text-primary"
            height={250}
          />

          <div className="flex justify-between text-xs font-black text-muted-foreground uppercase tracking-widest px-1">
            {revenueChartData.map(d => (
              <span key={d.label}>{d.label}</span>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-card border-2 border-primary/5 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 space-y-6">
          <h3 className="text-xl font-black tracking-tight uppercase">{t.dashboard.categoryDistribution}</h3>
          <BarChart
            data={categoryData.slice(0, 5).map(cat => ({
              label: cat.category,
              value: cat.count
            }))}
            horizontal
          />
        </div>
      </div>

      {/* Additional Analytics for Founder */}
      {!isPartnerView && (
        <>
          {/* Revenue Share */}
          {revenueShare && (
            <div className="bg-card border-2 border-primary/5 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 space-y-8 flex flex-col items-center justify-center">
              <div className="text-center">
                <h3 className="text-xl font-black tracking-tight uppercase">{t.dashboard.revenueShareTitle}</h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pickpock Mall vs Partners</p>
              </div>

              <DonutChart
                data={[
                  { label: 'Official', value: revenueShare.officialRevenue, color: 'text-primary' },
                  { label: 'Partner', value: revenueShare.partnerRevenue, color: 'text-amber-500' }
                ]}
                centerContent={
                  <>
                    <span className="text-4xl font-black tracking-tighter">
                      {revenueShare.officialPercentage.toFixed(0)}%
                    </span>
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Official</span>
                  </>
                }
              />

              <div className="w-full grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span className="text-xs font-black uppercase tracking-tight">
                    Official ({revenueShare.officialPercentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="text-xs font-black uppercase tracking-tight">
                    Partners ({revenueShare.partnerPercentage.toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Store Performance Rankings */}
          {storePerformance.length > 0 && (
            <KPITable
              columns={[
                { key: 'store', label: t.dashboard.storeTitle },
                { key: 'revenue', label: t.dashboard.stats.revenue },
                { key: 'orders', label: t.dashboard.orders },
                { key: 'rating', label: t.dashboard.rating },
                { key: 'trend', label: t.dashboard.trend }
              ]}
              data={storePerformance.slice(0, 5).map(store => ({
                store: (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary uppercase">
                      {store.storeName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-sm">{store.storeName}</p>
                      <p className="text-xs font-bold text-muted-foreground">ID: {store.storeId.slice(0, 8)}</p>
                    </div>
                  </div>
                ),
                revenue: (
                  <span className="font-black text-sm">{formatCurrency(store.revenue)}</span>
                ),
                orders: <span className="text-xs font-black">{store.orders}</span>,
                rating: (
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="text-xs font-black">{store.avgRating.toFixed(1)}</span>
                  </div>
                ),
                trend: (
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-black",
                    store.growthRate >= 0 ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {store.growthRate >= 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(store.growthRate).toFixed(1)}%
                  </div>
                )
              }))}
            />
          )}
        </>
      )}

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-card border-2 border-primary/10 rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
            {t.dashboard.inventoryAlerts}
          </h3>
          <div className="space-y-4">
            {lowStockProducts.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-xs font-black uppercase truncate max-w-[200px]">{product.name}</p>
                    <p className="text-[8px] text-muted-foreground">{product.category}</p>
                  </div>
                </div>
                <span className={cn(
                  "text-xs font-black px-2 py-1 rounded-lg",
                  product.stock === 0 ? "bg-rose-500/10 text-rose-600" :
                  product.stock < 5 ? "bg-amber-500/10 text-amber-600" :
                  "bg-blue-500/10 text-blue-600"
                )}>
                  {product.stock} {t.dashboard.pieces}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
