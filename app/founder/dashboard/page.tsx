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
    category: "Electronics",
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
      alert("Failed to upload image. Check your Supabase configuration.");
    }
    setIsUploading(false);
  };

  const generateAIDescription = async () => {
    if (!newProduct.name) {
      alert("กรุณาใส่ชื่อสินค้าก่อน / Please enter product name first");
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
      alert("Failed to generate description. Please try again.");
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
        setNewProduct({ id: "", name: "", price: 0, category: "Electronics", stock: 0, image: "", description: "", storeId: "mall", isOfficial: true });
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter">{t.dashboard.founderTitle}</h1>
          <p className="text-muted-foreground font-bold">{t.dashboard.founderSubtitle}</p>
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
        {/* Sales Trend - Area Chart */}
        <div className="lg:col-span-2 bg-card border-2 border-primary/5 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black tracking-tight uppercase">Sales Analytics</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Revenue performance over the last 7 days</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
              <TrendingUp className="h-3.5 w-3.5" /> +12% vs last week
            </div>
          </div>
          
          <div className="h-[250px] w-full relative pt-4">
             <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
               <defs>
                 <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
                   <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                 </linearGradient>
               </defs>
               {[0, 50, 100, 150].map(y => (
                 <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
               ))}
               <path 
                 d="M0 180 Q 100 140, 200 160 T 400 80 T 600 100 T 800 40 L 800 200 L 0 200 Z" 
                 fill="url(#fade)" 
                 className="text-primary"
               />
               <path 
                 d="M0 180 Q 100 140, 200 160 T 400 80 T 600 100 T 800 40" 
                 fill="none" 
                 stroke="currentColor" 
                 strokeWidth="4" 
                 strokeLinecap="round" 
                 strokeLinejoin="round"
                 className="text-primary"
               />
               {[
                 {x: 200, y: 160}, {x: 400, y: 80}, {x: 600, y: 100}, {x: 800, y: 40}
               ].map((p, i) => (
                 <circle key={i} cx={p.x} cy={p.y} r="6" className="fill-background stroke-primary stroke-[3px]" />
               ))}
             </svg>
             <div className="flex justify-between mt-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
               <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
             </div>
          </div>
        </div>

        {/* Category Share - Bar Chart */}
        <div className="bg-card border-2 border-primary/5 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 space-y-6">
          <h3 className="text-xl font-black tracking-tight uppercase">Category Distribution</h3>
          <div className="space-y-5">
            {[
              { label: 'Electronics', count: 45, color: 'bg-blue-500' },
              { label: 'Fashion', count: 32, color: 'bg-rose-500' },
              { label: 'Beauty', count: 28, color: 'bg-amber-500' },
              { label: 'Sports', count: 15, color: 'bg-emerald-500' },
              { label: 'Home', count: 12, color: 'bg-purple-500' },
            ].map((cat) => (
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
            ))}
          </div>
        </div>

        {/* Market Share - Donut Chart */}
        <div className="bg-card border-2 border-primary/5 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 space-y-8 flex flex-col items-center justify-center">
          <div className="text-center">
            <h3 className="text-xl font-black tracking-tight uppercase">Revenue Share</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Official vs Partners</p>
          </div>
          
          <div className="relative h-48 w-48">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-muted/30" />
              <circle 
                cx="50" cy="50" r="40" 
                fill="transparent" 
                stroke="currentColor" 
                strokeWidth="12" 
                strokeDasharray="251.2" 
                strokeDashoffset="75.36" 
                strokeLinecap="round"
                className="text-primary transition-all duration-1000" 
              />
              <circle 
                cx="50" cy="50" r="40" 
                fill="transparent" 
                stroke="currentColor" 
                strokeWidth="12" 
                strokeDasharray="251.2" 
                strokeDashoffset="188.4" 
                style={{ strokeDashoffset: '188.4', strokeDasharray: '251.2' }}
                strokeLinecap="round"
                className="text-amber-500" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black tracking-tighter">70%</span>
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Official</span>
            </div>
          </div>
          
          <div className="w-full grid grid-cols-2 gap-4">
             <div className="flex items-center gap-2">
               <div className="h-3 w-3 rounded-full bg-primary" />
               <span className="text-[10px] font-black uppercase tracking-tight">Official (70%)</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="h-3 w-3 rounded-full bg-amber-500" />
               <span className="text-[10px] font-black uppercase tracking-tight">Partners (30%)</span>
             </div>
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
          <h2 className="text-2xl font-black tracking-tight uppercase">Platform Inventory</h2>
          <button 
             onClick={() => {
               setNewProduct({ id: "", name: "", price: 0, category: "Electronics", stock: 0, image: "", description: "", storeId: "mall", isOfficial: true });
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
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Store</th>
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
                         {product.isOfficial ? "Official Mall" : (dashboardData.stores.find((s:any) => s.store_id === product.storeId)?.name || "Partner Store")}
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
                    placeholder="Enter product name..."
                    className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-bold"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Assigned Store</label>
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
                    <option value="mall">MSU Official Mall</option>
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
                    <option>Electronics</option>
                    <option>Fashion</option>
                    <option>Home</option>
                    <option>Sports</option>
                    <option>Beauty</option>
                    <option>Toys</option>
                  </select>
                </div>

                <div className="col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">รายละเอียดสินค้า / Description</label>
                    <button
                      type="button"
                      onClick={generateAIDescription}
                      disabled={isGeneratingDesc || !newProduct.name}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3" />
                      {isGeneratingDesc ? "กำลังสร้าง..." : "AI เขียนให้"}
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Enter product description or use AI to generate..."
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
