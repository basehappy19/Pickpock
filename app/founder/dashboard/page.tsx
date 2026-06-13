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
  Star,
  Edit,
  Trash2,
  X,
  Image as ImageIcon,
  Settings,
  Eye,
  Sparkles
} from "lucide-react";
import { cn, formatCurrency, getImgSrc } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import AccessRestricted from "@/components/shared/access-restricted";
import { uploadProductImage } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";

export default function FounderDashboardPage() {
  const { role, user } = useRole();
  const { t } = useLanguage();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>({
    orders: [],
    users: [],
    products: [],
    stores: [],
    loading: true
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [newProduct, setNewProduct] = useState({
    id: "",
    name: "",
    price: 0,
    category: "อิเล็กทรอนิกส์",
    stock: 0,
    image: "",
    description: "",
    storeId: "mall",
    isOfficial: true
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const url = await uploadProductImage(file);
    if (url) {
      setNewProduct(prev => ({ ...prev, image: url }));
    } else {
      alert(t.dashboard.uploadFailed);
    }
    setIsUploading(false);
  };

  const generateAIDescription = async () => {
    if (!newProduct.name) {
      alert(t.dashboard.enterProductName);
      return;
    }

    setIsGeneratingDesc(true);
    try {
      const res = await fetch("/api/ai/product-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: newProduct.name,
          category: newProduct.category,
          language: "both"
        })
      });

      const data = await res.json();
      if (data.success && data.description) {
        const desc = data.description;
        setNewProduct(prev => ({
          ...prev,
          description: desc.th || desc.en || desc.description || desc
        }));
      }
    } catch (e) {
      console.error("AI generation failed", e);
      alert(t.dashboard.generateFailed);
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleAddOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!newProduct.id;
    const method = isEditing ? "PUT" : "POST";
    const productId = isEditing ? newProduct.id : "p-" + Math.random().toString(36).substr(2, 9);

    try {
      const res = await fetch("/api/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProduct,
          id: productId,
          product_id: productId,
          rating: 4.5,
          reviews: [],
          createdAt: new Date().toISOString()
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewProduct({ id: "", name: "", price: 0, category: "อิเล็กทรอนิกส์", stock: 0, image: "", description: "", storeId: "mall", isOfficial: true });
        fetchAllData(); // Refresh
      }
    } catch (e) {
      console.error("Failed to save product", e);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm(t.dashboard.deleteConfirm)) return;
    try {
      await fetch(`/api/products?id=${productId}`, { method: "DELETE" });
      fetchAllData();
    } catch (e) {
      console.error("Failed to delete product", e);
    }
  };

  const openEditModal = (product: any) => {
    setNewProduct({
      id: product.product_id || product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      image: product.image,
      description: product.description || "",
      storeId: product.storeId || "mall",
      isOfficial: product.isOfficial ?? true
    });
    setShowAddModal(true);
  };

  const [timeRange, setTimeRange] = useState<"12months" | "30days">("12months");

  // Calculate real analytics data
  const analyticsData = useMemo(() => {
    if (dashboardData.loading) {
      return {
        categoryDistribution: [],
        revenueShare: { official: 0, partners: 0 },
        salesTrend: [],
        topProducts: [],
        topStores: [],
        percentChange: 0,
        lowStockProducts: []
      };
    }

    const { orders, products, stores } = dashboardData;
    
    // Product and Store mapping
    const productMap = products.reduce((acc: any, p: any) => {
      acc[p.id || p.product_id] = p;
      return acc;
    }, {});

    const storeMap = stores.reduce((acc: any, s: any) => {
      acc[s.store_id] = s;
      return acc;
    }, {});

    // Map product to store
    const productToStoreMap: Record<string, any> = {};
    stores.forEach((store: any) => {
      if (store.products) {
        store.products.forEach((pid: string) => {
          productToStoreMap[pid] = store;
        });
      }
    });
    // Also check product.storeId
    products.forEach((p: any) => {
      const pid = p.id || p.product_id;
      if (!productToStoreMap[pid] && p.storeId) {
        productToStoreMap[pid] = storeMap[p.storeId];
      }
    });

    // Time ranges setup
    const now = new Date("2026-06-13T23:59:59Z"); // Simulated current date
    let trendLabels: string[] = [];
    let salesByLabel: Record<string, number> = {};
    let comparisonStartDate: Date;
    let comparisonEndDate: Date;
    let currentPeriodRevenue = 0;
    let prevPeriodRevenue = 0;

    if (timeRange === "12months") {
      // Last 12 Months
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        const label = d.toLocaleString('th-TH', { month: 'short', year: '2-digit' });
        trendLabels.push(label);
        salesByLabel[label] = 0;
      }
      comparisonStartDate = new Date(now);
      comparisonStartDate.setFullYear(comparisonStartDate.getFullYear() - 1);
      comparisonEndDate = now;
      
      const prevYearStart = new Date(comparisonStartDate);
      prevYearStart.setFullYear(prevYearStart.getFullYear() - 1);
      const prevYearEnd = new Date(comparisonStartDate);

      orders.forEach((order: any) => {
        const orderTime = new Date(order.timestamp);
        const total = order.total_price || 0;
        const label = orderTime.toLocaleString('th-TH', { month: 'short', year: '2-digit' });

        if (salesByLabel[label] !== undefined) {
          salesByLabel[label] += total;
        }

        if (orderTime >= comparisonStartDate && orderTime <= now) {
          currentPeriodRevenue += total;
        } else if (orderTime >= prevYearStart && orderTime <= prevYearEnd) {
          prevPeriodRevenue += total;
        }
      });
    } else {
      // Last 30 Days
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const label = d.toISOString().split('T')[0];
        trendLabels.push(label);
        salesByLabel[label] = 0;
      }
      comparisonStartDate = new Date(now);
      comparisonStartDate.setDate(comparisonStartDate.getDate() - 29);
      comparisonEndDate = now;

      const prev30DaysStart = new Date(comparisonStartDate);
      prev30DaysStart.setDate(prev30DaysStart.getDate() - 30);
      const prev30DaysEnd = new Date(comparisonStartDate);

      orders.forEach((order: any) => {
        const orderDate = order.timestamp.split('T')[0];
        const orderTime = new Date(order.timestamp);
        const total = order.total_price || 0;

        if (salesByLabel[orderDate] !== undefined) {
          salesByLabel[orderDate] += total;
        }

        if (orderTime >= comparisonStartDate && orderTime <= now) {
          currentPeriodRevenue += total;
        } else if (orderTime >= prev30DaysStart && orderTime <= prev30DaysEnd) {
          prevPeriodRevenue += total;
        }
      });
    }

    const salesTrend = trendLabels.map(label => ({
      day: timeRange === "30days" ? new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short' }).format(new Date(label)) : label,
      amount: salesByLabel[label]
    }));

    // Calculate percent change
    const percentChange = prevPeriodRevenue > 0 
      ? Math.round(((currentPeriodRevenue - prevPeriodRevenue) / prevPeriodRevenue) * 100) 
      : 12;

    // Top Products and Stores based on current selected period
    const productSalesStats: Record<string, { name: string, sales: number, revenue: number }> = {};
    const storeSalesStats: Record<string, { name: string, sales: number, revenue: number }> = {};

    orders.forEach((order: any) => {
      const orderTime = new Date(order.timestamp);
      if (orderTime < comparisonStartDate || orderTime > now) return;

      order.items.forEach((item: any) => {
        const product = productMap[item.product_id];
        const store = productToStoreMap[item.product_id] || (product?.isOfficial ? { name: t.dashboard.officialMall, store_id: "mall" } : null);
        
        if (product) {
          if (!productSalesStats[item.product_id]) {
            productSalesStats[item.product_id] = { name: product.name, sales: 0, revenue: 0 };
          }
          productSalesStats[item.product_id].sales += item.qty;
          productSalesStats[item.product_id].revenue += (product.price * item.qty);
        }

        if (store) {
          if (!storeSalesStats[store.store_id]) {
            storeSalesStats[store.store_id] = { name: store.name, sales: 0, revenue: 0 };
          }
          storeSalesStats[store.store_id].sales += item.qty;
          storeSalesStats[store.store_id].revenue += (product?.price || 0) * item.qty;
        }
      });
    });

    const topProducts = Object.values(productSalesStats)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    const topStores = Object.values(storeSalesStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Category distribution
    const categoryCounts = products.reduce((acc: any, p: any) => {
      const cat = p.category || 'Other';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const totalProducts = products.length;
    const categoryDistribution = Object.entries(categoryCounts)
      .map(([label, count]) => ({
        label,
        count: Math.round(((count as number) / totalProducts) * 100),
        color: ['bg-blue-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500'][Object.keys(categoryCounts).indexOf(label) % 5]
      }))
      .sort((a, b) => b.count - a.count);

    return {
      salesTrend,
      percentChange,
      topProducts,
      topStores,
      categoryDistribution,
      revenueShare: { official: 100, partners: 0 },
      lowStockProducts: products.filter((p: any) => (p.stock || 0) < 10)
    };
  }, [dashboardData, timeRange, t]);

  const stats = useMemo(() => {
    if (dashboardData.loading) return [];

    const totalRevenue = dashboardData.orders.reduce((sum: number, o: any) => sum + (o.total_price || 0), 0);
    const mallRevenue = dashboardData.orders.reduce((sum: number, o: any) => {
      const isMallOrder = o.items.some((item: any) => {
        const product = dashboardData.products.find((p: any) => (p.id || p.product_id) === item.product_id);
        return product && (product.isOfficial || product.storeId === "mall");
      });
      return sum + (isMallOrder ? o.total_price : 0);
    }, 0);

    return [
      { label: t.dashboard.stats.revenue + " (Global)", value: formatCurrency(totalRevenue), change: "+12.5%", trend: "up", icon: TrendingUp, color: "text-emerald-500" },
      { label: t.dashboard.stats.revenue + " (Mall)", value: formatCurrency(mallRevenue), change: "+8.2%", trend: "up", icon: ShoppingBag, color: "text-amber-500" },
      { label: t.dashboard.stats.users, value: dashboardData.users.length.toLocaleString(), change: "+5.2%", trend: "up", icon: Users, color: "text-blue-500" },
      { label: t.dashboard.stats.products, value: dashboardData.products.length.toLocaleString(), change: "-2.1%", trend: "down", icon: Package, color: "text-purple-500" },
    ];
  }, [dashboardData, t]);

  if (!isFounder && !dashboardData.loading) {
    return <AccessRestricted requiredRole={["founder"]} currentPage={t.dashboard.founderTitle} />;
  }

  if (dashboardData.loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="font-black text-xs uppercase tracking-widest text-muted-foreground animate-pulse">{t.dashboard.syncing}</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter">{t.dashboard.founderTitle}</h1>
          <p className="text-muted-foreground font-bold">{t.dashboard.founderSubtitle}</p>
        </div>

        <div className="flex bg-muted p-1 rounded-xl shrink-0">
          <button
            onClick={() => setTimeRange("12months")}
            className={cn(
              "px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
              timeRange === "12months" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-primary"
            )}
          >
            12 {t.common.monthly}
          </button>
          <button
            onClick={() => setTimeRange("30days")}
            className={cn(
              "px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
              timeRange === "30days" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-primary"
            )}
          >
            30 {t.common.daily}
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
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

      {/* Analytics Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Trend - Recharts Area Chart */}
        <div className="lg:col-span-2 bg-card border-2 border-primary/5 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black tracking-tight uppercase">{t.dashboard.salesAnalytics}</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {timeRange === '12months' ? t.dashboard.monthlyReport : t.dashboard.dailyReport}
              </p>
            </div>

            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
              analyticsData.percentChange >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
            )}>
              {analyticsData.percentChange >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {analyticsData.percentChange >= 0 ? "+" : ""}{analyticsData.percentChange}% {t.dashboard.vsLastWeek}
            </div>
          </div>

          <div className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData.salesTrend}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#888' }}
                  dy={10}
                />
                <YAxis 
                  hide 
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '1rem', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '10px',
                    fontWeight: 900,
                    textTransform: 'uppercase'
                  }}
                  formatter={(value: number) => [formatCurrency(value), "ยอดขาย"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#6366f1" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products - Bar Chart */}
        <div className="bg-card border-2 border-primary/5 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 space-y-6">
          <h3 className="text-xl font-black tracking-tight uppercase">{t.dashboard.topProducts}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.topProducts} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 8, fontWeight: 800, fill: '#666' }}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', fontSize: '10px', fontWeight: 900 }}
                  formatter={(value: number) => [`${value} ${t.dashboard.units}`, t.dashboard.salesCount]}
                />
                <Bar dataKey="sales" radius={[0, 10, 10, 0]}>
                  {analyticsData.topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#a855f7'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Stores - Bar Chart */}
        <div className="lg:col-span-2 bg-card border-2 border-primary/5 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 space-y-6">
          <h3 className="text-xl font-black tracking-tight uppercase">{t.dashboard.topStores}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.topStores}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#888' }}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', fontSize: '10px', fontWeight: 900 }}
                  formatter={(value: number) => [formatCurrency(value), t.dashboard.totalRevenue]}
                />
                <Bar dataKey="revenue" radius={[10, 10, 0, 0]}>
                  {analyticsData.topStores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#a855f7'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share - Progress Bars */}
        <div className="bg-card border-2 border-primary/5 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 space-y-6">
          <h3 className="text-xl font-black tracking-tight uppercase">{t.dashboard.categoryDistribution}</h3>
          <div className="space-y-5">
            {analyticsData.categoryDistribution.length > 0 ? (
              analyticsData.categoryDistribution.slice(0, 5).map((cat) => (
                <div key={cat.label} className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span>{cat.label}</span>
                    <span className="text-muted-foreground">{cat.count}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-1000", cat.color)}
                      style={{ width: `${cat.count}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground text-sm py-8">{t.dashboard.noData}</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Market Share - Donut Chart */}
        <div className="bg-card border-2 border-primary/5 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 space-y-8 flex flex-col items-center justify-center">
          <div className="text-center">
            <h3 className="text-xl font-black tracking-tight uppercase">{t.dashboard.revenueShare}</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t.dashboard.revenueShareDesc}</p>
          </div>

          <div className="relative h-48 w-48">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                    data={[
                      { name: t.dashboard.officialMall, value: analyticsData.revenueShare.official },
                      { name: t.dashboard.partnerStore, value: analyticsData.revenueShare.partners }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                 >
                   <Cell fill="#6366f1" />
                   <Cell fill="#f59e0b" />
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-4xl font-black tracking-tighter">{analyticsData.revenueShare.official}%</span>
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{t.dashboard.officialMall}</span>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-4">
             <div className="flex items-center gap-2">
               <div className="h-3 w-3 rounded-full bg-primary" />
               <span className="text-[10px] font-black uppercase tracking-tight">{t.dashboard.officialMall} ({analyticsData.revenueShare.official}%)</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="h-3 w-3 rounded-full bg-amber-500" />
               <span className="text-[10px] font-black uppercase tracking-tight">{t.dashboard.partnerStore} ({analyticsData.revenueShare.partners}%)</span>
             </div>
          </div>
        </div>

        {/* Detailed Sales Info */}
        <div className="lg:col-span-2 bg-card border-2 border-primary/5 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 space-y-6">
           <h3 className="text-xl font-black tracking-tight uppercase">{t.dashboard.salesByStore}</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="border-b">
                   <th className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.partnerStore}</th>
                   <th className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.salesCount}</th>
                   <th className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">{t.dashboard.totalRevenue}</th>
                 </tr>
               </thead>
               <tbody className="divide-y">
                 {analyticsData.topStores.map((store, i) => (
                   <tr key={i} className="group">
                     <td className="py-4">
                       <p className="font-black text-sm">{store.name}</p>
                     </td>
                     <td className="py-4 text-[10px] font-black uppercase">{store.sales} {t.dashboard.units}</td>
                     <td className="py-4 text-right font-black text-sm">{formatCurrency(store.revenue)}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>

      {/* Stores and Alerts Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card border-2 border-primary/5 rounded-[2.5rem] shadow-2xl shadow-primary/5 overflow-hidden">
          <div className="p-8 border-b">
            <h3 className="text-xl font-black tracking-tight">{t.dashboard.activeStores}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-muted/20">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.storeDetails}</th>
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
                          <p className="text-[10px] font-bold text-muted-foreground">{t.dashboard.ownerId} {store.owner_id}</p>
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
             <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.inventoryAlerts}</h3>
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

      {/* Product Management Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight uppercase">{t.dashboard.platformInventory}</h2>
          <button
             onClick={() => {
               setNewProduct({ id: "", name: "", price: 0, category: "อิเล็กทรอนิกส์", stock: 0, image: "", description: "", storeId: "mall", isOfficial: true });
               setShowAddModal(true);
             }}
             className="h-10 px-4 rounded-xl bg-primary text-primary-foreground flex items-center gap-2 font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20"
           >
             <Plus className="h-3.5 w-3.5" /> {t.dashboard.addProduct}
           </button>
        </div>

        <div className="bg-card border-2 border-primary/5 rounded-[2.5rem] shadow-2xl shadow-primary/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-muted/20">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.table.name}</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.assignedStore}</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.table.stock}</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.table.price}</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">{t.dashboard.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dashboardData.products.map((product: any) => (
                  <tr key={product.product_id || product.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 overflow-hidden">
                          <img src={getImgSrc(product.image)} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-black text-sm max-w-[200px] truncate">{product.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={cn(
                         "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                         product.isOfficial ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"
                       )}>
                         {product.isOfficial ? t.dashboard.officialMall : (dashboardData.stores.find((s:any) => s.store_id === product.storeId)?.name || t.dashboard.partnerStore)}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black">{product.stock} {t.product.quantity}</span>
                    </td>
                    <td className="px-8 py-6 font-black text-sm">{formatCurrency(product.price)}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(product)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.product_id || product.id)}
                          className="p-2 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-lg rounded-[2.5rem] border-2 border-primary/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-rainbow-gradient border-b flex justify-between items-center text-primary">
              <h3 className="text-2xl font-black tracking-tight flex items-center gap-3 uppercase tracking-tighter">
                {newProduct.id ? <Edit className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                {newProduct.id ? t.dashboard.editProduct : t.dashboard.addProduct}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-black/5 rounded-full cursor-pointer"><X /></button>
            </div>
            
            <form onSubmit={handleAddOrUpdateProduct} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.table.name}</label>
                  <input
                    type="text"
                    required
                    placeholder={t.dashboard.productNamePlaceholder}
                    className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-bold"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.assignedStore}</label>
                  <select
                    className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-black uppercase text-xs"
                    value={newProduct.storeId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewProduct({
                        ...newProduct,
                        storeId: val,
                        isOfficial: val === "mall"
                      });
                    }}
                  >
                    <option value="mall">{t.dashboard.officialMall}</option>
                    {dashboardData.stores.map((s: any) => (
                      <option key={s.store_id} value={s.store_id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.table.price} (฿)</label>
                  <input
                    type="number"
                    required
                    className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-bold"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.table.stock}</label>
                  <input
                    type="number"
                    required
                    className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-bold"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.uploadImage}</label>
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-24 rounded-2xl bg-muted border-2 border-dashed border-primary/20 flex items-center justify-center overflow-hidden shrink-0 relative group">
                      {newProduct.image ? (
                        <img src={getImgSrc(newProduct.image)} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-primary/20" />
                      )}
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden" 
                        id="product-image-upload"
                        disabled={isUploading}
                      />
                      <label 
                        htmlFor="product-image-upload"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        {isUploading ? t.dashboard.uploading : t.dashboard.selectPhoto}
                      </label>
                      <p className="text-[10px] text-muted-foreground font-medium italic leading-tight">{t.dashboard.photoDesc}</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.table.category}</label>
                  <select
                    className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-black uppercase text-xs"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  >
                    <option>{t.dashboard.categories.electronics}</option>
                    <option>{t.dashboard.categories.fashion}</option>
                    <option>{t.dashboard.categories.home}</option>
                    <option>{t.dashboard.categories.sports}</option>
                    <option>{t.dashboard.categories.beauty}</option>
                    <option>{t.dashboard.categories.toys}</option>
                  </select>
                </div>

                <div className="col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.table.category} / {t.dashboard.table.description}</label>
                    <button
                      type="button"
                      onClick={generateAIDescription}
                      disabled={isGeneratingDesc || !newProduct.name}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3" />
                      {isGeneratingDesc ? t.dashboard.generating : t.dashboard.aiWrite}
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    placeholder={t.dashboard.descPlaceholder}
                    className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-bold resize-none"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                {newProduct.id ? <Edit className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                {newProduct.id ? t.dashboard.updateProduct : t.dashboard.createProduct}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
