"use client";

import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign,
  ArrowUpRight,
  Search,
  Filter,
  MoreVertical,
  Download,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  ShieldCheck
} from "lucide-react";
import { useFilter } from "@/hooks/use-filter";
import { useLanguage } from "@/hooks/use-language";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRole } from "@/hooks/use-role";
import { cn } from "@/lib/utils";

interface DashboardContentProps {
  initialProducts: Product[];
}

export default function DashboardContent({ initialProducts }: DashboardContentProps) {
  const { t } = useLanguage();
  const { role } = useRole();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const { filteredData, filters, updateFilter } = useFilter(products);
  const router = useRouter();

  // Redirect if customer
  if (typeof window !== 'undefined' && role === "customer") {
    router.push("/");
    return null;
  }

  // Admin Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleNotImplemented = (feature: string) => {
    alert(`${feature} is not implemented in this MVP demo.`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProd: Partial<Product> = {
      name: formData.get("name") as string,
      price: Number(formData.get("price")),
      category: formData.get("category") as string,
      stock: Number(formData.get("stock")),
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...newProd } : p));
    } else {
      const addedProd: Product = {
        ...products[0], // Copy dummy data
        id: `p${Date.now()}`,
        ...newProd as any,
        reviews: [],
        rating: 0,
      };
      setProducts([addedProd, ...products]);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const stats = [
    { 
      title: t.dashboard.stats.revenue, 
      value: formatCurrency(125000), 
      icon: DollarSign, 
      trend: "+12.5%", 
      color: "from-blue-600/20 to-blue-600/5",
      iconColor: "text-blue-600"
    },
    { 
      title: t.dashboard.stats.users, 
      value: "1,240", 
      icon: Users, 
      trend: "+5.2%", 
      color: "from-indigo-600/20 to-indigo-600/5",
      iconColor: "text-indigo-600" 
    },
    { 
      title: t.dashboard.stats.products, 
      value: products.length, 
      icon: Package, 
      trend: "0%", 
      color: "from-emerald-600/20 to-emerald-600/5",
      iconColor: "text-emerald-600" 
    },
    { 
      title: t.dashboard.stats.rating, 
      value: "4.7", 
      icon: TrendingUp, 
      trend: "+0.2", 
      color: "from-amber-600/20 to-amber-600/5",
      iconColor: "text-amber-600" 
    },
  ];

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-5xl font-black tracking-tight lg:bg-clip-text lg:text-transparent lg:bg-gradient-to-r from-foreground to-foreground/70 text-foreground">
            {role === "founder" ? "Founder Dashboard" : t.dashboard.title}
          </h1>
          <p className="text-sm lg:text-lg text-muted-foreground max-w-[600px]">
            {role === "founder" ? "Manage your store empire and scale to new heights." : t.dashboard.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(role === "founder" || role === "seller") ? (
            <button 
              onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-6 py-3 text-sm font-black rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-xl shadow-primary/20 cursor-pointer"
            >
              <Plus className="h-5 w-5" /> Add New Product
            </button>
          ) : (
            <>
              <button 
                onClick={() => handleNotImplemented(t.common.export)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all shadow-sm cursor-pointer"
              >
                <Download className="h-4 w-4" /> {t.common.export}
              </button>
              <button 
                onClick={() => handleNotImplemented(t.common.view)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-md shadow-primary/20 cursor-pointer"
              >
                {t.common.daily} {t.common.view}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="group relative overflow-hidden bg-card p-5 lg:p-6 rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`absolute top-0 right-0 h-32 w-32 bg-gradient-to-br ${stat.color} rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`} />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 lg:p-3 rounded-xl bg-muted transition-colors group-hover:bg-background ${stat.iconColor}`}>
                  <stat.icon size={20} />
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] lg:text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  {stat.trend} <ArrowUpRight size={12} className="ml-1" />
                </span>
              </div>
              <div>
                <p className="text-[10px] lg:text-xs font-black text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-xl lg:text-2xl font-black mt-1 tracking-tight">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="p-4 lg:p-8 border-b bg-muted/30 flex flex-col lg:flex-row justify-between gap-4 lg:gap-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center flex-1 max-w-3xl">
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
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-48">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
                  <select 
                    className="w-full pl-10 pr-4 py-2.5 lg:py-3 rounded-xl border-2 border-transparent bg-background focus:border-primary/20 outline-none transition-all text-sm font-semibold appearance-none cursor-pointer"
                    value={filters.category}
                    onChange={(e) => updateFilter({ category: e.target.value })}
                  >
                    <option value="all">{t.dashboard.filters.allCategories}</option>
                    {Array.from(new Set(products.map(p => p.category))).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-muted-foreground text-[10px] lg:text-xs font-bold uppercase tracking-widest border-b">
                  <th className="px-6 lg:px-8 py-4 lg:py-5 font-bold">{t.dashboard.table.name}</th>
                  <th className="px-6 lg:px-8 py-4 lg:py-5 font-bold">{t.dashboard.table.category}</th>
                  <th className="px-6 lg:px-8 py-4 lg:py-5 font-bold">{t.dashboard.table.price}</th>
                  <th className="px-6 lg:px-8 py-4 lg:py-5 font-bold hidden sm:table-cell">{t.dashboard.table.stock}</th>
                  <th className="px-6 lg:px-8 py-4 lg:py-5 font-bold hidden md:table-cell">{t.dashboard.table.status}</th>
                  <th className="px-6 lg:px-8 py-4 lg:py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted">
                {filteredData.map((item) => (
                  <tr key={item.id} className="group hover:bg-muted/50 transition-colors">
                    <td className="px-6 lg:px-8 py-4 lg:py-5 font-bold text-sm text-foreground/90">{item.name}</td>
                    <td className="px-6 lg:px-8 py-4 lg:py-5">
                      <span className="px-2 py-0.5 rounded-lg bg-secondary text-secondary-foreground text-[10px] font-bold">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 lg:px-8 py-4 lg:py-5 font-mono font-bold text-sm text-primary">{formatCurrency(item.price)}</td>
                    <td className="px-6 lg:px-8 py-4 lg:py-5 font-medium text-sm hidden sm:table-cell">{item.stock}</td>
                    <td className="px-6 lg:px-8 py-4 lg:py-5 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full ${
                          item.stock > 10 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                        }`} />
                        <span className={`text-[10px] font-bold ${
                          item.stock > 10 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        }`}>
                          {item.stock > 10 ? t.dashboard.table.inStock : t.dashboard.table.lowStock}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 lg:px-8 py-4 lg:py-5 text-right">
                      <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        {(role === "founder" || role === "seller") ? (
                          <>
                            <button 
                              onClick={() => { setEditingProduct(item); setIsModalOpen(true); }}
                              className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-all cursor-pointer border shadow-sm"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-500 transition-all cursor-pointer border shadow-sm"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => router.push(`/products/${item.id}`)}
                            className="p-1.5 rounded-lg hover:bg-background transition-all border shadow-sm cursor-pointer"
                          >
                            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-lg rounded-2xl border-2 border-primary/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 lg:p-8 bg-rainbow-gradient border-b flex justify-between items-center">
              <h3 className="text-xl lg:text-2xl font-black tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full cursor-pointer"><X /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 lg:p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Product Name</label>
                <input name="name" defaultValue={editingProduct?.name} required className="w-full px-5 py-3 lg:py-4 rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-primary outline-none font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Price (THB)</label>
                  <input name="price" type="number" defaultValue={editingProduct?.price} required className="w-full px-5 py-3 lg:py-4 rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-primary outline-none font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Stock</label>
                  <input name="stock" type="number" defaultValue={editingProduct?.stock} required className="w-full px-5 py-3 lg:py-4 rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-primary outline-none font-bold" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Category</label>
                <input name="category" defaultValue={editingProduct?.category} required className="w-full px-5 py-3 lg:py-4 rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-primary outline-none font-bold" />
              </div>
              <button type="submit" className="w-full h-14 lg:h-16 rounded-xl bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-3 cursor-pointer">
                <Save className="h-6 w-6" /> Save Product Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
