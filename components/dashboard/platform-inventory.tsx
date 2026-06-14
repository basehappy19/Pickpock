"use client";

import { useGlobalData } from "@/hooks/use-global-data";
import { useLanguage } from "@/hooks/use-language";
import { formatCurrency, getImgSrc, cn } from "@/lib/utils";
import { Plus, Edit, Trash2, Search, TrendingUp, ChevronRight, ChevronLeft } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, Suspense } from "react";
import { Product } from "@/types";

interface PlatformInventoryProps {
  analyticsData: any;
  isUpdatingPrice: string | null;
  onAddClick: () => void;
  onEditClick: (p: Product) => void;
  onDeleteClick: (id: string) => void;
  onApplyPrice: (id: string, amount: number, sold: number) => void;
}

function InventoryContent({
  analyticsData,
  isUpdatingPrice,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onApplyPrice
}: PlatformInventoryProps) {
  const { products, orders, stores } = useGlobalData();
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [localSearch, setLocalSearch] = useState(searchParams.get("search") || "");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const itemsPerPage = 10;

  // Compute Sales & Revenue
  const salesData = products.reduce((acc, product) => {
    let soldCount = 0;
    let revenue = 0;
    orders.forEach(order => {
      if (order.status !== 'cancelled') {
        const item = order.items.find(i => i.productId === product.id);
        if (item) {
          soldCount += item.quantity;
          revenue += item.price * item.quantity;
        }
      }
    });
    acc[product.id] = { soldCount, revenue };
    return acc;
  }, {} as Record<string, { soldCount: number; revenue: number }>);

  // Filter
  const filteredProducts = products.filter(p => {
    const term = localSearch.toLowerCase();
    const catName = ((t.categories as Record<string, string>)?.[p.category] || p.category).toLowerCase();
    return p.name.toLowerCase().includes(term) || catName.includes(term);
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    const params = new URLSearchParams(searchParams);
    if (val) {
      params.set("search", val);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const setPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-0">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tighter uppercase">{t.dashboard.platformInventory}</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={language === 'th' ? "ค้นหาสินค้า..." : "Search products..."}
              className="w-full pl-9 pr-4 py-2 bg-card border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={localSearch}
              onChange={handleSearch}
            />
          </div>
          <button onClick={onAddClick} className="h-10 px-4 rounded-xl bg-primary text-primary-foreground flex items-center gap-2 font-semibold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 cursor-pointer shrink-0">
            <Plus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{t.dashboard.addProduct}</span>
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-card border-2 border-primary/5 rounded-4xl shadow-2xl shadow-primary/5 overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-muted/20">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t.dashboard.table.name}</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t.dashboard.assignedStore}</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t.dashboard.table.stock}</th>
              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{language === 'th' ? 'ยอดขาย' : 'Sales'}</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t.dashboard.table.price}</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground text-right">{t.dashboard.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginatedProducts.length > 0 ? paginatedProducts.map((product) => {
              const insight = analyticsData?.pricingInsights?.[product.id];
              const isPriceUpdating = isUpdatingPrice === product.id;
              const sData = salesData[product.id] || { soldCount: 0, revenue: 0 };

              return (
                <tr key={product.id} className="hover:bg-muted/10 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 overflow-hidden shrink-0">
                        <img src={getImgSrc(product.image)} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm max-w-[200px] truncate">{product.name}</p>
                        <p className="text-xs font-medium text-muted-foreground">{(t.categories as Record<string, string>)?.[product.category] || product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn("px-2 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-widest", product.isOfficial ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600")}>
                      {product.isOfficial ? t.dashboard.officialMall : (stores.find(s => s.store_id === product.storeId)?.name || t.dashboard.partnerStore)}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-xs">{product.stock} {t.product.quantity}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-emerald-600">{sData.soldCount} {t.product.quantity}</span>
                      <span className="text-xs text-muted-foreground">{formatCurrency(sData.revenue)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 min-w-[200px]">
                    <div className="flex flex-col gap-2">
                      <span className="font-semibold text-sm">{formatCurrency(product.price)}</span>
                      {insight && (
                        <div className="animate-in fade-in slide-in-from-left-2 duration-500">
                           <div className="bg-primary/5 border border-primary/20 rounded-xl p-2 space-y-2 relative overflow-hidden group/advice">
                              <div className="absolute top-0 right-0 p-1">
                                 <img src="/brand/mascot.jpeg" className="h-4 w-4 object-cover rounded-full opacity-50 animate-pulse" alt="AI Mascot" />
                              </div>
                              <div className="flex items-center gap-2">
                                 <div className={cn("p-1.5 rounded-lg text-white shrink-0", insight.type === 'increase' ? "bg-emerald-500" : "bg-rose-500")}>
                                    {insight.type === 'increase' ? <TrendingUp className="h-3 w-3" /> : <TrendingUp className="h-3 w-3 rotate-180" />}
                                 </div>
                                 <div className="space-y-0.5">
                                    <p className="text-[9px] font-semibold uppercase text-primary/60 leading-none">{t.dashboard.aiRecommend}</p>
                                    <p className="text-xs font-semibold text-foreground leading-tight">{insight.reason}</p>
                                 </div>
                              </div>
                              <button
                                onClick={() => onApplyPrice(product.id, insight.amount, insight.totalSold)}
                                disabled={isPriceUpdating}
                                className={cn(
                                  "w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all shadow-sm active:scale-95 cursor-pointer",
                                  insight.type === 'increase' ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-rose-500 text-white hover:bg-rose-600",
                                  isPriceUpdating && "opacity-50 cursor-wait"
                                )}
                              >
                                <span>{isPriceUpdating ? t.dashboard.updatingPrice : t.dashboard.changeToPrice + insight.amount}</span>
                                <ChevronRight className="h-3 w-3 group-hover/advice:translate-x-1 transition-transform" />
                              </button>
                           </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEditClick(product)} className="p-2 text-blue-500 transition-colors cursor-pointer"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => onDeleteClick(product.id)} className="p-2 text-rose-500 transition-colors cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">{language === 'th' ? 'ไม่พบข้อมูลสินค้า' : 'No products found'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3 px-4">
        {paginatedProducts.length > 0 ? paginatedProducts.map((product) => {
          const insight = analyticsData?.pricingInsights?.[product.id];
          const isPriceUpdating = isUpdatingPrice === product.id;
          const sData = salesData[product.id] || { soldCount: 0, revenue: 0 };

          return (
            <div key={product.id} className="bg-card border rounded-2xl p-4 shadow-sm space-y-4 relative">
              <div className="flex items-start gap-3">
                <div className="h-16 w-16 rounded-xl bg-primary/10 overflow-hidden shrink-0">
                  <img src={getImgSrc(product.image)} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <p className="font-semibold text-sm line-clamp-2">{product.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{(t.categories as Record<string, string>)?.[product.category] || product.category}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className={cn("px-1.5 py-0.5 rounded-md text-[9px] font-semibold uppercase", product.isOfficial ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600")}>
                      {product.isOfficial ? t.dashboard.officialMall : t.dashboard.partnerStore}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-muted text-muted-foreground">
                      {language === 'th' ? 'คงเหลือ: ' : 'Stock: '} {product.stock}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-muted/30 rounded-xl">
                 <div>
                   <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{language === 'th' ? 'ยอดขาย / รายได้' : 'Sales / Rev'}</p>
                   <p className="text-xs font-bold text-emerald-600">{sData.soldCount} <span className="text-muted-foreground text-[10px]">({formatCurrency(sData.revenue)})</span></p>
                 </div>
                 <div className="text-right">
                   <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{t.dashboard.table.price}</p>
                   <p className="text-xs font-bold">{formatCurrency(product.price)}</p>
                 </div>
              </div>

              {insight && (
                 <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-2 relative overflow-hidden group/advice mt-2">
                    <div className="absolute top-0 right-0 p-1">
                       <img src="/brand/mascot.jpeg" className="h-4 w-4 object-cover rounded-full opacity-50 animate-pulse" alt="AI Mascot" />
                    </div>
                    <div className="flex items-center gap-2">
                       <div className={cn("p-1.5 rounded-lg text-white shrink-0", insight.type === 'increase' ? "bg-emerald-500" : "bg-rose-500")}>
                          {insight.type === 'increase' ? <TrendingUp className="h-3 w-3" /> : <TrendingUp className="h-3 w-3 rotate-180" />}
                       </div>
                       <div className="space-y-0.5 pr-4">
                          <p className="text-[9px] font-semibold uppercase text-primary/60 leading-none">{t.dashboard.aiRecommend}</p>
                          <p className="text-[10px] font-semibold text-foreground leading-tight">{insight.reason}</p>
                       </div>
                    </div>
                    <button
                      onClick={() => onApplyPrice(product.id, insight.amount, insight.totalSold)}
                      disabled={isPriceUpdating}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-semibold uppercase transition-all shadow-sm active:scale-95 cursor-pointer",
                        insight.type === 'increase' ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-rose-500 text-white hover:bg-rose-600",
                        isPriceUpdating && "opacity-50 cursor-wait"
                      )}
                    >
                      <span>{isPriceUpdating ? t.dashboard.updatingPrice : t.dashboard.changeToPrice + insight.amount}</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                 </div>
              )}

              <div className="absolute top-3 right-3 flex flex-col gap-1">
                 <button onClick={() => onEditClick(product)} className="p-1.5 text-blue-500 bg-blue-500/10 rounded-lg"><Edit className="h-3.5 w-3.5" /></button>
                 <button onClick={() => onDeleteClick(product.id)} className="p-1.5 text-rose-500 bg-rose-500/10 rounded-lg"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-8 bg-card border rounded-2xl text-muted-foreground">{language === 'th' ? 'ไม่พบข้อมูลสินค้า' : 'No products found'}</div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-4">
          <button 
            onClick={() => setPage(page - 1)} 
            disabled={page === 1}
            className="p-2 rounded-xl border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold tracking-widest text-muted-foreground">
            {language === 'th' ? 'หน้า' : 'Page'} {page} / {totalPages}
          </span>
          <button 
            onClick={() => setPage(page + 1)} 
            disabled={page === totalPages}
            className="p-2 rounded-xl border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function PlatformInventory(props: PlatformInventoryProps) {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
      <InventoryContent {...props} />
    </Suspense>
  );
}
