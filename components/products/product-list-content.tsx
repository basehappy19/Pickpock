"use client";

import { Product } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { Search, Filter, Star, ArrowRight, Sparkles, Loader2, Package, Heart, GitCompare, ChevronDown, ChevronUp, X as CloseIcon } from "lucide-react";
import { useFilter } from "@/hooks/use-filter";
import { useLanguage } from "@/hooks/use-language";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import NextImage from "next/image";
import { useGlobalData } from "@/hooks/use-global-data";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCompare } from "@/hooks/use-compare";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";

export default function ProductListContent({ initialProducts }: { initialProducts: Product[] }) {
  const { t } = useLanguage();
  const { products } = useGlobalData();
  const allProducts = useMemo(() => products.length > 0 ? products : initialProducts, [products, initialProducts]);
  const { filteredData, filters, updateFilter, resetFilters } = useFilter(allProducts);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCompare } = useCompare();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const categories = useMemo(() => Array.from(new Set(allProducts.map(p => p.category))), [allProducts]);
  const maxPrice = useMemo(() => {
    const prices = allProducts.map(p => p.price);
    return prices.length > 0 ? Math.max(...prices) : 10000;
  }, [allProducts]);
  
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPriceFilter, setMaxPriceFilter] = useState(10000);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Sync maxPrice when products load
  useEffect(() => {
    setMaxPriceFilter(maxPrice);
  }, [maxPrice]);

  // Sync URL category param with filter
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      updateFilter({ category: cat });
    }
  }, [searchParams]);
  
  const [aiSearchQuery, setAiSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [aiMatchedIds, setAiMatchedIds] = useState<string[] | null>(null);

  const handleAISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiSearchQuery.trim()) {
      setAiMatchedIds(null);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: aiSearchQuery, products: allProducts }),
      });

      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      setAiMatchedIds(data.matchedIds || []);
    } catch (error) {
      console.error("AI Search failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  const finalFilteredData = useMemo(() => {
    let data = aiMatchedIds 
      ? allProducts.filter(p => aiMatchedIds.includes(p.id))
      : filteredData;
    
    // Apply local advanced filters
    return data.filter(p => {
      const priceMatch = p.price >= minPrice && p.price <= maxPriceFilter;
      const stockMatch = inStockOnly ? p.stock > 0 : true;
      return priceMatch && stockMatch;
    });
  }, [aiMatchedIds, allProducts, filteredData, minPrice, maxPriceFilter, inStockOnly]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col gap-4 text-center lg:text-left">
        <h1 className="text-4xl font-black tracking-tight">
          {t.products.listTitle}
        </h1>
        <p className="text-muted-foreground text-lg font-medium">
          {t.products.listSubtitle}
        </p>
      </div>

      {/* AI Smart Search Bar */}
      <div className="relative group z-30">
        <div className="absolute -inset-1 bg-rainbow-gradient rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 -z-10"></div>
        <form onSubmit={handleAISearch} className="relative flex flex-col md:flex-row gap-2 bg-card p-2 lg:p-3 rounded-2xl border shadow-xl">
          <div className="flex-1 relative flex items-center">
            <Sparkles className="absolute left-4 h-5 w-5 text-rainbow animate-pulse pointer-events-none z-10" />
            <input
              type="text"
              placeholder={t.products.aiSearchPlaceholder}
              className="w-full pl-12 pr-6 py-4 rounded-xl bg-background border-2 border-transparent focus:border-primary/30 focus:bg-accent/50 outline-none text-base font-bold placeholder:text-muted-foreground/60 transition-all z-20"
              value={aiSearchQuery}
              onChange={(e) => setAiSearchQuery(e.target.value)}
              autoComplete="off"
            />
          </div>
          <button 
            type="submit"
            disabled={isSearching}
            className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-black hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-w-[140px] cursor-pointer overflow-hidden group/btn shadow-lg"
          >
            <div className="absolute inset-0 bg-rainbow-gradient opacity-0 group-hover/btn:opacity-20 transition-opacity" />
            {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            <span className="relative uppercase tracking-widest text-xs">{isSearching ? "..." : "AI Search"}</span>
          </button>
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 pt-4">
        {/* Sidebar Filters */}
        <aside className={cn(
          "lg:w-72 space-y-8 shrink-0",
          showMobileFilters ? "fixed inset-0 z-[60] bg-background p-8 overflow-y-auto" : "hidden lg:block"
        )}>
          {showMobileFilters && (
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black uppercase tracking-tighter">{t.common.filter}</h2>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 rounded-xl bg-muted"><CloseIcon className="h-6 w-6" /></button>
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.common.search}</h3>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder={t.dashboard.filters.search}
                  className="w-full pl-11 pr-6 py-3 rounded-xl border-2 border-transparent bg-muted/50 focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-bold shadow-sm"
                  value={filters.search}
                  onChange={(e) => {
                    setAiMatchedIds(null); 
                    setAiSearchQuery("");
                    updateFilter({ search: e.target.value })
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.home.categories}</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateFilter({ category: "all" })}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter border-2 transition-all",
                    filters.category === "all" ? "bg-primary border-primary text-primary-foreground" : "bg-card border-transparent hover:border-primary/20"
                  )}
                >
                  {t.common.all}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => updateFilter({ category: cat })}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter border-2 transition-all",
                      filters.category === cat ? "bg-primary border-primary text-primary-foreground" : "bg-card border-transparent hover:border-primary/20"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.filters.priceRange}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-muted-foreground">{t.filters.minPrice}</span>
                  <input 
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-muted/50 border-2 border-transparent focus:border-primary/20 outline-none text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-muted-foreground">{t.filters.maxPrice}</span>
                  <input 
                    type="number"
                    value={maxPriceFilter}
                    onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-muted/50 border-2 border-transparent focus:border-primary/20 outline-none text-xs font-bold"
                  />
                </div>
              </div>

              <input 
                type="range"
                min="0"
                max={maxPrice}
                step="100"
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.filters.availability}</h3>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div 
                  onClick={() => setInStockOnly(!inStockOnly)}
                  className={cn(
                    "w-12 h-6 rounded-full p-1 transition-all duration-300",
                    inStockOnly ? "bg-primary" : "bg-muted"
                  )}
                >
                  <div className={cn(
                    "bg-white w-4 h-4 rounded-full transition-all duration-300",
                    inStockOnly ? "translate-x-6" : "translate-x-0"
                  )} />
                </div>
                <span className="text-sm font-bold uppercase tracking-tight group-hover:text-primary transition-colors">{t.filters.inStockOnly}</span>
              </label>
            </div>

            <button
              onClick={() => {
                resetFilters();
                setMinPrice(0);
                setMaxPriceFilter(maxPrice);
                setInStockOnly(false);
                setAiMatchedIds(null);
                setAiSearchQuery("");
              }}
              className="w-full py-4 rounded-xl border-2 border-dashed border-muted-foreground/20 text-muted-foreground font-black text-xs uppercase tracking-widest hover:border-rose-500/50 hover:text-rose-500 transition-all"
            >
              {t.filters.resetFilters}
            </button>
          </div>
        </aside>

        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between lg:hidden">
            <button 
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-card border-2 font-black text-xs uppercase tracking-widest shadow-sm"
            >
              <Filter className="h-4 w-4" />
              {t.common.filter} & {t.common.search}
            </button>
            <div className="text-xs font-black text-muted-foreground uppercase">
              {finalFilteredData.length} {t.common.totalItems.replace('{count}', '')}
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-between">
            <div className="text-xs font-black text-muted-foreground uppercase tracking-widest">
              {t.common.showing} <span className="text-primary">{finalFilteredData.length}</span> {t.nav.products}
            </div>
            {/* Sort Dropdown Placeholder */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t.filters.sortBy}:</span>
              <select className="bg-transparent font-black text-xs uppercase tracking-widest outline-none cursor-pointer">
                <option>{t.filters.newest}</option>
                <option>{t.filters.priceLow}</option>
                <option>{t.filters.priceHigh}</option>
                <option>{t.filters.rating}</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {finalFilteredData.map((product) => {
              const inWishlist = isInWishlist(product.id);

              return (
                <div
                  key={product.id}
                  className="group bg-card rounded-2xl border overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col"
                >
                  <div className="aspect-square relative bg-muted overflow-hidden">
                    <NextImage
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
                      onClick={() => {
                        const pid = product.id;
                        if (pid) {
                          addToRecentlyViewed(product);
                          router.push(`/products/${pid}`);
                        } else {
                          console.error("Product ID is missing for", product);
                        }
                      }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-background/80 backdrop-blur-md text-[8px] lg:text-[10px] font-black uppercase tracking-widest border shadow-sm">
                      {product.category}
                    </div>
                    {product.isOfficial && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-white text-[8px] font-black uppercase tracking-tighter rounded-md shadow-sm">
                        Official
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (inWishlist) {
                            removeFromWishlist(product.id);
                          } else {
                            addToWishlist(product);
                          }
                        }}
                        className="p-2 rounded-full bg-background/90 backdrop-blur text-rose-500 hover:bg-rose-50 hover:scale-110 transition-all shadow-sm cursor-pointer"
                      >
                        <Heart className={cn("h-3 w-3", inWishlist ? "fill-current" : "")} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCompare(product);
                        }}
                        className="p-2 rounded-full bg-background/90 backdrop-blur text-primary hover:bg-primary/10 hover:scale-110 transition-all shadow-sm cursor-pointer"
                      >
                        <GitCompare className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div
                    className="p-4 lg:p-6 space-y-3 flex-1 flex flex-col justify-between cursor-pointer"
                    onClick={() => {
                      addToRecentlyViewed(product);
                      router.push(`/products/${product.id}`);
                    }}
                  >
                    <div className="space-y-1">
                      <h3 className="text-xs lg:text-base font-black leading-tight group-hover:text-primary transition-colors line-clamp-2 h-8 lg:h-10">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-[10px] font-black">{product.rating}</span>
                        </div>
                        <div className={cn(
                          "flex items-center gap-1 text-[10px] font-black uppercase",
                          product.stock > 0 ? "text-emerald-500" : "text-rose-500"
                        )}>
                          <Package className="h-3 w-3" />
                          {product.stock > 0 ? `${product.stock} LEFT` : "OUT"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-muted">
                      <div className="text-sm lg:text-xl font-black text-primary tracking-tighter">
                        {formatCurrency(product.price)}
                      </div>
                      <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {finalFilteredData.length === 0 && (
            <div className="p-12 lg:p-20 text-center space-y-3 bg-muted/30 rounded-2xl border-2 border-dashed">
              <div className="inline-flex p-4 rounded-full bg-muted">
                <Search className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-black text-muted-foreground uppercase tracking-widest">{t.dashboard.table.noData}</h3>
              <p className="text-xs font-bold text-muted-foreground uppercase">Try adjusting your filters or AI search request.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
