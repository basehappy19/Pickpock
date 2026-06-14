"use client";

import { useRole } from "@/hooks/use-role";
import { useLanguage } from "@/hooks/use-language";
import { useGlobalData } from "@/hooks/use-global-data";
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
  Sparkles,
  AlertCircle,
  Zap,
  Tag,
  ArrowUp,
  ArrowDown,
  ChevronRight
} from "lucide-react";
import { cn, formatCurrency, getImgSrc } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import AccessRestricted from "@/components/shared/access-restricted";
import PlatformInventory from "@/components/dashboard/platform-inventory";
import { uploadProductImage } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Product, Order, User, Store } from "@/types";
import { toast } from "sonner";
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
  const { role, user: currentUser } = useRole();
  const { t, language } = useLanguage();
  const { orders, products, stores, updateProduct, addProduct, deleteProduct } = useGlobalData();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const [newProduct, setNewProduct] = useState({
    id: "",
    name: "",
    price: 0,
    category: t.dashboard.categories.electronics,
    stock: 0,
    image: "",
    description: "",
    storeId: "mall",
    isOfficial: true,
    weight: "",
    dimensions: "",
    warranty: "",
    additionalDetails: ""
  });

  const isFounder = role === "founder";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const url = await uploadProductImage(file);
    if (url) {
      setNewProduct(prev => ({ ...prev, image: url }));
      toast.success(t.dashboard.uploadSuccess);
    } else {
      toast.error(t.dashboard.uploadError);
    }
    setIsUploading(false);
  };

  const typeText = (text: string) => {
    let index = 0;
    setNewProduct(prev => ({ ...prev, description: "" }));
    
    const interval = setInterval(() => {
      if (index < text.length) {
        const char = text[index];
        setNewProduct(prev => ({
          ...prev,
          description: prev.description + char
        }));
        index++;
      } else {
        clearInterval(interval);
        setIsGeneratingDesc(false);
        toast.success(t.dashboard.aiGeneratedSuccess);
      }
    }, 15);
  };

  const generateAIDescription = async () => {
    if (!newProduct.name.trim()) {
      toast.error(t.dashboard.enterProductName);
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
        const fullDesc = data.description.th || data.description.en || data.description.description || data.description;
        typeText(fullDesc);
      } else {
        setIsGeneratingDesc(false);
        toast.error(t.dashboard.aiGenerateError);
      }
    } catch (e) {
      setIsGeneratingDesc(false);
      console.error("AI generation failed", e);
      toast.error(t.dashboard.aiApiError);
    }
  };

  const handleApplyAISmartPrice = async (productId: string, suggestedPrice: number, totalSoldAtAnalysis: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setIsUpdatingPrice(productId);
    try {
      await updateProduct({
        ...product,
        price: suggestedPrice,
        aiPriceAdjusted: true
      } as any);
      toast.success(`${t.dashboard.smartPriceSuccess}${formatCurrency(suggestedPrice)}`);
    } catch (e) {
      toast.error(t.dashboard.smartPriceError);
    } finally {
      setIsUpdatingPrice(null);
    }
  };

  const handleAddOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!newProduct.id;
    const productId = isEditing ? newProduct.id : "p-" + Math.random().toString(36).substring(2, 11);

    const productData: Product = {
      ...newProduct,
      id: productId,
      rating: 4.5,
      reviews: [],
      createdAt: new Date().toISOString(),
      status: 'active' as any
    };

    if (isEditing) {
      await updateProduct(productData);
      toast.success(t.dashboard.updateSuccess);
    } else {
      await addProduct(productData);
      toast.success(t.dashboard.addSuccess);
    }
    
    setShowAddModal(false);
    setNewProduct({ id: "", name: "", price: 0, category: t.dashboard.categories.electronics, stock: 0, image: "", description: "", storeId: "mall", isOfficial: true, weight: "", dimensions: "", warranty: "", additionalDetails: "" });
  };

  const handleDelete = async (productId: string) => {
    setDeleteConfirm(productId);
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deleteProduct(deleteConfirm);
      toast.success(t.dashboard.deleteSuccess);
      setDeleteConfirm(null);
    }
  };

  const openEditModal = (product: Product) => {
    setNewProduct({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      image: product.image,
      description: product.description || "",
      storeId: product.storeId || "mall",
      isOfficial: product.isOfficial ?? true,
      weight: product.weight || "",
      dimensions: product.dimensions || "",
      warranty: product.warranty || "",
      additionalDetails: product.additionalDetails || ""
    });
    setShowAddModal(true);
  };

  const [timeRange, setTimeRange] = useState<"12months" | "30days">("12months");

  const now = useMemo(() => {
    if (orders.length === 0) return new Date("2026-06-13T23:59:59Z");
    const latestOrderTime = Math.max(...orders.map(o => new Date(o.createdAt).getTime()));
    const latestDate = new Date(latestOrderTime);
    latestDate.setHours(23, 59, 59, 999);
    return latestDate;
  }, [orders]);

  const analyticsData = useMemo(() => {
    const productMap = products.reduce((acc, p) => { acc[p.id] = p; return acc; }, {} as Record<string, Product>);
    const storeMap = stores.reduce((acc, s) => { acc[s.store_id] = s; return acc; }, {} as Record<string, Store>);

    let trendLabels: string[] = [];
    let salesByLabel: Record<string, number> = {};
    let comparisonStartDate: Date;
    let currentPeriodRevenue = 0;
    let prevPeriodRevenue = 0;

    if (timeRange === "12months") {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        const label = d.toLocaleString('th-TH', { month: 'short', year: '2-digit' });
        trendLabels.push(label);
        salesByLabel[label] = 0;
      }
      comparisonStartDate = new Date(now);
      comparisonStartDate.setFullYear(comparisonStartDate.getFullYear() - 1);
      const prevYearStart = new Date(comparisonStartDate);
      prevYearStart.setFullYear(prevYearStart.getFullYear() - 1);

      orders.forEach((order) => {
        const orderTime = new Date(order.createdAt);
        const total = order.totalAmount || 0;
        const label = orderTime.toLocaleString('th-TH', { month: 'short', year: '2-digit' });
        if (salesByLabel[label] !== undefined) salesByLabel[label] += total;
        if (orderTime >= comparisonStartDate && orderTime <= now) currentPeriodRevenue += total;
        else if (orderTime >= prevYearStart && orderTime <= comparisonStartDate) prevPeriodRevenue += total;
      });
    } else {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const label = d.toISOString().split('T')[0];
        trendLabels.push(label);
        salesByLabel[label] = 0;
      }
      comparisonStartDate = new Date(now);
      comparisonStartDate.setDate(comparisonStartDate.getDate() - 29);
      const prev30DaysStart = new Date(comparisonStartDate);
      prev30DaysStart.setDate(prev30DaysStart.getDate() - 30);

      orders.forEach((order) => {
        const orderDate = order.createdAt.split('T')[0];
        const orderTime = new Date(order.createdAt);
        const total = order.totalAmount || 0;
        if (salesByLabel[orderDate] !== undefined) salesByLabel[orderDate] += total;
        if (orderTime >= comparisonStartDate && orderTime <= now) currentPeriodRevenue += total;
        else if (orderTime >= prev30DaysStart && orderTime <= comparisonStartDate) prevPeriodRevenue += total;
      });
    }

    const salesTrend = trendLabels.map(label => ({ day: label, amount: salesByLabel[label] }));
    const percentChange = prevPeriodRevenue > 0 ? Math.round(((currentPeriodRevenue - prevPeriodRevenue) / prevPeriodRevenue) * 100) : (currentPeriodRevenue > 0 ? 100 : 0);

    const productSalesStats: Record<string, { id: string, image: string, name: string, sales: number, revenue: number }> = {};
    const storeSalesStats: Record<string, { name: string, sales: number, revenue: number }> = {};

    orders.forEach((order) => {
      const orderTime = new Date(order.createdAt);
      if (orderTime < comparisonStartDate || orderTime > now) return;
      const netTotal = order.totalAmount || 0;
      const originalTotal = order.originalAmount || netTotal || 1;
      let remainingNet = netTotal;
      (order.items || []).forEach((item, idx) => {
        const product = productMap[item.productId];
        const sId = product?.storeId || "mall";
        const storeName = storeMap[sId]?.name || t.dashboard.officialMall;
        const itemQty = item.quantity || 1;
        const itemPrice = item.price || product?.price || 0;
        const itemSubtotal = itemPrice * itemQty;
        let itemNet = (idx === (order.items?.length || 1) - 1) ? remainingNet : Math.round((itemSubtotal / originalTotal) * netTotal);
        remainingNet -= itemNet;

        if (!productSalesStats[item.productId]) productSalesStats[item.productId] = { id: item.productId, image: product?.image || "", name: item.productName || product?.name || "Product", sales: 0, revenue: 0 };
        productSalesStats[item.productId].sales += itemQty;
        productSalesStats[item.productId].revenue += itemNet;

        if (!storeSalesStats[sId]) storeSalesStats[sId] = { name: storeName, sales: 0, revenue: 0 };
        storeSalesStats[sId].sales += itemQty;
        storeSalesStats[sId].revenue += itemNet;
      });
    });

    const topProducts = Object.values(productSalesStats)
      .filter(p => productMap[p.id])
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
    const topStores = Object.values(storeSalesStats).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    const categoryCounts = products.reduce((acc, p) => { acc[p.category || 'Other'] = (acc[p.category || 'Other'] || 0) + 1; return acc; }, {} as Record<string, number>);
    const totalProducts = products.length;
    const categoryDistribution = Object.entries(categoryCounts).map(([label, count]) => ({
      label,
      percentage: Math.round((count / (totalProducts || 1)) * 100),
      count: count,
      color: ['bg-blue-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500'][Object.keys(categoryCounts).indexOf(label) % 5]
    })).sort((a, b) => b.percentage - a.percentage);

    // AI Pricing Analysis Logic (Improved to suggest ONLY when new sales occur)
    const pricingInsights = products.reduce((acc, p) => {
      const stats = productSalesStats[p.id];
      const sales = stats?.sales || 0;
      
      // Persistence check: If we've already adjusted price by AI for this product, skip
      if ((p as any).aiPriceAdjusted) return acc;

      let suggestedAmount = 0;
      let type: 'increase' | 'decrease' = 'increase';

      if (sales > 10 && p.stock < 20) {
        suggestedAmount = Math.round(p.price * 1.05 / 10) * 10;
        type = 'increase';
      } else if (sales === 0 && p.stock > 50) {
        // Only suggest decrease if never analyzed before
        suggestedAmount = Math.round(p.price * 0.95 / 10) * 10;
        type = 'decrease';
      }
      
      if (suggestedAmount > 0 && Math.abs(suggestedAmount - p.price) >= 20) {
        acc[p.id] = { type, amount: suggestedAmount, reason: type === 'increase' ? t.dashboard.founderInsights.reasonIncrease : t.dashboard.founderInsights.reasonDecrease, totalSold: sales };
      }
      
      return acc;
    }, {} as Record<string, { type: 'increase' | 'decrease', amount: number, reason: string, totalSold: number }>);

    return { salesTrend, percentChange, topProducts, topStores, categoryDistribution, currentPeriodRevenue, prevPeriodRevenue, pricingInsights };
  }, [orders, products, stores, timeRange, t, now]);

  const statCards = useMemo(() => {
    const getChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? "+100%" : "0%";
      const change = ((curr - prev) / prev) * 100;
      return (change >= 0 ? "+" : "") + change.toFixed(1) + "%";
    };

    return [
      { label: t.dashboard.stats.globalRevenue || "Global Revenue", value: formatCurrency(analyticsData.currentPeriodRevenue), change: getChange(analyticsData.currentPeriodRevenue, analyticsData.prevPeriodRevenue), trend: analyticsData.currentPeriodRevenue >= analyticsData.prevPeriodRevenue ? "up" : "down", icon: TrendingUp, color: "text-emerald-500" },
      { label: t.dashboard.stats.mallRevenue || "Mall Revenue", value: formatCurrency(analyticsData.currentPeriodRevenue), change: getChange(analyticsData.currentPeriodRevenue, analyticsData.prevPeriodRevenue), trend: analyticsData.currentPeriodRevenue >= analyticsData.prevPeriodRevenue ? "up" : "down", icon: ShoppingBag, color: "text-amber-500" },
      { label: t.dashboard.stats.users, value: users.length.toLocaleString(), change: "+5.2%", trend: "up", icon: Users, color: "text-blue-500" },
      { label: t.dashboard.stats.products, value: products.length.toLocaleString(), change: products.length > 20 ? "+2.5%" : "0%", trend: "up", icon: Package, color: "text-purple-500" },
    ];
  }, [analyticsData, users, products, t]);

  if (!isFounder && role !== null) return <AccessRestricted requiredRole={["founder"]} currentPage={t.dashboard.founderTitle} />;
  if (loadingUsers) return <div className="h-[80vh] flex flex-col items-center justify-center gap-4"><Loader2 className="h-12 w-12 text-primary animate-spin" /><p className="font-semibold text-xs uppercase tracking-widest text-muted-foreground animate-pulse">{t.dashboard.syncing}</p></div>;

  return (
    <div className="p-0 sm:p-4 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-28">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 sm:px-0 mt-4 sm:mt-0">
        <div className="space-y-1"><h1 className="text-4xl font-semibold tracking-tighter">{t.dashboard.founderTitle}</h1><p className="text-muted-foreground font-medium">{t.dashboard.founderSubtitle}</p></div>
        <div className="flex bg-muted p-1 rounded-xl shrink-0">
          <button onClick={() => setTimeRange("12months")} className={cn("px-6 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer", timeRange === "12months" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-primary")}>12 {t.common.monthly}</button>
          <button onClick={() => setTimeRange("30days")} className={cn("px-6 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer", timeRange === "30days" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-primary")}>30 {t.common.daily}</button>
        </div>
      </div>

      {orders.length === 0 && <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-3xl flex items-center gap-4"><AlertCircle className="h-8 w-8 text-amber-500" /><div><h4 className="font-semibold text-amber-900 uppercase text-sm">{t.dashboard.noOrderDataTitle}</h4><p className="text-amber-700 text-xs font-medium">{t.dashboard.noOrderDataDesc}</p></div></div>}

      <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6 px-4 sm:px-0">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card border-2 border-primary/5 rounded-2xl sm:rounded-4xl p-4 sm:p-6 shadow-xl shadow-primary/5 space-y-3 sm:space-y-4">
            <div className="flex justify-between items-start"><div className={cn("p-3 rounded-2xl bg-muted", stat.color)}><stat.icon className="h-6 w-6" /></div></div>
            <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{stat.label}</p><h3 className="text-3xl font-semibold tracking-tighter">{stat.value}</h3><p className={cn("text-xs font-semibold", stat.trend === "up" ? "text-emerald-500" : "text-rose-500")}>{stat.change} {t.dashboard.vsPrevPeriod || 'vs prev. period'}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card border-y sm:border-2 border-primary/5 sm:rounded-[2.5rem] p-4 sm:p-8 shadow-sm sm:shadow-2xl shadow-primary/5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div><h3 className="text-xl font-semibold tracking-tight uppercase">{t.dashboard.salesAnalytics}</h3><p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{timeRange === '12months' ? t.dashboard.monthlyReport : t.dashboard.dailyReport} {now.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US')}</p></div>
            <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-widest", analyticsData.percentChange >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600")}>{analyticsData.percentChange >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}{analyticsData.percentChange >= 0 ? "+" : ""}{analyticsData.percentChange}% {t.dashboard.vsLastWeek}</div>
          </div>
          <div className="h-75 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData.salesTrend}>
                <defs><linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#888' }} dy={10} /><YAxis hide domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} formatter={(value: any) => [formatCurrency(Number(value)), "ยอดขาย"]} />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card border-y sm:border-2 border-primary/5 sm:rounded-[2.5rem] p-4 sm:p-8 shadow-sm sm:shadow-2xl shadow-primary/5 space-y-6 overflow-hidden flex flex-col">
          <h3 className="text-xl font-semibold tracking-tight uppercase shrink-0">{t.dashboard.topProducts}</h3>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {analyticsData.topProducts.map((prod, i) => (
              <div 
                key={i} 
                onClick={() => router.push(`/product/${prod.id}`)}
                className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 cursor-pointer transition-all border border-transparent hover:border-primary/10"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 overflow-hidden shrink-0 relative">
                  {prod.image ? (
                    <img src={getImgSrc(prod.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={prod.name} />
                  ) : (
                    <Package className="h-6 w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary/30" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{prod.name}</p>
                  <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1.5">
                    <span className="text-primary font-semibold">{prod.sales} {t.dashboard.units}</span>
                    <span>•</span>
                    <span className="text-emerald-500 font-semibold">{formatCurrency(prod.revenue)}</span>
                  </p>
                  <div className="h-1.5 w-full bg-muted mt-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-1000"
                      style={{ width: `${Math.max(5, (prod.sales / (analyticsData.topProducts[0]?.sales || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="shrink-0 pl-2">
                  <div className="h-8 w-8 rounded-full bg-background border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0 -translate-x-2">
                    <ArrowUpRight className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card border-y sm:border-2 border-primary/5 sm:rounded-[2.5rem] p-4 sm:p-8 shadow-sm sm:shadow-2xl shadow-primary/5 space-y-6">
          <h3 className="text-xl font-semibold tracking-tight uppercase">{t.dashboard.topStores}</h3>
          <div className="h-75 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.topStores}><CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#888' }} /><YAxis hide /><Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', fontSize: '10px', fontWeight: 900 }} formatter={(value: any) => [formatCurrency(value), t.dashboard.totalRevenue]} /><Bar dataKey="revenue" radius={[10, 10, 0, 0]}>{analyticsData.topStores.map((entry, index) => (<Cell key={`cell-${index}`} fill={['#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#a855f7'][index % 5]} />))}</Bar></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card border-y sm:border-2 border-primary/5 sm:rounded-[2.5rem] p-4 sm:p-8 shadow-sm sm:shadow-2xl shadow-primary/5 space-y-6">
          <h3 className="text-xl font-semibold tracking-tight uppercase">{t.dashboard.categoryDistribution}</h3>
          <div className="space-y-5">
            {analyticsData.categoryDistribution.length > 0 ? (
              analyticsData.categoryDistribution.slice(0, 5).map((cat) => (
                <div key={cat.label} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-widest">
                    <span>{(t.categories as Record<string, string>)[cat.label] || cat.label} ({cat.count} {t.dashboard.units})</span>
                    <span>{cat.percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-1000", cat.color)} style={{ width: `${cat.percentage}%` }} />
                  </div>
                </div>
              ))
            ) : <div className="text-center py-8">{t.dashboard.noData}</div>}
          </div>
        </div>
      </div>

      <PlatformInventory
        analyticsData={analyticsData}
        isUpdatingPrice={isUpdatingPrice}
        onAddClick={() => {
           setNewProduct({ id: "", name: "", price: 0, category: t.dashboard.categories.electronics, stock: 0, image: "", description: "", storeId: "mall", isOfficial: true, weight: "", dimensions: "", warranty: "", additionalDetails: "" });
           setShowAddModal(true);
        }}
        onEditClick={openEditModal}
        onDeleteClick={handleDelete}
        onApplyPrice={handleApplyAISmartPrice}
      />

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 p-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col sm:rounded-4xl sm:border-2 border-primary/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 md:p-8 bg-rainbow-gradient border-b flex justify-between items-center text-primary shrink-0">
              <h3 className="text-2xl font-semibold tracking-tight flex items-center gap-3 uppercase tracking-tighter">
                {newProduct.id ? <Edit className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                {newProduct.id ? t.dashboard.editProduct : t.dashboard.addProduct}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-black/5 rounded-full cursor-pointer"><X /></button>
            </div>
            
            <form onSubmit={handleAddOrUpdateProduct} className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.table.name}</label>
                  <input
                    type="text"
                    required
                    placeholder={t.dashboard.productNamePlaceholder}
                    className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-medium"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                


                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.table.price} (฿)</label>
                  <input
                    type="number"
                    required
                    className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-medium"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.table.stock}</label>
                  <input
                    type="number"
                    required
                    className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-medium"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.uploadImage}</label>
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-24 rounded-2xl bg-muted border-2 border-dashed border-primary/20 flex items-center justify-center overflow-hidden shrink-0 relative group">
                      {newProduct.image ? (
                        <img src={getImgSrc(newProduct.image)} className="h-full w-full object-cover" alt="Preview" />
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
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest hover:bg-primary/20 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        {isUploading ? t.dashboard.uploading : t.dashboard.selectPhoto}
                      </label>
                      <p className="text-xs text-muted-foreground font-medium italic leading-tight">{t.dashboard.photoDesc}</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.extendedFields?.weight} <span className="lowercase">{t.dashboard.extendedFields?.optional}</span></label>
                    <input type="text" placeholder={t.dashboard.extendedFields?.weightPlaceholder} value={newProduct.weight} onChange={(e) => setNewProduct({...newProduct, weight: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.extendedFields?.dimensions} <span className="lowercase">{t.dashboard.extendedFields?.optional}</span></label>
                    <input type="text" placeholder={t.dashboard.extendedFields?.dimensionsPlaceholder} value={newProduct.dimensions} onChange={(e) => setNewProduct({...newProduct, dimensions: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-medium" />
                  </div>
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.extendedFields?.warranty} <span className="lowercase">{t.dashboard.extendedFields?.optional}</span></label>
                  <input type="text" placeholder={t.dashboard.extendedFields?.warrantyPlaceholder} value={newProduct.warranty} onChange={(e) => setNewProduct({...newProduct, warranty: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-medium" />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.extendedFields?.additionalDetails} <span className="lowercase">{t.dashboard.extendedFields?.optional}</span></label>
                  <textarea rows={2} placeholder={t.dashboard.extendedFields?.additionalDetailsPlaceholder} value={newProduct.additionalDetails} onChange={(e) => setNewProduct({...newProduct, additionalDetails: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-medium resize-none" />
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.table.category}</label>
                  <select
                    className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-semibold uppercase text-xs"
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
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.descPlaceholderLabel}</label>
                    <button
                      type="button"
                      onClick={generateAIDescription}
                      disabled={isGeneratingDesc || !newProduct.name.trim()}
                      className={cn(
                        "flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all",
                        (isGeneratingDesc || !newProduct.name.trim()) 
                          ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50" 
                          : "bg-linear-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 cursor-pointer shadow-md active:scale-95"
                      )}
                    >
                      <img src="/brand/mascot.jpeg" className="h-4 w-4 object-cover rounded-full" alt="AI Mascot" />
                      {isGeneratingDesc ? t.dashboard.generating : t.dashboard.aiWrite}
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    placeholder={t.dashboard.descPlaceholder}
                    className={cn(
                      "w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-medium resize-none",
                      isGeneratingDesc && "animate-pulse"
                    )}
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  />
                  {isGeneratingDesc && (
                    <div className="flex items-center gap-2 px-2 text-xs font-semibold text-primary animate-bounce">
                      <img src="/brand/mascot.jpeg" className="h-4 w-4 object-cover rounded-full" alt="AI Mascot" />
                      {t.dashboard.founderInsights?.typing || 'AI IS TYPING...'}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={isGeneratingDesc || isUploading || !newProduct.name || newProduct.price === undefined || newProduct.stock === undefined || !newProduct.category}
                className={cn(
                  "w-full h-16 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-3",
                  (isGeneratingDesc || isUploading || !newProduct.name || newProduct.price === undefined || newProduct.stock === undefined || !newProduct.category)
                    ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                    : "bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 cursor-pointer"
                )}
              >
                {newProduct.id ? <Edit className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                {isGeneratingDesc ? t.dashboard.generating : (newProduct.id ? t.dashboard.updateProduct : t.dashboard.createProduct)}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4 p-0">
          <div className="bg-card sm:rounded-[2.5rem] rounded-t-[2.5rem] p-8 w-full max-w-md shadow-2xl space-y-6 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in duration-300">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <Trash2 className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight">{t.dashboard.deleteConfirm}</h3>
              <p className="text-muted-foreground font-medium">
                {language === 'th' ? 'คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?' : 'Are you sure you want to delete this product?'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl bg-muted font-semibold uppercase tracking-widest hover:bg-muted/80 transition-all cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold uppercase tracking-widest hover:bg-red-700 transition-all cursor-pointer"
              >
                {t.common.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
