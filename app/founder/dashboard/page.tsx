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
  AlertCircle
} from "lucide-react";
import { cn, formatCurrency, getImgSrc } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import AccessRestricted from "@/components/shared/access-restricted";
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
  const { t } = useLanguage();
  const { orders, products, stores, updateProduct, addProduct, deleteProduct } = useGlobalData();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
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
      toast.success("อัปโหลดรูปภาพสำเร็จ");
    } else {
      toast.error("อัปโหลดรูปภาพล้มเหลว");
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
        toast.success("AI สร้างคำบรรยายสินค้าให้คุณแล้ว!");
      }
    }, 15); // Adjust speed here
  };

  const generateAIDescription = async () => {
    if (!newProduct.name) {
      toast.error("กรุณาใส่ชื่อสินค้าก่อน / Please enter product name first");
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
        toast.error("AI ไม่สามารถเขียนคำบรรยายได้ในขณะนี้");
      }
    } catch (e) {
      setIsGeneratingDesc(false);
      console.error("AI generation failed", e);
      toast.error("เกิดข้อผิดพลาดในการเรียก AI");
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
      toast.success("อัปเดตข้อมูลสินค้าเรียบร้อยแล้ว");
    } else {
      await addProduct(productData);
      toast.success("เพิ่มสินค้าใหม่สำเร็จแล้ว");
    }
    
    setShowAddModal(false);
    setNewProduct({ id: "", name: "", price: 0, category: "อิเล็กทรอนิกส์", stock: 0, image: "", description: "", storeId: "mall", isOfficial: true });
  };

  const handleDelete = async (productId: string) => {
    if (!confirm(t.dashboard.deleteConfirm)) return;
    await deleteProduct(productId);
    toast.success("ลบสินค้าเรียบร้อยแล้ว");
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
      isOfficial: product.isOfficial ?? true
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

    const productSalesStats: Record<string, { name: string, sales: number, revenue: number }> = {};
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
        let itemNet = (idx === order.items.length - 1) ? remainingNet : Math.round((itemSubtotal / originalTotal) * netTotal);
        remainingNet -= itemNet;

        if (!productSalesStats[item.productId]) productSalesStats[item.productId] = { name: item.productName || product?.name || "Product", sales: 0, revenue: 0 };
        productSalesStats[item.productId].sales += itemQty;
        productSalesStats[item.productId].revenue += itemNet;

        if (!storeSalesStats[sId]) storeSalesStats[sId] = { name: storeName, sales: 0, revenue: 0 };
        storeSalesStats[sId].sales += itemQty;
        storeSalesStats[sId].revenue += itemNet;
      });
    });

    const topProducts = Object.values(productSalesStats).sort((a, b) => b.sales - a.sales).slice(0, 5);
    const topStores = Object.values(storeSalesStats).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    const categoryCounts = products.reduce((acc, p) => { acc[p.category || 'Other'] = (acc[p.category || 'Other'] || 0) + 1; return acc; }, {} as Record<string, number>);
    const totalProducts = products.length;
    const categoryDistribution = Object.entries(categoryCounts).map(([label, count]) => ({
      label,
      count: Math.round((count / (totalProducts || 1)) * 100),
      color: ['bg-blue-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500'][Object.keys(categoryCounts).indexOf(label) % 5]
    })).sort((a, b) => b.count - a.count);

    return { salesTrend, percentChange, topProducts, topStores, categoryDistribution, currentPeriodRevenue, prevPeriodRevenue };
  }, [orders, products, stores, timeRange, t, now]);

  const statCards = useMemo(() => {
    const getChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? "+100%" : "0%";
      const change = ((curr - prev) / prev) * 100;
      return (change >= 0 ? "+" : "") + change.toFixed(1) + "%";
    };

    return [
      { label: t.dashboard.stats.revenue + " (Global)", value: formatCurrency(analyticsData.currentPeriodRevenue), change: getChange(analyticsData.currentPeriodRevenue, analyticsData.prevPeriodRevenue), trend: analyticsData.currentPeriodRevenue >= analyticsData.prevPeriodRevenue ? "up" : "down", icon: TrendingUp, color: "text-emerald-500" },
      { label: t.dashboard.stats.revenue + " (Mall)", value: formatCurrency(analyticsData.currentPeriodRevenue), change: getChange(analyticsData.currentPeriodRevenue, analyticsData.prevPeriodRevenue), trend: analyticsData.currentPeriodRevenue >= analyticsData.prevPeriodRevenue ? "up" : "down", icon: ShoppingBag, color: "text-amber-500" },
      { label: t.dashboard.stats.users, value: users.length.toLocaleString(), change: "+5.2%", trend: "up", icon: Users, color: "text-blue-500" },
      { label: t.dashboard.stats.products, value: products.length.toLocaleString(), change: products.length > 20 ? "+2.5%" : "0%", trend: "up", icon: Package, color: "text-purple-500" },
    ];
  }, [analyticsData, users, products, t]);

  if (!isFounder && role !== null) return <AccessRestricted requiredRole={["founder"]} currentPage={t.dashboard.founderTitle} />;
  if (loadingUsers) return <div className="h-[80vh] flex flex-col items-center justify-center gap-4"><Loader2 className="h-12 w-12 text-primary animate-spin" /><p className="font-black text-xs uppercase tracking-widest text-muted-foreground animate-pulse">{t.dashboard.syncing}</p></div>;

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1"><h1 className="text-4xl font-black tracking-tighter">{t.dashboard.founderTitle}</h1><p className="text-muted-foreground font-bold">{t.dashboard.founderSubtitle}</p></div>
        <div className="flex bg-muted p-1 rounded-xl shrink-0">
          <button onClick={() => setTimeRange("12months")} className={cn("px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer", timeRange === "12months" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-primary")}>12 {t.common.monthly}</button>
          <button onClick={() => setTimeRange("30days")} className={cn("px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer", timeRange === "30days" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-primary")}>30 {t.common.daily}</button>
        </div>
      </div>

      {orders.length === 0 && <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-3xl flex items-center gap-4"><AlertCircle className="h-8 w-8 text-amber-500" /><div><h4 className="font-black text-amber-900 uppercase text-sm">ไม่พบข้อมูลคำสั่งซื้อในระบบ</h4><p className="text-amber-700 text-xs font-bold">กรุณาตรวจสอบไฟล์ ecommerce_orders.json หรือทำการสั่งซื้อสินค้าเพื่อดูยอดขาย</p></div></div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card border-2 border-primary/5 rounded-4xl p-6 shadow-xl shadow-primary/5 space-y-4">
            <div className="flex justify-between items-start"><div className={cn("p-3 rounded-2xl bg-muted", stat.color)}><stat.icon className="h-6 w-6" /></div></div>
            <div><p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p><h3 className="text-3xl font-black tracking-tighter">{stat.value}</h3><p className={cn("text-[10px] font-black", stat.trend === "up" ? "text-emerald-500" : "text-rose-500")}>{stat.change} vs prev. period</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card border-2 border-primary/5 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div><h3 className="text-xl font-black tracking-tight uppercase">{t.dashboard.salesAnalytics}</h3><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{timeRange === '12months' ? t.dashboard.monthlyReport : t.dashboard.dailyReport} (Reference: {now.toLocaleDateString()})</p></div>
            <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest", analyticsData.percentChange >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600")}>{analyticsData.percentChange >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}{analyticsData.percentChange >= 0 ? "+" : ""}{analyticsData.percentChange}% {t.dashboard.vsLastWeek}</div>
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
        <div className="bg-card border-2 border-primary/5 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 space-y-6">
          <h3 className="text-xl font-black tracking-tight uppercase">{t.dashboard.topProducts}</h3>
          <div className="h-75 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.topProducts} layout="vertical"><XAxis type="number" hide /><YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 800, fill: '#666' }} /><Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '1rem', border: 'none', fontSize: '10px', fontWeight: 900 }} formatter={(value: any) => [`${value} ${t.dashboard.units}`, t.dashboard.salesCount]} /><Bar dataKey="sales" radius={[0, 10, 10, 0]}>{analyticsData.topProducts.map((entry, index) => (<Cell key={`cell-${index}`} fill={['#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#a855f7'][index % 5]} />))}</Bar></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card border-2 border-primary/5 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 space-y-6">
          <h3 className="text-xl font-black tracking-tight uppercase">{t.dashboard.topStores}</h3>
          <div className="h-75 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.topStores}><CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#888' }} /><YAxis hide /><Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', fontSize: '10px', fontWeight: 900 }} formatter={(value: any) => [formatCurrency(value), t.dashboard.totalRevenue]} /><Bar dataKey="revenue" radius={[10, 10, 0, 0]}>{analyticsData.topStores.map((entry, index) => (<Cell key={`cell-${index}`} fill={['#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#a855f7'][index % 5]} />))}</Bar></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card border-2 border-primary/5 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 space-y-6">
          <h3 className="text-xl font-black tracking-tight uppercase">{t.dashboard.categoryDistribution}</h3>
          <div className="space-y-5">
            {analyticsData.categoryDistribution.length > 0 ? (
              analyticsData.categoryDistribution.slice(0, 5).map((cat) => (
                <div key={cat.label} className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest"><span>{cat.label}</span><span>{cat.count}%</span></div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden"><div className={cn("h-full rounded-full transition-all duration-1000", cat.color)} style={{ width: `${cat.count}%` }} /></div>
                </div>
              ))
            ) : <div className="text-center py-8">{t.dashboard.noData}</div>}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between"><h2 className="text-2xl font-black tracking-tighter uppercase">{t.dashboard.platformInventory}</h2><button onClick={() => {
           setNewProduct({ id: "", name: "", price: 0, category: "อิเล็กทรอนิกส์", stock: 0, image: "", description: "", storeId: "mall", isOfficial: true });
           setShowAddModal(true);
        }} className="h-10 px-4 rounded-xl bg-primary text-primary-foreground flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 cursor-pointer"><Plus className="h-3.5 w-3.5" /> {t.dashboard.addProduct}</button></div>
        <div className="bg-card border-2 border-primary/5 rounded-4xl shadow-2xl shadow-primary/5 overflow-hidden">
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
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-8 py-6"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-primary/10 overflow-hidden"><img src={getImgSrc(product.image)} className="w-full h-full object-cover" alt="" /></div><div><p className="font-black text-sm max-w-50 truncate">{product.name}</p><p className="text-[10px] font-bold text-muted-foreground">{product.category}</p></div></div></td>
                  <td className="px-8 py-6"><span className={cn("px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest", product.isOfficial ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600")}>{product.isOfficial ? t.dashboard.officialMall : (stores.find(s => s.store_id === product.storeId)?.name || t.dashboard.partnerStore)}</span></td>
                  <td className="px-8 py-6 font-black text-[10px]">{product.stock} {t.product.quantity}</td>
                  <td className="px-8 py-6 font-black text-sm">{formatCurrency(product.price)}</td>
                  <td className="px-8 py-6 text-right"><div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => openEditModal(product)} className="p-2 text-blue-500 transition-colors cursor-pointer"><Edit className="h-4 w-4" /></button><button onClick={() => handleDelete(product.id)} className="p-2 text-rose-500 transition-colors cursor-pointer"><Trash2 className="h-4 w-4" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-lg rounded-4xl border-2 border-primary/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
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
                    placeholder="Enter product name..."
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
                    {stores.map((s) => (
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">รายละเอียดสินค้า / Description</label>
                    <button
                      type="button"
                      onClick={generateAIDescription}
                      disabled={isGeneratingDesc || !newProduct.name}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-linear-to-r from-purple-500 to-pink-500 text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3" />
                      {isGeneratingDesc ? "กำลังสร้าง..." : "AI เขียนให้"}
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Enter product description or use AI to generate..."
                    className={cn(
                      "w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-bold resize-none",
                      isGeneratingDesc && "animate-pulse"
                    )}
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  />
                  {isGeneratingDesc && (
                    <div className="flex items-center gap-2 px-2 text-[10px] font-black text-primary animate-bounce">
                      <Sparkles className="h-3 w-3" />
                      AI IS TYPING...
                    </div>
                  )}
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
