"use client";

import { Product } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import {
  TrendingUp,
  Users,
  Package,
  DollarSign,
  ArrowUpRight,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  ShieldCheck,
  Box,
  Upload,
  Store,
  ArrowRight
} from "lucide-react";
import { useFilter } from "@/hooks/use-filter";
import { useLanguage } from "@/hooks/use-language";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useRole } from "@/hooks/use-role";
import { uploadProductImage } from "@/lib/supabase";
import NextImage from "next/image";
import { useGlobalData } from "@/hooks/use-global-data";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';

interface DashboardContentProps {
  initialProducts: Product[];
}

export default function DashboardContent({ initialProducts }: DashboardContentProps) {
  const { t } = useLanguage();
  const { role } = useRole();
  const { products, addProduct, updateProduct, deleteProduct, orders, stores } = useGlobalData();
  const { filteredData, filters, updateFilter } = useFilter(products);
  const router = useRouter();

  // Admin Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (editingProduct) {
      setImageUrl(editingProduct.image);
    } else {
      setImageUrl("");
    }
  }, [editingProduct]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      if (url) {
        setImageUrl(url);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const productData: any = {
      name: formData.get("name") as string,
      price: Number(formData.get("price")),
      stock: Number(formData.get("stock")),
      category: formData.get("category") as string,
      image: imageUrl || (editingProduct?.image || ""),
      weight: formData.get("weight") as string,
      dimensions: formData.get("dimensions") as string,
      warranty: formData.get("warranty") as string,
      additionalDetails: formData.get("additionalDetails") as string,
    };

    if (editingProduct) {
      await updateProduct({ ...editingProduct, ...productData });
    } else {
      const newId = "p-" + Math.random().toString(36).substring(2, 9);
      await addProduct({
        ...productData,
        id: newId,
        rating: 0,
        reviews: [],
        status: 'active',
        createdAt: new Date().toISOString()
      });
    }
    setIsModalOpen(false);
    setEditingProduct(null);
    setImageUrl("");
  };

  // Process Real Data for Charts
  const analyticsData = useMemo(() => {
    // 1. Sales over last 7 days (mocking dates to be recent since data is old)
    // In a real app, we'd use current date. Here we'll take the latest order date as "today".
    const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const latestDate = sortedOrders.length > 0 ? new Date(sortedOrders[0].createdAt) : new Date();
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(latestDate);
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const dailySales = last7Days.map(date => {
      const dayTotal = orders
        .filter(o => o.createdAt.startsWith(date))
        .reduce((sum, o) => sum + o.totalAmount, 0);
      
      return {
        name: new Date(date).toLocaleDateString('th-TH', { weekday: 'short' }),
        revenue: dayTotal,
        orders: orders.filter(o => o.createdAt.startsWith(date)).length
      };
    });

    // 2. Top Products by Quantity
    const productSales: Record<string, number> = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .filter(([id]) => products.some(p => p.id === id))
      .map(([id, quantity]) => ({
        name: products.find(p => p.id === id)?.name?.slice(0, 15) || id,
        value: quantity
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // 3. Top Stores by Revenue
    const storeRevenue: Record<string, number> = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const storeId = product?.storeId || 'unknown';
        const storeName = stores.find(s => s.store_id === storeId)?.name || 'Other';
        storeRevenue[storeName] = (storeRevenue[storeName] || 0) + (item.quantity * (product?.price || 0));
      });
    });

    const topStores = Object.entries(storeRevenue)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate Growth (+12% as requested, but could be calculated)
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      dailySales,
      topProducts,
      topStores,
      totalRevenue
    };
  }, [orders, products, stores]);

  const stats = [
    { title: t.dashboard.stats.revenue, value: formatCurrency(analyticsData.totalRevenue), icon: DollarSign, trend: "+12%", color: "from-blue-600/20 to-blue-600/5", iconColor: "text-blue-600" },
    { title: t.dashboard.stats.users, value: "1,240", icon: Users, trend: "+5.2%", color: "from-indigo-600/20 to-indigo-600/5", iconColor: "text-indigo-600" },
    { title: t.dashboard.stats.products, value: products.length, icon: Package, trend: "0%", color: "from-emerald-600/20 to-emerald-600/5", iconColor: "text-emerald-600" },
    { title: t.dashboard.stats.rating, value: "4.8", icon: TrendingUp, trend: "+0.2", color: "from-amber-600/20 to-amber-600/5", iconColor: "text-amber-600" },
  ];

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-8 animate-in fade-in duration-700 pb-20 lg:pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-3xl lg:text-5xl font-black tracking-tight lg:bg-clip-text lg:text-transparent lg:bg-gradient-to-r from-foreground to-foreground/70 text-foreground uppercase tracking-tighter">
            {t.dashboard.founderTitle}
          </h1>
          <p className="text-sm lg:text-lg text-muted-foreground max-w-[600px]">
            {t.dashboard.founderSubtitle}
          </p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-6 py-4 text-sm font-black rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-xl shadow-primary/20 cursor-pointer"
        >
          <Plus className="h-5 w-5" /> {t.dashboard.addProduct}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="group relative overflow-hidden bg-card p-5 lg:p-6 rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`absolute top-0 right-0 h-32 w-32 bg-gradient-to-br ${stat.color} rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`} />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 lg:p-3 rounded-xl bg-muted transition-colors group-hover:bg-background ${stat.iconColor}`}>
                  <stat.icon size={20} />
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs lg:text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  {stat.trend} <ArrowUpRight size={12} className="ml-1" />
                </span>
              </div>
              <div>
                <p className="text-xs lg:text-xs font-black text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-xl lg:text-2xl font-black mt-1 tracking-tight">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Graph */}
        <div className="bg-card border-2 border-primary/5 rounded-[2.5rem] p-6 lg:p-8 shadow-xl shadow-primary/5 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black tracking-tight uppercase">{t.dashboard.salesPerformanceTitle}</h3>
              <p className="text-xs text-muted-foreground font-bold">{t.dashboard.salesTrend}</p>
            </div>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData.dailySales}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold' }}
                  tickFormatter={(val) => `฿${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: any) => [formatCurrency(val), "ยอดขาย"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--color-primary)" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Store Performance */}
        <div className="bg-card border-2 border-primary/5 rounded-[2.5rem] p-6 lg:p-8 shadow-xl shadow-primary/5 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black tracking-tight uppercase">{t.dashboard.topStores}</h3>
            <Store className="h-5 w-5 text-indigo-600" />
          </div>
          
          <div className="space-y-6">
            {analyticsData.topStores.map((store, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-sm font-black uppercase tracking-tight">
                  <span className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center text-xs">{i + 1}</span>
                    {store.name}
                  </span>
                  <span className="text-primary">{formatCurrency(store.revenue)}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-1000"
                    style={{ width: `${(store.revenue / analyticsData.topStores[0].revenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button className="w-full py-4 rounded-xl border-2 border-dashed border-muted-foreground/20 text-xs font-black uppercase tracking-widest hover:bg-muted/50 transition-all flex items-center justify-center gap-2">
            {t.dashboard.viewAllStoreReports} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Best Selling Products */}
      <div className="bg-card border-2 border-primary/5 rounded-[2.5rem] p-6 lg:p-8 shadow-xl shadow-primary/5 space-y-6">
        <h3 className="text-xl font-black tracking-tight uppercase">{t.dashboard.bestSellingProducts}</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData.topProducts}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 'bold' }} 
                dy={10}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {analyticsData.topProducts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index % 5]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Management Table */}
      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 lg:p-8 border-b bg-muted/30 flex flex-col lg:flex-row justify-between gap-4 lg:gap-6 text-center md:text-left">
          <h2 className="text-2xl font-black tracking-tight uppercase tracking-tighter">{t.dashboard.systemProducts}</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-center flex-1 max-w-xl">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder={t.dashboard.filters.search}
                className="w-full pl-10 pr-6 py-2.5 lg:py-3 rounded-xl border-2 border-transparent bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium"
                value={filters.search}
                onChange={(e) => updateFilter({ search: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs lg:text-xs font-black uppercase tracking-widest border-b">
                <th className="px-6 lg:px-8 py-4 lg:py-5 font-black">{t.dashboard.table.name}</th>
                <th className="px-6 lg:px-8 py-4 lg:py-5 font-black">{t.dashboard.table.category}</th>
                <th className="px-6 lg:px-8 py-4 lg:py-5 font-black">{t.dashboard.table.price}</th>
                <th className="px-6 lg:px-8 py-4 lg:py-5 font-black hidden sm:table-cell">{t.dashboard.table.stock}</th>
                <th className="px-6 lg:px-8 py-4 lg:py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted">
              {filteredData.map((item) => (
                <tr key={item.id} className="group hover:bg-muted/50 transition-colors">
                  <td className="px-6 lg:px-8 py-4 lg:py-5 font-bold text-foreground/90">{item.name}</td>
                  <td className="px-6 lg:px-8 py-4 lg:py-5 text-xs font-black uppercase text-muted-foreground">{(t.categories as Record<string, string>)[item.category] || item.category}</td>
                  <td className="px-6 lg:px-8 py-4 lg:py-5 font-mono font-black text-primary">{formatCurrency(item.price)}</td>
                  <td className="px-6 lg:px-8 py-4 lg:py-5 font-bold hidden sm:table-cell">{item.stock}</td>
                  <td className="px-6 lg:px-8 py-4 lg:py-5 text-right">
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingProduct(item); setIsModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-all cursor-pointer border shadow-sm"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => deleteProduct(item.id)} className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-500 transition-all cursor-pointer border shadow-sm"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border-2 border-primary/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 lg:p-8 bg-rainbow-gradient border-b flex justify-between items-center shrink-0">
              <h3 className="text-xl lg:text-2xl font-black tracking-tight flex items-center gap-2 uppercase tracking-tighter">
                <ShieldCheck className="h-6 w-6 text-primary" />
                {editingProduct ? t.dashboard.editProduct : t.dashboard.addProduct}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full cursor-pointer"><X /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 lg:p-8 space-y-6 overflow-y-auto flex-1">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.uploadImage}</label>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-xl overflow-hidden border bg-muted flex-shrink-0">
                    {imageUrl ? <NextImage src={imageUrl} alt="Preview" fill className="object-cover" /> : <Box className="h-full w-full p-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="img-upload" disabled={uploading} />
                    <label htmlFor="img-upload" className="inline-flex h-9 px-4 items-center justify-center rounded-lg border-2 border-dashed border-primary/30 text-xs font-black uppercase tracking-widest hover:bg-primary/5 transition-colors cursor-pointer">
                      {uploading ? t.dashboard.uploading : <><Upload className="h-3.5 w-3.5 mr-2" /> {t.dashboard.chooseImage}</>}
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.table.name}</label>
                <input name="name" defaultValue={editingProduct?.name} required className="w-full px-4 py-3 rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-primary outline-none font-bold text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.table.price} (฿)</label>
                  <input name="price" type="number" defaultValue={editingProduct?.price} required className="w-full px-4 py-3 rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-primary outline-none font-bold text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.table.stock}</label>
                  <input name="stock" type="number" defaultValue={editingProduct?.stock} required className="w-full px-4 py-3 rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-primary outline-none font-bold text-sm" />
                </div>
              </div>
              
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.table.category}</label>
                <select
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-primary outline-none font-bold text-sm"
                  name="category"
                  defaultValue={editingProduct?.category || "Electronics"}
                >
                  <option>{t.dashboard.categories.electronics}</option>
                  <option>{t.dashboard.categories.fashion}</option>
                  <option>{t.dashboard.categories.home}</option>
                  <option>{t.dashboard.categories.sports}</option>
                  <option>{t.dashboard.categories.beauty}</option>
                  <option>{t.dashboard.categories.toys}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.extendedFields?.weight} <span className="lowercase">{t.dashboard.extendedFields?.optional}</span></label>
                  <input name="weight" placeholder={t.dashboard.extendedFields?.weightPlaceholder} defaultValue={editingProduct?.weight} className="w-full px-4 py-3 rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-primary outline-none font-bold text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.extendedFields?.dimensions} <span className="lowercase">{t.dashboard.extendedFields?.optional}</span></label>
                  <input name="dimensions" placeholder={t.dashboard.extendedFields?.dimensionsPlaceholder} defaultValue={editingProduct?.dimensions} className="w-full px-4 py-3 rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-primary outline-none font-bold text-sm" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.extendedFields?.warranty} <span className="lowercase">{t.dashboard.extendedFields?.optional}</span></label>
                <input name="warranty" placeholder={t.dashboard.extendedFields?.warrantyPlaceholder} defaultValue={editingProduct?.warranty} className="w-full px-4 py-3 rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-primary outline-none font-bold text-sm" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.dashboard.extendedFields?.additionalDetails} <span className="lowercase">{t.dashboard.extendedFields?.optional}</span></label>
                <textarea name="additionalDetails" placeholder={t.dashboard.extendedFields?.additionalDetailsPlaceholder} defaultValue={editingProduct?.additionalDetails} className="w-full px-4 py-3 rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-primary outline-none font-bold text-sm min-h-[100px]" />
              </div>
              <button type="submit" className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-3 cursor-pointer">
                <Save className="h-5 w-5" /> {t.dashboard.saveProduct}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
