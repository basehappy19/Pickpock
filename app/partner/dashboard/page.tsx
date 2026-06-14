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
  X,
  Image as ImageIcon,
  Edit,
  Trash2,
  Settings,
  Sparkles,
  Zap,
  Tag,
  AlertTriangle,
  Lightbulb,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { cn, formatCurrency, getImgSrc } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { uploadProductImage } from "@/lib/supabase";
import { toast } from "sonner";

export default function PartnerDashboardPage() {
  const { role, user, updateUserStore } = useRole();
  const { t, language } = useLanguage();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>({
    orders: [],
    products: [],
    stores: [],
    loading: true
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditStoreModal, setShowEditStoreModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const [newProduct, setNewProduct] = useState({
    id: "",
    name: "",
    price: 0,
    category: "Electronics",
    stock: 0,
    image: "",
    description: "",
    weight: "",
    dimensions: "",
    warranty: "",
    additionalDetails: ""
  });

  const [editStoreData, setEditStoreData] = useState({
    name: "",
    description: ""
  });

  const myStore = useMemo(() => 
    dashboardData.stores.find((s: any) => s.owner_id === user?.id),
    [dashboardData.stores, user]
  );

  useEffect(() => {
    if (myStore) {
      setEditStoreData({
        name: myStore.name,
        description: myStore.description
      });
    }
  }, [myStore]);

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
      toast.error(t.dashboard.aiGenerateError);
    }
  };

  const handleApplyAISmartPrice = async (productId: string, suggestedPrice: number) => {
    const product = dashboardData.products.find((p: any) => (p.product_id || p.id) === productId);
    if (!product) return;

    setIsUpdatingPrice(productId);
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...product,
          price: suggestedPrice
        })
      });

      if (res.ok) {
        fetchAllData();
        toast.success(`${t.dashboard.adjustedPrice}${formatCurrency(suggestedPrice)}${t.dashboard.byAiSuggestion}`);
      }
    } catch (e) {
      toast.error(t.dashboard.smartPriceError);
    } finally {
      setIsUpdatingPrice(null);
    }
  };

  const handleAddOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myStore) return;

    const isEditing = !!newProduct.id;
    const method = isEditing ? "PUT" : "POST";
    const productId = isEditing ? newProduct.id : "p-" + Math.random().toString(36).substring(2, 11);

    try {
      const res = await fetch("/api/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProduct,
          id: productId,
          product_id: productId,
          storeId: myStore.store_id,
          isOfficial: false,
          rating: 0,
          reviews: [],
          createdAt: new Date().toISOString()
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewProduct({ id: "", name: "", price: 0, category: "Electronics", stock: 0, image: "", description: "", weight: "", dimensions: "", warranty: "", additionalDetails: "" });
        fetchAllData();
        toast.success(isEditing ? t.dashboard.updateSuccess : t.dashboard.addSuccess);
      }
    } catch (e) {
      toast.error(t.dashboard.saveError);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setDeleteConfirm(productId);
  };

  const confirmDeleteProduct = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/products?id=${deleteConfirm}`, { method: "DELETE" });
      if (res.ok) {
        fetchAllData();
        toast.success(t.dashboard.deleteSuccess);
        setDeleteConfirm(null);
      }
    } catch (e) {
      toast.error(t.dashboard.deleteError);
    }
  };

  const handleEditStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myStore) return;

    try {
      const res = await fetch("/api/stores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: myStore.store_id,
          ...editStoreData
        })
      });

      if (res.ok) {
        setShowEditStoreModal(false);
        fetchAllData();
        toast.success(t.dashboard.updateStoreSuccess);
      }
    } catch (e) {
      toast.error(t.dashboard.updateStoreError);
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
      weight: product.weight || "",
      dimensions: product.dimensions || "",
      warranty: product.warranty || "",
      additionalDetails: product.additionalDetails || ""
    });
    setShowAddModal(true);
  };

  const myProducts = useMemo(() => 
    dashboardData.products.filter((p: any) => p.storeId === myStore?.store_id),
    [dashboardData.products, myStore]
  );

  const myProductIds = useMemo(() => 
    myProducts.map((p: any) => p.product_id || p.id),
    [myProducts]
  );

  const myOrders = useMemo(() => 
    dashboardData.orders.filter((o: any) => 
      o.items.some((item: any) => myProductIds.includes(item.product_id))
    ),
    [dashboardData.orders, myProductIds]
  );

  const pricingInsights = useMemo(() => {
    const insights: Record<string, { type: 'increase' | 'decrease', amount: number }> = {};
    
    myProducts.forEach((p: any) => {
      const pId = p.product_id || p.id;
      const sales = myOrders.filter((o: any) => o.items.some((i: any) => i.product_id === pId)).length;
      
      let suggestedAmount = 0;
      let type: 'increase' | 'decrease' = 'increase';

      if (sales > 5 && p.stock < 10) {
        suggestedAmount = Math.round(p.price * 1.05 / 10) * 10;
        type = 'increase';
      } else if (sales === 0 && p.stock > 30) {
        suggestedAmount = Math.round(p.price * 0.95 / 10) * 10;
        type = 'decrease';
      }

      // Only suggest if the price difference is significant to prevent loops
      if (suggestedAmount > 0 && Math.abs(suggestedAmount - p.price) >= 20) {
        insights[pId] = { type, amount: suggestedAmount };
      }
    });
    
    return insights;
  }, [myProducts, myOrders]);

  const stats = useMemo(() => {
    if (dashboardData.loading || !myStore) return [];
    
    const myRevenue = myOrders.reduce((sum: number, o: any) => sum + (o.total_price || o.totalAmount || 0), 0);
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    let currentRev = 0;
    let prevRev = 0;
    myOrders.forEach((o: any) => {
      const d = o.created_at || o.createdAt || o.timestamp;
      if (!d) return;
      const orderDate = new Date(d);
      const amt = o.total_price || o.totalAmount || 0;
      if (orderDate >= thirtyDaysAgo) {
        currentRev += amt;
      } else if (orderDate >= sixtyDaysAgo && orderDate < thirtyDaysAgo) {
        prevRev += amt;
      }
    });

    let revenueGrowth = "+0%";
    let revenueTrend: "up" | "down" | "neutral" = "neutral";
    let revenueColor = "text-slate-500";
    
    if (prevRev === 0) {
      if (currentRev > 0) {
        revenueGrowth = "+100%";
        revenueTrend = "up";
        revenueColor = "text-emerald-500";
      }
    } else {
      const change = ((currentRev - prevRev) / prevRev) * 100;
      revenueGrowth = (change > 0 ? "+" : "") + change.toFixed(1) + "%";
      revenueTrend = change > 0 ? "up" : change < 0 ? "down" : "neutral";
      revenueColor = change > 0 ? "text-emerald-500" : change < 0 ? "text-rose-500" : "text-slate-500";
    }

    let realRating = 0;
    if (myOrders.length > 0) {
      const ratedProducts = myProducts.filter((p: any) => p.rating > 0);
      if (ratedProducts.length > 0) {
        realRating = ratedProducts.reduce((sum: number, p: any) => sum + p.rating, 0) / ratedProducts.length;
      }
    }

    return [
      { label: t.dashboard.stats.revenue, value: formatCurrency(myRevenue), change: revenueGrowth, trend: revenueTrend as any, icon: TrendingUp, color: revenueColor },
      { label: t.dashboard.rating || "Store Rating", value: realRating > 0 ? realRating.toFixed(1) : "ไม่มีดาว", change: `${t.dashboard.ordersCount} ${myOrders.length}`, trend: realRating > 0 ? "up" : "neutral", icon: Sparkles, color: "text-amber-500" },
      { label: t.dashboard.stats.products, value: myProducts.length.toLocaleString(), change: t.dashboard.itemsCount, trend: "neutral", icon: Package, color: "text-blue-500" },
      { label: t.dashboard.recentOrders, value: myOrders.length.toLocaleString(), change: t.dashboard.ordersCount, trend: "up", icon: ShoppingBag, color: "text-purple-500" },
    ];
  }, [dashboardData.loading, myStore, t, myOrders, myProducts]);

  const smartAdvice = useMemo(() => {
    if (dashboardData.loading || !myStore) return [];
    const advice = [];
    if (myProducts.length === 0) {
      advice.push({ title: t.dashboard.smartAdvice.firstSale.title, desc: t.dashboard.smartAdvice.firstSale.desc, icon: Zap, color: "bg-amber-500" });
    }
    const lowStock = myProducts.filter((p: any) => p.stock < 5 && p.stock > 0);
    if (lowStock.length > 0) {
      advice.push({ title: t.dashboard.smartAdvice.lowStock.title, desc: t.dashboard.smartAdvice.lowStock.desc, icon: AlertTriangle, color: "bg-rose-500" });
    }
    const flatPricing = myProducts.filter((p: any) => p.price % 100 === 0);
    if (flatPricing.length > 0) {
      advice.push({ title: t.dashboard.smartAdvice.pricing.title, desc: t.dashboard.smartAdvice.pricing.desc, icon: Tag, color: "bg-blue-500" });
    }
    const categories = new Set(myProducts.map((p: any) => p.category));
    if (!categories.has("Accessories")) {
      advice.push({ title: t.dashboard.smartAdvice.categories.title, desc: t.dashboard.smartAdvice.categories.desc, icon: Lightbulb, color: "bg-emerald-500" });
    }
    return advice.length > 0 ? advice : [{ title: t.dashboard.smartAdvice.good.title, desc: t.dashboard.smartAdvice.good.desc, icon: Sparkles, color: "bg-purple-500" }];
  }, [myProducts, dashboardData.loading, myStore]);

  if (!user || (!myStore && !dashboardData.loading)) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-6 animate-in fade-in zoom-in-95 duration-700">
        <div className="p-6 rounded-full bg-primary/10 text-primary"><ShoppingBag className="h-16 w-16" /></div>
        <div className="space-y-2"><h2 className="text-4xl font-black tracking-tighter">{t.store.openStore.split(" ").slice(0, -2).join(" ")} <span className="text-primary text-rainbow-animate">{t.store.openStore.split(" ").slice(-2).join(" ")}</span></h2><p className="text-muted-foreground font-bold max-w-md">{t.store.noStorePrompt}</p></div>
        <button onClick={() => router.push("/partner/register")} className="h-16 px-10 rounded-2xl bg-primary text-primary-foreground font-black flex items-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-primary/20 cursor-pointer"><Plus className="h-6 w-6" /> {t.nav.becomePartner}</button>
      </div>
    );
  }

  if (dashboardData.loading) {
    return <div className="h-[80vh] flex flex-col items-center justify-center gap-4"><Loader2 className="h-12 w-12 text-primary animate-spin" /><p className="font-black text-xs uppercase tracking-widest text-muted-foreground animate-pulse">{t.dashboard.syncing}</p></div>;
  }

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1"><h1 className="text-4xl font-black tracking-tighter">{t.dashboard.sellerTitle}</h1><div className="flex items-center gap-2"><p className="text-muted-foreground font-bold">{myStore?.name}</p><button onClick={() => setShowEditStoreModal(true)} className="text-xs text-primary hover:underline font-bold">({t.dashboard.editStore})</button></div></div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push(`/stores/${myStore?.store_id}`)} className="h-10 px-4 rounded-xl bg-secondary text-secondary-foreground flex items-center gap-2 font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-sm cursor-pointer border border-border">
            <ArrowUpRight className="h-3.5 w-3.5" />
            {t.store.visitStore}
          </button>
          <button onClick={() => { setNewProduct({ id: "", name: "", price: 0, category: "Electronics", stock: 0, image: "", description: "", weight: "", dimensions: "", warranty: "", additionalDetails: "" }); setShowAddModal(true); }} className="h-10 px-4 rounded-xl bg-primary text-primary-foreground flex items-center gap-2 font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 cursor-pointer">
            <Plus className="h-3.5 w-3.5" /> {t.dashboard.addProduct}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border-2 border-primary/5 rounded-4xl p-6 shadow-xl shadow-primary/5 space-y-4">
            <div className="flex justify-between items-start"><div className={cn("p-3 rounded-2xl bg-muted", stat.color)}><stat.icon className="h-6 w-6" /></div></div>
            <div><p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p><h3 className="text-3xl font-black tracking-tighter">{stat.value}</h3><p className="text-xs font-black text-emerald-500">{stat.change}</p></div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card border-2 border-primary/5 rounded-4xl shadow-2xl shadow-primary/5 overflow-hidden">
            <div className="p-8 border-b"><h3 className="text-xl font-black tracking-tight">{t.dashboard.table.title}</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="border-b bg-muted/20"><th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.table.name}</th><th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.table.stock}</th><th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.table.price}</th><th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">{t.dashboard.actions}</th></tr></thead>
                <tbody className="divide-y">
                  {myProducts.length > 0 ? myProducts.map((product: any) => {
                    const pId = product.product_id || product.id;
                    const insight = pricingInsights[pId];
                    const isPriceUpdating = isUpdatingPrice === pId;
                    
                    const soldCount = myOrders.reduce((count: number, order: any) => {
                      const item = order.items.find((i: any) => (i.product_id || i.id) === pId);
                      return count + (item ? item.quantity : 0);
                    }, 0);

                    return (
                      <tr key={pId} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => router.push(`/product/${pId}`)}>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 overflow-hidden">
                              <img src={getImgSrc(product.image)} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div>
                              <p className="font-black text-sm max-w-[150px] truncate hover:text-primary transition-colors">{product.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs font-bold text-muted-foreground">{product.category}</p>
                                <span className="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md">ขายแล้ว {soldCount} ชิ้น</span>
                                <span className="flex items-center text-xs text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                                  <Sparkles className="h-2 w-2 mr-0.5" />
                                  {product.rating > 0 ? product.rating.toFixed(1) : "ไม่มีดาว"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6" onClick={(e) => e.stopPropagation()}><span className="text-xs font-black">{product.stock} {t.product.quantity}</span></td>
                        <td className="px-8 py-6" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col gap-1">
                            <span className="font-black text-sm">{formatCurrency(product.price)}</span>
                            {insight && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleApplyAISmartPrice(pId, insight.amount); }}
                                disabled={isPriceUpdating}
                                className={cn(
                                  "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter w-fit transition-all cursor-pointer shadow-sm active:scale-95",
                                  insight.type === 'increase' ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-rose-500 text-white hover:bg-rose-600",
                                  isPriceUpdating && "opacity-50 cursor-wait"
                                )}
                              >
                                {isPriceUpdating ? <Loader2 className="h-2 w-2 animate-spin" /> : <Sparkles className="h-2 w-2" />}
                                {insight.type === 'increase' ? <ArrowUp className="h-2 w-2" /> : <ArrowDown className="h-2 w-2" />}
                                AI: {formatCurrency(insight.amount)}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); openEditModal(product); }} className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors cursor-pointer"><Edit className="h-4 w-4" /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteProduct(pId); }} className="p-2 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : <tr><td colSpan={4} className="px-8 py-12 text-center text-muted-foreground font-bold italic uppercase text-xs tracking-widest">{t.dashboard.noProductsYet}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-card border-2 border-primary/5 rounded-4xl shadow-2xl shadow-primary/5 overflow-hidden">
            <div className="p-8 border-b"><h3 className="text-xl font-black tracking-tight">{t.dashboard.recentOrders}</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="border-b bg-muted/20"><th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.orderDetails}</th><th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.value}</th><th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.orderStatus}</th></tr></thead>
                <tbody className="divide-y">
                  {myOrders.length > 0 ? myOrders.map((order: any) => (
                    <tr key={order.order_id || order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-8 py-6"><div className="space-y-1"><p className="font-black text-sm">{order.order_id || order.id}</p><p className="text-xs font-bold text-muted-foreground">{new Date(order.timestamp || order.createdAt).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US')}</p></div></td>
                      <td className="px-8 py-6 font-black text-sm">{formatCurrency(order.total_price || order.totalAmount)}</td>
                      <td className="px-8 py-6"><select className={cn("text-xs font-black uppercase tracking-tight bg-background border-2 rounded-xl px-3 py-2 outline-none cursor-pointer transition-all", order.status.toUpperCase() === "PENDING" ? "border-amber-500/20 text-amber-600 focus:border-amber-500" : order.status.toUpperCase() === "DELIVERED" ? "border-emerald-500/20 text-emerald-600 focus:border-emerald-500" : "border-primary/20 text-primary focus:border-primary")} value={order.status.toUpperCase()} onChange={async (e) => { const newStatus = e.target.value; const res = await fetch("/api/orders/status", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: order.order_id || order.id, status: newStatus }) }); if (res.ok) { fetchAllData(); toast.success(t.dashboard.updateOrderStatusSuccess); } }}><option value="PENDING">{t.orders.status.pending}</option><option value="SHIPPED">{t.orders.status.shipped}</option><option value="DELIVERED">{t.orders.status.delivered}</option><option value="CANCELLED">{t.orders.status.cancelled}</option></select></td>
                    </tr>
                  )) : <tr><td colSpan={3} className="px-8 py-12 text-center text-muted-foreground font-bold italic uppercase text-xs tracking-widest">{t.dashboard.noOrdersYet}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-primary rounded-4xl p-8 text-white shadow-xl shadow-primary/20 space-y-6 animate-in zoom-in duration-500">
             <div className="flex items-center gap-3"><div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner"><Sparkles className="h-5 w-5" /></div><h3 className="font-black uppercase tracking-widest text-sm">{t.dashboard.smartAdviceTitle}</h3></div>
             <div className="space-y-4">{smartAdvice.map((adv, i) => (<div key={i} className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 space-y-1 hover:bg-white/20 transition-colors group"><div className="flex items-center justify-between"><p className="font-black text-xs uppercase flex items-center gap-2"><adv.icon className="h-3.5 w-3.5" />{adv.title}</p><div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", adv.color)} /></div><p className="text-[11px] font-bold opacity-80 leading-relaxed group-hover:opacity-100 transition-opacity">{adv.desc}</p></div>))}</div>
             <div className="pt-2"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 text-center italic">{t.dashboard.calculatedRealTime}</p></div>
           </div>
           <div className="bg-card border-2 border-primary/10 rounded-4xl p-8 shadow-xl shadow-primary/5 space-y-6"><h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.inventoryAlerts}</h3><div className="space-y-4">{myProducts.filter((p: any) => p.stock < 10).slice(0, 5).map((p: any) => (<div key={p.product_id || p.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-transparent hover:border-amber-500/20 transition-all group"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-white shadow-sm group-hover:scale-110 transition-transform"><Package className="h-4 w-4 text-amber-500" /></div><p className="text-xs font-black uppercase truncate max-w-[100px]">{p.name}</p></div><span className="text-xs font-black text-amber-600 bg-amber-500/10 px-2 py-1 rounded-lg">{p.stock} {t.product.quantity}</span></div>))}{myProducts.filter((p: any) => p.stock < 10).length === 0 && (<p className="text-center text-xs font-bold text-muted-foreground italic">{t.dashboard.stockHealthy}</p>)}</div></div>
        </div>
      </div>

      {showEditStoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-lg rounded-4xl border-2 border-primary/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-rainbow-gradient border-b flex justify-between items-center text-primary"><h3 className="text-2xl font-black tracking-tight flex items-center gap-3 uppercase tracking-tighter"><Settings className="h-6 w-6" />{t.dashboard.editStore}</h3><button onClick={() => setShowEditStoreModal(false)} className="p-2 hover:bg-black/5 rounded-full cursor-pointer"><X /></button></div>
            <form onSubmit={handleEditStore} className="p-8 space-y-6"><div className="space-y-4"><div className="space-y-2"><label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.storeName}</label><input type="text" required className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-bold" value={editStoreData.name} onChange={(e) => setEditStoreData({...editStoreData, name: e.target.value})} /></div><div className="space-y-2"><label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.storeDesc}</label><textarea required rows={4} className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-bold resize-none" value={editStoreData.description} onChange={(e) => setEditStoreData({...editStoreData, description: e.target.value})} /></div></div><button type="submit" className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer">{t.dashboard.saveChanges}</button></form>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-4xl border-2 border-primary/20 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-rainbow-gradient border-b flex justify-between items-center text-primary"><h3 className="text-2xl font-black tracking-tight flex items-center gap-3 uppercase tracking-tighter">{newProduct.id ? <Edit className="h-6 w-6" /> : <Plus className="h-6 w-6" />}{newProduct.id ? t.dashboard.editProduct : t.dashboard.addProduct}</h3><button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-black/5 rounded-full cursor-pointer"><X /></button></div>
            <form onSubmit={handleAddOrUpdateProduct} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2"><label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.table.name}</label><input type="text" required placeholder={t.dashboard.productNamePlaceholder} className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-bold" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.table.price} (฿)</label><input type="number" required className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-bold" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})} /></div>
                <div className="space-y-2"><label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.table.stock}</label><input type="number" required className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-bold" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})} /></div>
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.uploadImage}</label>
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-24 rounded-2xl bg-muted border-2 border-dashed border-primary/20 flex items-center justify-center overflow-hidden shrink-0 relative group">{newProduct.image ? (<img src={getImgSrc(newProduct.image)} className="h-full w-full object-cover" alt="Preview" />) : (<ImageIcon className="h-8 w-8 text-primary/20" />)}{isUploading && (<div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="h-6 w-6 text-white animate-spin" /></div>)}</div>
                    <div className="flex-1 space-y-2"><input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="product-image-upload" disabled={isUploading} /><label htmlFor="product-image-upload" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-all cursor-pointer disabled:opacity-50"><ImageIcon className="h-3.5 w-3.5" />{isUploading ? t.dashboard.uploading : t.dashboard.selectPhoto}</label><p className="text-xs text-muted-foreground font-medium italic leading-tight">{t.dashboard.photoDesc}</p></div>
                  </div>
                </div>
                <div className="col-span-2 space-y-2"><label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.table.category}</label><select className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-black uppercase text-xs" value={newProduct.category || "Electronics"} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}><option value="Electronics">{t.dashboard.categories.electronics}</option><option value="Fashion">{t.dashboard.categories.fashion}</option><option value="Home">{t.dashboard.categories.home}</option><option value="Sports">{t.dashboard.categories.sports}</option><option value="Beauty">{t.dashboard.categories.beauty}</option><option value="Toys">{t.dashboard.categories.toys}</option></select></div>
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.extendedFields?.weight} <span className="lowercase">{t.dashboard.extendedFields?.optional}</span></label><input type="text" placeholder={t.dashboard.extendedFields?.weightPlaceholder} className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-bold" value={newProduct.weight || ""} onChange={(e) => setNewProduct({...newProduct, weight: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.extendedFields?.dimensions} <span className="lowercase">{t.dashboard.extendedFields?.optional}</span></label><input type="text" placeholder={t.dashboard.extendedFields?.dimensionsPlaceholder} className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-bold" value={newProduct.dimensions || ""} onChange={(e) => setNewProduct({...newProduct, dimensions: e.target.value})} /></div>
                </div>
                <div className="col-span-2 space-y-2"><label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.extendedFields?.warranty} <span className="lowercase">{t.dashboard.extendedFields?.optional}</span></label><input type="text" placeholder={t.dashboard.extendedFields?.warrantyPlaceholder} className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-bold" value={newProduct.warranty || ""} onChange={(e) => setNewProduct({...newProduct, warranty: e.target.value})} /></div>
                <div className="col-span-2 space-y-2"><label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.extendedFields?.additionalDetails} <span className="lowercase">{t.dashboard.extendedFields?.optional}</span></label><textarea rows={2} placeholder={t.dashboard.extendedFields?.additionalDetailsPlaceholder} className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-bold resize-none" value={newProduct.additionalDetails || ""} onChange={(e) => setNewProduct({...newProduct, additionalDetails: e.target.value})} /></div>
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center justify-between"><label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.descPlaceholderLabel}</label>
                  <button 
                    type="button" 
                    onClick={generateAIDescription} 
                    disabled={isGeneratingDesc || !newProduct.name.trim()} 
                    className={cn(
                      "flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                      (isGeneratingDesc || !newProduct.name.trim()) 
                        ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50" 
                        : "bg-linear-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 cursor-pointer shadow-md active:scale-95"
                    )}
                  ><Sparkles className="h-3 w-3" />{isGeneratingDesc ? t.dashboard.generating : t.dashboard.aiWrite}</button></div>
                  <textarea rows={3} placeholder={t.dashboard.descPlaceholder} className={cn("w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-bold resize-none", isGeneratingDesc && "animate-pulse")} value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} />
                  {isGeneratingDesc && (<div className="flex items-center gap-2 px-2 text-xs font-black text-primary animate-bounce"><Sparkles className="h-3 w-3" />AI IS TYPING...</div>)}
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isGeneratingDesc || isUploading || !newProduct.name || newProduct.price === undefined || newProduct.stock === undefined || !newProduct.category}
                className={cn(
                  "w-full h-16 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3",
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <Trash2 className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black tracking-tight">{t.dashboard.deleteConfirm}</h3>
              <p className="text-muted-foreground font-medium">
                {language === 'th' ? 'คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?' : 'Are you sure you want to delete this product?'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl bg-muted font-black uppercase tracking-widest hover:bg-muted/80 transition-all cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={confirmDeleteProduct}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-black uppercase tracking-widest hover:bg-red-700 transition-all cursor-pointer"
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
