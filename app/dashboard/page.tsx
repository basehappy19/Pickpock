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
import { cn, formatCurrency } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";

export default function DashboardPage() {
  const { role, user } = useRole();
  const { t } = useLanguage();
  const [dashboardData, setDashboardData] = useState<any>({
    orders: [],
    users: [],
    products: [],
    stores: [],
    loading: true
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    category: "Electronics",
    stock: 0,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop",
    description: ""
  });

  const isFounder = role === "founder";
  const myStore = useMemo(() => 
    dashboardData.stores.find((s: any) => s.owner_id === user?.id),
    [dashboardData.stores, user]
  );

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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myStore && !isFounder) return;

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProduct,
          id: "p-" + Math.random().toString(36).substr(2, 9),
          storeId: myStore?.store_id || "mall",
          isOfficial: isFounder,
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

  const stats = useMemo(() => {
    if (dashboardData.loading) return [];

    // Create a product lookup for accurate revenue mapping
    const productLookup = dashboardData.products.reduce((acc: any, p: any) => {
      acc[p.product_id || p.id] = p;
      return acc;
    }, {});

    // FOUNDER: Platform-wide analysis
    if (isFounder) {
      const globalRevenue = dashboardData.orders.reduce((sum: number, o: any) => sum + (o.total_price || 0), 0);
      
      // Calculate Mall-only revenue (products where isOfficial is true or storeId is 'mall')
      const mallRevenue = dashboardData.orders.reduce((sum: number, o: any) => {
        const orderMallTotal = o.items.reduce((itemSum: number, item: any) => {
          const product = productLookup[item.product_id];
          if (product && (product.isOfficial || product.storeId === "mall")) {
            // Since order only has total_price, we estimate mall portion if items are mixed
            // or assume order is per-store. For demo: assume order total belongs to mall if it has mall items.
            return o.total_price; 
          }
          return 0;
        }, 0);
        return sum + (orderMallTotal > 0 ? o.total_price : 0);
      }, 0);

      return [
        { label: "Global Revenue", value: formatCurrency(globalRevenue), change: "+12.5%", trend: "up", icon: TrendingUp, color: "text-emerald-500" },
        { label: "Mall Sales", value: formatCurrency(mallRevenue), change: "+8.2%", trend: "up", icon: ShoppingBag, color: "text-amber-500" },
        { label: "Total Users", value: dashboardData.users.length.toLocaleString(), change: "+5.2%", trend: "up", icon: Users, color: "text-blue-500" },
        { label: "Partner Stores", value: dashboardData.stores.length.toLocaleString(), change: "+8.4%", trend: "up", icon: Package, color: "text-purple-500" },
      ];
    }

    // PARTNER: Store-specific analysis
    const myProducts = dashboardData.products.filter((p: any) => p.storeId === myStore?.store_id);
    const myProductIds = myProducts.map((p: any) => p.product_id || p.id);
    const myOrders = dashboardData.orders.filter((o: any) => 
      o.items.some((item: any) => myProductIds.includes(item.product_id))
    );
    const myRevenue = myOrders.reduce((sum: number, o: any) => sum + (o.total_price || 0), 0);

    return [
      { label: "Store Revenue", value: formatCurrency(myRevenue), change: "+10.2%", trend: "up", icon: TrendingUp, color: "text-emerald-500" },
      { label: "Store Visitors", value: (Math.floor(Math.random() * 500) + 100).toLocaleString(), change: "+4.1%", trend: "up", icon: Users, color: "text-blue-500" },
      { label: "My Products", value: myProducts.length.toLocaleString(), change: "0%", trend: "neutral", icon: Package, color: "text-amber-500" },
      { label: "Store Orders", value: myOrders.length.toLocaleString(), change: "+5.0%", trend: "up", icon: ShoppingBag, color: "text-purple-500" },
    ];
  }, [dashboardData, isFounder, myStore]);

  if (dashboardData.loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="font-black text-xs uppercase tracking-widest text-muted-foreground animate-pulse">Syncing real-time data...</p>
      </div>
    );
  }

  // Handle case where user is not founder and has no store
  if (!isFounder && !myStore) {
     return (
       <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-6 animate-in fade-in zoom-in-95 duration-700">
         <div className="p-6 rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="h-16 w-16" />
         </div>
         <div className="space-y-2">
            <h2 className="text-4xl font-black tracking-tighter">Open Your <span className="text-primary text-rainbow-animate">Own Shop</span></h2>
            <p className="text-muted-foreground font-bold max-w-md">You don't have a store yet. Join our partner program to start selling your products on MSU FOUNDER.</p>
         </div>
         <a href="/partner/register" className="h-16 px-10 rounded-2xl bg-primary text-primary-foreground font-black flex items-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-primary/20">
            <Plus className="h-6 w-6" /> BECOME A PARTNER
         </a>
       </div>
     );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter">
            {isFounder ? t.dashboard.founderTitle : t.dashboard.sellerTitle}
          </h1>
          <p className="text-muted-foreground font-bold">
            {isFounder ? t.dashboard.founderSubtitle : (myStore ? `Managing: ${myStore.name}` : t.dashboard.sellerSubtitle)}
          </p>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setShowAddModal(true)}
             className="h-10 px-4 rounded-xl bg-primary text-primary-foreground flex items-center gap-2 font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20"
           >
             <Plus className="h-3.5 w-3.5" /> Add New Product
           </button>
           <div className="h-10 px-4 rounded-xl bg-muted/50 border flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-muted-foreground">
             <Clock className="h-3.5 w-3.5" /> Last Updated: Just Now
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border-2 border-primary/5 rounded-[2rem] p-6 shadow-xl shadow-primary/5 space-y-4 hover:border-primary/20 transition-all group">
            <div className="flex justify-between items-start">
              <div className={cn("p-3 rounded-2xl bg-muted group-hover:bg-primary/10 transition-colors", stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-black px-2 py-1 rounded-lg",
                stat.trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {stat.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {stat.change}
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
        {/* Recent Orders/Products Table */}
        <div className="lg:col-span-2 bg-card border-2 border-primary/5 rounded-[2.5rem] shadow-2xl shadow-primary/5 overflow-hidden">
          <div className="p-8 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-black tracking-tight">{isFounder ? "Partner Stores" : "My Products"}</h3>
            <div className="flex items-center gap-2">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <input 
                   placeholder="Search..." 
                   className="h-10 pl-10 pr-4 rounded-xl bg-muted/50 border-none text-xs font-bold w-48 focus:ring-2 focus:ring-primary/20 outline-none"
                 />
               </div>
               <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                 <Filter className="h-4 w-4" />
               </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-muted/20">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Details</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{isFounder ? "Rating" : "Stock"}</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Value</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isFounder ? (
                  dashboardData.stores.slice(0, 10).map((store: any) => (
                    <tr key={store.store_id} className="hover:bg-muted/30 transition-colors group">
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
                          <StarIcon className="h-3 w-3 fill-current" />
                          <span className="text-[10px] font-black">{store.rating}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-2 w-2 rounded-full animate-pulse",
                            store.status === "active" ? "bg-emerald-500" : "bg-amber-500"
                          )} />
                          <span className="text-[10px] font-black uppercase tracking-tight text-emerald-600">{store.status}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-black text-sm">---</td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  dashboardData.products.filter((p: any) => p.storeId === myStore?.store_id).map((product: any) => (
                    <tr key={product.product_id || product.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 overflow-hidden">
                            <img src={product.image} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-black text-sm">{product.name}</p>
                            <p className="text-[10px] font-bold text-muted-foreground">{product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black">{product.stock} Units</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-2 w-2 rounded-full animate-pulse",
                            product.stock > 0 ? "bg-emerald-500" : "bg-rose-500"
                          )} />
                          <span className="text-[10px] font-black uppercase tracking-tight text-emerald-600">
                            {product.stock > 0 ? "Live" : "Out of Stock"}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-black text-sm">{formatCurrency(product.price)}</td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Insights / Sidebar */}
        <div className="space-y-6">
           <div className="bg-primary text-primary-foreground rounded-[2.5rem] p-8 shadow-2xl shadow-primary/20 space-y-6 relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
             <div className="relative space-y-4">
               <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                 <BarChart3 className="h-6 w-6" />
               </div>
               <h3 className="text-2xl font-black tracking-tighter leading-tight">AI Sales Forecast</h3>
               <p className="text-white/80 font-bold text-sm leading-relaxed">
                 Based on your current performance, we expect a <span className="text-white font-black underline decoration-2 underline-offset-4">15% increase</span> in sales over the next 7 days.
               </p>
               <button className="w-full py-4 rounded-2xl bg-white text-primary font-black text-xs uppercase tracking-widest shadow-lg hover:bg-white/90 transition-all">
                 View Full Report
               </button>
             </div>
           </div>

           <div className="bg-card border-2 border-primary/10 rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 space-y-6">
             <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Inventory Alerts</h3>
             <div className="space-y-4">
               {dashboardData.products.filter((p: any) => p.stock < 10).slice(0, 3).map((p: any) => (
                 <div key={p.product_id || p.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-amber-500" />
                      <p className="text-[10px] font-black uppercase truncate max-w-[120px]">{p.name}</p>
                    </div>
                    <span className="text-[10px] font-black text-amber-600">{p.stock} Left</span>
                 </div>
               ))}
               {dashboardData.products.filter((p: any) => p.stock < 10).length === 0 && (
                 <p className="text-xs font-bold text-muted-foreground text-center">All inventory healthy</p>
               )}
             </div>
           </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-lg rounded-[2.5rem] border-2 border-primary/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-rainbow-gradient border-b flex justify-between items-center">
              <h3 className="text-2xl font-black tracking-tight flex items-center gap-3 uppercase tracking-tighter">
                <Plus className="h-6 w-6 text-primary" />
                Add New Product
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-black/5 rounded-full cursor-pointer">
                <X className="h-6 w-6" />
              </button>
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
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</label>
                  <textarea
                    required
                    rows={3}
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

function StarIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
