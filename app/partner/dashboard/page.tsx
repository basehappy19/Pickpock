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
  Image as ImageIcon
} from "lucide-react";
import { cn, formatCurrency, getImgSrc } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { uploadProductImage } from "@/lib/supabase";

export default function PartnerDashboardPage() {
  const { role, user, updateUserStore } = useRole();
  const { t } = useLanguage();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>({
    orders: [],
    products: [],
    stores: [],
    loading: true
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    category: "Electronics",
    stock: 0,
    image: "",
    description: ""
  });

  const myStore = useMemo(() => 
    dashboardData.stores.find((s: any) => s.owner_id === user?.id),
    [dashboardData.stores, user]
  );

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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myStore) return;

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProduct,
          id: "p-" + Math.random().toString(36).substr(2, 9),
          storeId: myStore.store_id,
          isOfficial: false,
          rating: 0,
          reviews: [],
          createdAt: new Date().toISOString()
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewProduct({ name: "", price: 0, category: "Electronics", stock: 0, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop", description: "" });
        fetchAllData(); // Refresh
      }
    } catch (e) {
      console.error("Failed to add product", e);
    }
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

  const stats = useMemo(() => {
    if (dashboardData.loading || !myStore) return [];

    const myRevenue = myOrders.reduce((sum: number, o: any) => sum + (o.total_price || 0), 0);

    return [
      { label: t.dashboard.stats.revenue, value: formatCurrency(myRevenue), change: "+10.2%", trend: "up", icon: TrendingUp, color: "text-emerald-500" },
      { label: t.dashboard.stats.users, value: (Math.floor(Math.random() * 500) + 100).toLocaleString(), change: "+4.1%", trend: "up", icon: Users, color: "text-blue-500" },
      { label: t.dashboard.stats.products, value: myProducts.length.toLocaleString(), change: "0%", trend: "neutral", icon: Package, color: "text-amber-500" },
      { label: "My Store Orders", value: myOrders.length.toLocaleString(), change: "+5.0%", trend: "up", icon: ShoppingBag, color: "text-purple-500" },
    ];
  }, [dashboardData.loading, myStore, t, myOrders, myProducts]);

  if (!user || (!myStore && !dashboardData.loading)) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-6 animate-in fade-in zoom-in-95 duration-700">
        <div className="p-6 rounded-full bg-primary/10 text-primary">
           <ShoppingBag className="h-16 w-16" />
        </div>
        <div className="space-y-2">
           <h2 className="text-4xl font-black tracking-tighter">Open Your <span className="text-primary text-rainbow-animate">Own Shop</span></h2>
           <p className="text-muted-foreground font-bold max-w-md">You don't have a store yet. Join our partner program to start selling your products on MSU FOUNDER.</p>
        </div>
        <button onClick={() => router.push("/partner/register")} className="h-16 px-10 rounded-2xl bg-primary text-primary-foreground font-black flex items-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-primary/20 cursor-pointer">
           <Plus className="h-6 w-6" /> {t.nav.becomePartner}
        </button>
      </div>
    );
  }

  if (dashboardData.loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="font-black text-xs uppercase tracking-widest text-muted-foreground animate-pulse">Syncing store data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter">{t.dashboard.sellerTitle}</h1>
          <p className="text-muted-foreground font-bold">{myStore?.name}</p>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setShowAddModal(true)}
             className="h-10 px-4 rounded-xl bg-primary text-primary-foreground flex items-center gap-2 font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20"
           >
             <Plus className="h-3.5 w-3.5" /> Add New Product
           </button>
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
            <h3 className="text-xl font-black tracking-tight">Recent Orders Management</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-muted/20">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order Details</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Value</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {myOrders.map((order: any) => (
                  <tr key={order.order_id || order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="font-black text-sm">{order.order_id || order.id}</p>
                        <p className="text-[10px] font-bold text-muted-foreground">{new Date(order.timestamp || order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-black text-sm">{formatCurrency(order.total_price || order.totalAmount)}</td>
                    <td className="px-8 py-6">
                      <select 
                        className={cn(
                          "text-[10px] font-black uppercase tracking-tight bg-background border-2 rounded-xl px-3 py-2 outline-none cursor-pointer transition-all",
                          order.status.toUpperCase() === "PENDING" ? "border-amber-500/20 text-amber-600 focus:border-amber-500" : 
                          order.status.toUpperCase() === "DELIVERED" ? "border-emerald-500/20 text-emerald-600 focus:border-emerald-500" :
                          "border-primary/20 text-primary focus:border-primary"
                        )}
                        value={order.status.toUpperCase()}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          await fetch("/api/orders/status", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ orderId: order.order_id || order.id, status: newStatus })
                          });
                          fetchAllData(); // Refresh
                        }}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-card border-2 border-primary/10 rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 space-y-6">
             <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Store Inventory</h3>
             <div className="space-y-4">
               {myProducts.filter((p: any) => p.stock < 10).slice(0, 5).map((p: any) => (
                 <div key={p.product_id || p.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-amber-500" />
                      <p className="text-[10px] font-black uppercase truncate max-w-[120px]">{p.name}</p>
                    </div>
                    <span className="text-[10px] font-black text-amber-600">{p.stock} Units</span>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-lg rounded-[2.5rem] border-2 border-primary/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-rainbow-gradient border-b flex justify-between items-center text-primary">
              <h3 className="text-2xl font-black tracking-tight flex items-center gap-3 uppercase tracking-tighter">
                <Plus className="h-6 w-6" />
                Add New Product
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-black/5 rounded-full cursor-pointer"><X /></button>
            </div>
            
            <form onSubmit={handleAddProduct} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter product name..."
                    className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-bold"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Price (฿)</label>
                  <input
                    type="number"
                    required
                    className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-bold"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Stock</label>
                  <input
                    type="number"
                    required
                    className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-bold"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Product Image</label>
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
                        {isUploading ? "Uploading..." : "Select Photo"}
                      </label>
                      <p className="text-[10px] text-muted-foreground font-medium italic leading-tight">Recommended: Square image, max 2MB. Stored securely on Supabase.</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</label>
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
              </div>
              <button
                type="submit"
                className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <Plus className="h-6 w-6" />
                CREATE PRODUCT
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
