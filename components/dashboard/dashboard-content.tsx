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
  Download
} from "lucide-react";
import { useFilter } from "@/hooks/use-filter";
import { useLanguage } from "@/hooks/use-language";
import { useRouter } from "next/navigation";

interface DashboardContentProps {
  initialProducts: Product[];
}

export default function DashboardContent({ initialProducts }: DashboardContentProps) {
  const { t } = useLanguage();
  const { filteredData, filters, updateFilter } = useFilter(initialProducts);
  const router = useRouter();

  const handleNotImplemented = (feature: string) => {
    alert(`${feature} is not implemented in this MVP demo.`);
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
      value: initialProducts.length, 
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
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            {t.dashboard.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-[600px]">
            {t.dashboard.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleNotImplemented("Export")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all shadow-sm cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export
          </button>
          <button 
            onClick={() => handleNotImplemented("View Filter")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-md shadow-primary/20 cursor-pointer"
          >
            {t.common.daily} view
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="group relative overflow-hidden bg-card p-6 rounded-3xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`absolute top-0 right-0 h-32 w-32 bg-gradient-to-br ${stat.color} rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`} />
            
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl bg-muted transition-colors group-hover:bg-background ${stat.iconColor}`}>
                  <stat.icon size={24} />
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  {stat.trend} <ArrowUpRight size={14} className="ml-1" />
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-3xl font-bold mt-1 tracking-tight">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-8">
        {/* Filter & Table Container */}
        <div className="bg-card rounded-[2rem] border shadow-sm overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="p-6 lg:p-8 border-b bg-muted/30 flex flex-col lg:flex-row justify-between gap-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center flex-1 max-w-3xl">
              <div className="relative flex-1 w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder={t.dashboard.filters.search}
                  className="w-full pl-12 pr-6 py-3 rounded-2xl border-2 border-transparent bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium"
                  value={filters.search}
                  onChange={(e) => updateFilter({ search: e.target.value })}
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-48">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
                  <select 
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-transparent bg-background focus:border-primary/20 outline-none transition-all text-sm font-semibold appearance-none cursor-pointer"
                    value={filters.category}
                    onChange={(e) => updateFilter({ category: e.target.value })}
                  >
                    <option value="all">{t.dashboard.filters.allCategories}</option>
                    {Array.from(new Set(initialProducts.map(p => p.category))).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end lg:self-center">
              <button 
                onClick={() => handleNotImplemented("More Actions")}
                className="p-3 rounded-xl border hover:bg-muted transition-colors cursor-pointer"
              >
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-muted-foreground text-xs font-bold uppercase tracking-widest border-b">
                  <th className="px-8 py-5 font-bold">{t.dashboard.table.name}</th>
                  <th className="px-8 py-5 font-bold">{t.dashboard.table.category}</th>
                  <th className="px-8 py-5 font-bold">{t.dashboard.table.price}</th>
                  <th className="px-8 py-5 font-bold">{t.dashboard.table.stock}</th>
                  <th className="px-8 py-5 font-bold">{t.dashboard.table.status}</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted">
                {filteredData.map((item) => (
                  <tr 
                    key={item.id} 
                    className="group hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/products/${item.id}`)}
                  >
                    <td className="px-8 py-5 font-bold text-foreground/90">{item.name}</td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 rounded-lg bg-secondary text-secondary-foreground text-xs font-bold">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-mono font-bold text-primary">{formatCurrency(item.price)}</td>
                    <td className="px-8 py-5 font-medium">{item.stock}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${
                          item.stock > 10 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                        }`} />
                        <span className={`text-xs font-bold ${
                          item.stock > 10 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        }`}>
                          {item.stock > 10 ? t.dashboard.table.inStock : t.dashboard.table.lowStock}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-background transition-all border shadow-sm cursor-pointer">
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredData.length === 0 && (
              <div className="p-20 text-center space-y-3">
                <div className="inline-flex p-4 rounded-full bg-muted">
                  <Search className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-bold text-muted-foreground">{t.dashboard.table.noData}</h3>
              </div>
            )}
          </div>

          {/* Footer/Pagination Placeholder */}
          <div className="px-8 py-6 bg-muted/10 border-t flex justify-between items-center text-sm text-muted-foreground font-medium">
            <p>{t.common.showing} {filteredData.length} {t.common.of} {initialProducts.length} {t.nav.products}</p>
            <div className="flex gap-2">
              <button 
                onClick={() => handleNotImplemented(t.common.previous)}
                className="px-4 py-2 rounded-xl border hover:bg-background disabled:opacity-50 transition-all cursor-pointer"
              >
                {t.common.previous}
              </button>
              <button 
                onClick={() => handleNotImplemented(t.common.next)}
                className="px-4 py-2 rounded-xl border hover:bg-background disabled:opacity-50 transition-all cursor-pointer"
              >
                {t.common.next}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
