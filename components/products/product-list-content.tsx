"use client";

import { Product, FilterOptions } from "@/types";
import { formatCurrency, cn, getImgSrc } from "@/lib/utils";
import { Search, Filter, Star, ArrowRight, Sparkles, Loader2, Package, Heart, GitCompare, X as CloseIcon } from "lucide-react";
import { useFilter } from "@/hooks/use-filter";
import { useLanguage } from "@/hooks/use-language";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import NextImage from "next/image";
import { useGlobalData } from "@/hooks/use-global-data";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCompare } from "@/hooks/use-compare";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";

export default function ProductListContent({ initialProducts }: { initialProducts: Product[] }) {
  const { t } = useLanguage();
  const { products, stores } = useGlobalData();
  const allProducts = useMemo(() => products.length > 0 ? products : initialProducts, [products, initialProducts]);
  const { filteredData, filters, updateFilter, resetFilters } = useFilter(allProducts);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCompare } = useCompare();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const categories = useMemo(() => Array.from(new Set(allProducts.map(p => p.category))), [allProducts]);
  const maxPrice = useMemo(() => {
    const prices = allProducts.map(p => p.price);
    return prices.length > 0 ? Math.max(...prices) : 10000;
  }, [allProducts]);
  
  const ITEMS_PER_PAGE = 100;
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const setCurrentPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`?${params.toString()}`, { scroll: true });
  };

  const updateURLParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const handleCategoryChange = (cat: string) => {
    updateURLParams({ category: cat === "all" ? null : cat });
  };

  const handlePriceChange = (min: number, max: number) => {
    updateURLParams({
      minPrice: min > 0 ? String(min) : null,
      maxPrice: max < maxPrice ? String(max) : null
    });
  };

  const handleStoreChange = (sid: string) => {
    if (sid === "all") {
      updateURLParams({ storeId: null });
    } else {
      const updates: Record<string, string | null> = { storeId: sid };
      if (sid !== "mall") {
        updates.partner = "true";
        updates.official = null;
      } else {
        updates.official = "true";
        updates.partner = null;
      }
      updateURLParams(updates);
    }
  };

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPriceFilter, setMaxPriceFilter] = useState(10000);
  const [hasPriceSynced, setHasPriceSynced] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isOfficialFilter, setIsOfficialFilter] = useState(false);
  const [isPartnerFilter, setIsPartnerFilter] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState("all");

  // Sync state with URL params
  useEffect(() => {
    const cat = searchParams.get("category") || "all";
    const min = Number(searchParams.get("minPrice")) || 0;
    const max = Number(searchParams.get("maxPrice")) || maxPrice;
    const inStock = searchParams.get("inStock") === "true";
    const official = searchParams.get("official") === "true";
    const partner = searchParams.get("partner") === "true";
    const sid = searchParams.get("storeId") || "all";
    const sortBy = (searchParams.get("sort") as FilterOptions['sortBy']) || "newest";

    setMinPrice(min);
    setMaxPriceFilter(max);
    setInStockOnly(inStock);
    setIsOfficialFilter(official);
    setIsPartnerFilter(partner);
    setSelectedStoreId(sid);

    updateFilter({ 
      category: cat,
      isOfficial: official,
      isPartner: partner,
      storeId: sid,
      sortBy: sortBy
    });
  }, [searchParams, updateFilter, maxPrice]);

  // Sync maxPrice when products load once
  useEffect(() => {
    if (!hasPriceSynced && maxPrice > 0) {
      const urlMax = searchParams.get("maxPrice");
      if (!urlMax) {
        setMaxPriceFilter(maxPrice);
      }
      setHasPriceSynced(true);
    }
  }, [maxPrice, hasPriceSynced, searchParams]);

  const stableUpdateFilter = useCallback(updateFilter, [updateFilter]);
  
  const [aiSearchQuery, setAiSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [aiMatchedIds, setAiMatchedIds] = useState<string[] | null>(null);

  const handleAISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiSearchQuery.trim()) {
      setAiMatchedIds(null);
      return;
    }

    // Clear all filters when doing AI Search but keep the AI query
    router.push(pathname, { scroll: false });
    resetFilters();
    setMinPrice(0);
    setMaxPriceFilter(maxPrice);
    setInStockOnly(false);
    setIsOfficialFilter(false);
    setIsPartnerFilter(false);
    setSelectedStoreId("all");
    
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

  const handleClearAllFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
    resetFilters();
    setMinPrice(0);
    setMaxPriceFilter(maxPrice);
    setInStockOnly(false);
    setIsOfficialFilter(false);
    setIsPartnerFilter(false);
    setSelectedStoreId("all");
    setAiMatchedIds(null);
    setAiSearchQuery("");
  }, [router, pathname, resetFilters, maxPrice]);

  const finalFilteredData = useMemo(() => {
    const data = aiMatchedIds 
      ? allProducts.filter(p => aiMatchedIds.includes(p.id))
      : filteredData;
    
    // Apply local advanced filters
    return data.filter(p => {
      const priceMatch = p.price >= minPrice && p.price <= maxPriceFilter;
      const stockMatch = inStockOnly ? p.stock > 0 : true;
      return priceMatch && stockMatch;
    });
  }, [aiMatchedIds, allProducts, filteredData, minPrice, maxPriceFilter, inStockOnly]);

  const totalPages = Math.max(1, Math.ceil(finalFilteredData.length / ITEMS_PER_PAGE));
  const paginatedProducts = finalFilteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col gap-4 text-center lg:text-left">
        <h1 className="text-4xl font-semibold tracking-tight">
          {t.products.listTitle}
        </h1>
        <p className="text-muted-foreground text-lg font-medium">
          {t.products.listSubtitle}
        </p>
      </div>

      {/* AI Smart Search Bar */}
      <div className="relative group z-30">
        <div className="absolute -inset-1 bg-rainbow-gradient rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 -z-10"></div>
        <form onSubmit={handleAISearch} className="relative flex flex-col md:flex-row gap-2 p-2 lg:p-3">
          <div className="flex-1 relative flex items-center">
            <Sparkles className="absolute left-4 h-5 w-5 text-rainbow animate-pulse pointer-events-none z-10" />
            <input
              type="text"
              placeholder={t.products.aiSearchPlaceholder}
              className="w-full pl-12 pr-6 py-4 rounded-xl border-2 border-primary/30 bg-accent/50 outline-none text-base font-medium placeholder:text-muted-foreground/60 transition-all z-20"
              value={aiSearchQuery}
              onChange={(e) => setAiSearchQuery(e.target.value)}
              autoComplete="off"
            />
          </div>
          <button 
            type="submit"
            disabled={isSearching}
            className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-w-35 cursor-pointer overflow-hidden group/btn shadow-lg"
          >
            <div className="absolute inset-0 bg-rainbow-gradient opacity-0 group-hover/btn:opacity-20 transition-opacity" />
            {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            <span className="relative uppercase tracking-widest text-xs">{isSearching ? "..." : t.products.aiSearchBtn}</span>
          </button>
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 pt-4">
        {/* Sidebar Filters */}
        <aside className={cn(
          "lg:w-72 space-y-8 shrink-0",
          showMobileFilters ? "fixed inset-0 z-60 bg-background p-8 overflow-y-auto" : "hidden lg:block"
        )}>
          {showMobileFilters && (
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold uppercase tracking-tighter">{t.common.filter}</h2>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 rounded-xl bg-muted"><CloseIcon className="h-6 w-6" /></button>
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t.common.search}</h3>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder={t.dashboard.filters.search}
                  className="w-full pl-11 pr-6 py-3 rounded-xl border-2 border-transparent bg-muted/50 focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium shadow-sm"
                  value={filters.search}
                  onChange={(e) => {
                    setAiMatchedIds(null); 
                    setAiSearchQuery("");
                    stableUpdateFilter({ search: e.target.value })
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t.home.categories}</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryChange("all")}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-tighter border-2 transition-all cursor-pointer hover:-translate-y-1",
                    filters.category === "all" ? "bg-primary border-primary text-primary-foreground" : "bg-card border-transparent hover:border-primary/20 hover:bg-muted"
                  )}
                >
                  {t.common.all}
                </button>
                {categories.map((cat, i) => (
                  <button
                    key={`cat-filter-${cat}-${i}`}
                    onClick={() => handleCategoryChange(cat)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-tighter border-2 transition-all cursor-pointer hover:-translate-y-1",
                      filters.category === cat ? "bg-primary border-primary text-primary-foreground" : "bg-card border-transparent hover:border-primary/20 hover:bg-muted"
                    )}
                  >
                    {(t.categories as Record<string, string>)[cat] || cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t.filters.priceRange}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">{t.filters.minPrice}</span>
                  <input 
                    type="number"
                    value={minPrice}
                    onChange={(e) => handlePriceChange(Number(e.target.value), maxPriceFilter)}
                    className="w-full px-3 py-2 rounded-lg bg-muted/50 border-2 border-transparent focus:border-primary/20 outline-none text-xs font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">{t.filters.maxPrice}</span>
                  <input 
                    type="number"
                    value={maxPriceFilter}
                    onChange={(e) => handlePriceChange(minPrice, Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-muted/50 border-2 border-transparent focus:border-primary/20 outline-none text-xs font-medium"
                  />
                </div>
              </div>

              <input 
                type="range"
                min="0"
                max={maxPrice}
                step="100"
                value={maxPriceFilter}
                onChange={(e) => handlePriceChange(minPrice, Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t.dashboard.storeTitle}</h3>
              <div className="flex flex-col gap-2">
                <label 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    const newValue = !isOfficialFilter;
                    
                    if (newValue) {
                      params.set("official", "true");
                      params.delete("partner");
                      params.delete("storeId");
                    } else {
                      params.delete("official");
                    }
                    
                    params.set("page", "1");
                    router.push(`?${params.toString()}`, { scroll: false });
                  }}
                >
                  <div className={cn(
                    "w-12 h-6 rounded-full p-1 transition-all duration-300",
                    isOfficialFilter ? "bg-amber-500" : "bg-muted"
                  )}>
                    <div className={cn(
                      "bg-white w-4 h-4 rounded-full transition-all duration-300",
                      isOfficialFilter ? "translate-x-6" : "translate-x-0"
                    )} />
                  </div>
                  <span className="text-sm font-medium uppercase tracking-tight group-hover:text-amber-600 transition-colors">{t.filters.officialOnly}</span>
                </label>
                <label 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    const newValue = !isPartnerFilter;
                    
                    if (newValue) {
                      params.set("partner", "true");
                      params.delete("official");
                    } else {
                      params.delete("partner");
                      params.delete("storeId");
                    }
                    
                    params.set("page", "1");
                    router.push(`?${params.toString()}`, { scroll: false });
                  }}
                >
                  <div className={cn(
                    "w-12 h-6 rounded-full p-1 transition-all duration-300",
                    isPartnerFilter ? "bg-blue-500" : "bg-muted"
                  )}>
                    <div className={cn(
                      "bg-white w-4 h-4 rounded-full transition-all duration-300",
                      isPartnerFilter ? "translate-x-6" : "translate-x-0"
                    )} />
                  </div>
                  <span className="text-sm font-medium uppercase tracking-tight group-hover:text-blue-600 transition-colors">{t.filters.partnerOnly}</span>
                </label>
              </div>

              {/* Specific Store Selection - Only show when Partner filter is on */}
              {isPartnerFilter && (
                <div className="pt-2 animate-in slide-in-from-top-2 duration-300">
                  <select
                    value={selectedStoreId}
                    onChange={(e) => handleStoreChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-muted/50 border-2 border-transparent focus:border-primary/20 outline-none text-xs font-semibold uppercase tracking-widest cursor-pointer appearance-none shadow-sm hover:bg-muted transition-all"
                  >
                    <option value="all">--- {t.common.all} {t.dashboard.partnerStore} ---</option>
                    {stores
                      .filter(s => s.store_id !== "mall")
                      .map(store => (
                        <option key={store.store_id} value={store.store_id}>
                          {store.name}
                        </option>
                      ))
                    }
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t.filters.availability}</h3>
              <label 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => updateURLParams({ inStock: inStockOnly ? null : "true" })}
              >
                <div className={cn(
                  "w-12 h-6 rounded-full p-1 transition-all duration-300",
                  inStockOnly ? "bg-primary" : "bg-muted"
                )}>
                  <div className={cn(
                    "bg-white w-4 h-4 rounded-full transition-all duration-300",
                    inStockOnly ? "translate-x-6" : "translate-x-0"
                  )} />
                </div>
                <span className="text-sm font-medium uppercase tracking-tight group-hover:text-primary transition-colors">{t.filters.inStockOnly}</span>
              </label>
            </div>

            <button
              onClick={() => {
                router.push(pathname);
                setAiMatchedIds(null);
                setAiSearchQuery("");
              }}
              className="w-full py-4 rounded-xl border-2 border-dashed border-muted-foreground/20 text-muted-foreground font-semibold text-xs uppercase tracking-widest hover:border-rose-500/50 hover:text-rose-500 transition-all cursor-pointer"
            >
              {t.filters.resetFilters}
            </button>
          </div>
        </aside>

        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between lg:hidden">
            <button 
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-card border-2 font-semibold text-xs uppercase tracking-widest shadow-sm"
            >
              <Filter className="h-4 w-4" />
              {t.common.filter} & {t.common.search}
            </button>
            <div className="text-xs font-semibold text-muted-foreground uppercase">
              {finalFilteredData.length} {t.common.totalItems.replace('{count}', '')}
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-between">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              {t.common.showing} <span className="text-primary">{finalFilteredData.length}</span> {t.nav.products}
            </div>
            {/* Sort Dropdown Placeholder */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase text-muted-foreground tracking-widest">{t.filters.sortBy}:</span>
              <select 
                className="bg-transparent font-semibold text-xs uppercase tracking-widest outline-none cursor-pointer"
                value={filters.sortBy}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("sort", e.target.value);
                  router.push(`?${params.toString()}`, { scroll: false });
                }}
              >
                <option value="newest">{t.filters.newest}</option>
                <option value="price-asc">{t.filters.priceLow}</option>
                <option value="price-desc">{t.filters.priceHigh}</option>
                <option value="rating">{t.filters.rating}</option>
              </select>
            </div>
          </div>

          {/* All Stores Section */}
          {stores && stores.length > 0 && (
            <div className="space-y-4 mb-8">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">{t.products.allStores}</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                {stores.map(store => (
                  <button 
                    key={store.store_id}
                    onClick={() => router.push(`/stores/${store.store_id}`)}
                    className="flex-shrink-0 flex items-center gap-3 p-3 pr-6 rounded-2xl border-2 border-transparent bg-muted/30 hover:bg-muted hover:border-primary/20 transition-all cursor-pointer group"
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                      {store.image ? (
                        <img src={getImgSrc(store.image)} alt={store.name} className="h-full w-full object-cover" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
                      )}
                    </div>
                    <div className="text-left space-y-0.5">
                      <p className="text-xs font-semibold group-hover:text-primary transition-colors">{store.name}</p>
                      <p className="text-xs font-medium text-muted-foreground">{store.rating ? store.rating.toFixed(1) + ' ★' : 'ร้านใหม่'}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grid */}
          <div className={cn(
            "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 transition-all duration-700",
            isSearching ? "opacity-30 blur-sm scale-95" : "opacity-100 blur-0 scale-100"
          )}>
            {paginatedProducts.map((product, idx) => {
              const inWishlist = isInWishlist(product.id);

              return (
                <div
                  key={product.id}
                  className="group bg-card rounded-2xl border overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col animate-in fade-in slide-in-from-bottom-8 zoom-in-95 fill-mode-both"
                  style={{ animationDelay: `${(idx % 12) * 75}ms`, animationDuration: '700ms' }}
                >
                  <div className="aspect-square relative bg-muted overflow-hidden">
                    <NextImage
                      src={getImgSrc(product.image)}
                      alt={product.name}
                      fill
                      priority={idx < 4}
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
                      onClick={() => {
                        const pid = product.id;
                        if (pid) {
                          addToRecentlyViewed(product);
                          router.push(`/product/${pid}`);
                        } else {
                          console.error("Product ID is missing for", product);
                        }
                      }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-background/80 backdrop-blur-md text-[8px] lg:text-xs font-semibold uppercase tracking-widest border shadow-sm">
                      {(t.categories as Record<string, string>)[product.category] || product.category}
                    </div>
                    {product.isOfficial && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-white text-[8px] font-semibold uppercase tracking-tighter rounded-md shadow-sm">
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
                      router.push(`/product/${product.id}`);
                    }}
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1 mb-1 truncate">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
                        {stores?.find(s => s.store_id === product.storeId)?.name || 'ITMSU Store'}
                      </div>
                      <h3 className="text-xs lg:text-base font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2 h-8 lg:h-10">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-xs font-semibold">{Number(product.rating).toFixed(1)}</span>
                        </div>
                        <div className={cn(
                          "flex items-center gap-1 text-xs font-semibold uppercase",
                          product.stock > 0 ? "text-emerald-500" : "text-rose-500"
                        )}>
                          <Package className="h-3 w-3" />
                          {product.stock > 0 ? `${product.stock} ${t.products.left}` : t.products.out}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-muted">
                      <div className="text-sm lg:text-xl font-semibold text-primary tracking-tighter">
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
            <div className="p-12 lg:p-20 text-center space-y-4 bg-muted/30 rounded-2xl border-2 border-dashed">
              <div className="inline-flex p-4 rounded-full bg-muted">
                <Search className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-muted-foreground uppercase tracking-widest">{t.dashboard.table.noData}</h3>
                <p className="text-xs font-medium text-muted-foreground uppercase">{t.filters.noResultsDesc}</p>
              </div>
              <button
                onClick={() => {
                  router.push(pathname, { scroll: false });
                  resetFilters();
                  setMinPrice(0);
                  setMaxPriceFilter(maxPrice);
                  setInStockOnly(false);
                  setIsOfficialFilter(false);
                  setIsPartnerFilter(false);
                  setSelectedStoreId("all");
                  setAiMatchedIds(null);
                  setAiSearchQuery("");
                }}
                className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs uppercase tracking-widest hover:opacity-90 transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
              >
                <CloseIcon className="h-4 w-4" />
                {t.filters.clearFilters || t.filters.resetFilters}
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border-2 font-semibold text-xs uppercase tracking-widest bg-card hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                ← {t.filters.prevPage}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .reduce<(number | string)[]>((acc, p, idx, arr) => {
                  if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground font-semibold text-xs">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item as number)}
                      className={cn(
                        "w-9 h-9 rounded-xl border-2 font-semibold text-xs transition-all cursor-pointer",
                        currentPage === item
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-card border-transparent hover:border-primary/20 hover:bg-muted"
                      )}
                    >
                      {item}
                    </button>
                  )
                )
              }
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border-2 font-semibold text-xs uppercase tracking-widest bg-card hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {t.filters.nextPage} →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
