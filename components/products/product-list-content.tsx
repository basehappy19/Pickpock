"use client";

import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Search, Filter, Star, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { useFilter } from "@/hooks/use-filter";
import { useLanguage } from "@/hooks/use-language";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProductListContent({ initialProducts }: { initialProducts: Product[] }) {
  const { t } = useLanguage();
  const { filteredData, filters, updateFilter } = useFilter(initialProducts);
  const router = useRouter();
  
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: aiSearchQuery,
          products: initialProducts
        }),
      });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await res.json();
      setAiMatchedIds(data.matchedIds || []);
    } catch (error) {
      console.error("AI Search failed", error);
      alert("AI Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const displayData = aiMatchedIds 
    ? initialProducts.filter(p => aiMatchedIds.includes(p.id))
    : filteredData;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-extrabold tracking-tight">
          {t.products.listTitle}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t.products.listSubtitle}
        </p>
      </div>

      {/* AI Smart Search Bar */}
      <form onSubmit={handleAISearch} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-600/30 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex flex-col md:flex-row gap-2 bg-card p-2 rounded-[2rem] border shadow-lg">
          <div className="flex-1 relative flex items-center">
            <Sparkles className="absolute left-4 h-5 w-5 text-primary animate-pulse" />
            <input 
              type="text" 
              placeholder="ลองพิมพ์ค้นหาแบบมนุษย์ เช่น 'อยากได้หูฟังเอาไปใส่วิ่ง'"
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-transparent outline-none text-base font-medium placeholder:text-muted-foreground/70"
              value={aiSearchQuery}
              onChange={(e) => setAiSearchQuery(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            disabled={isSearching}
            className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-w-[140px] cursor-pointer"
          >
            {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            {isSearching ? "กำลังวิเคราะห์..." : "AI Search"}
          </button>
        </div>
      </form>

      {/* Normal Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center pt-4">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder={t.dashboard.filters.search}
            className="w-full pl-12 pr-6 py-3 rounded-2xl border-2 border-transparent bg-card focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium shadow-sm"
            value={filters.search}
            onChange={(e) => {
              setAiMatchedIds(null); // Clear AI search when normal search is used
              setAiSearchQuery("");
              updateFilter({ search: e.target.value })
            }}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
            <select 
              className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-transparent bg-card focus:border-primary/20 outline-none transition-all text-sm font-semibold appearance-none cursor-pointer shadow-sm"
              value={filters.category}
              onChange={(e) => {
                setAiMatchedIds(null);
                updateFilter({ category: e.target.value })
              }}
            >
              <option value="all" className="cursor-pointer">{t.dashboard.filters.allCategories}</option>
              {Array.from(new Set(initialProducts.map(p => p.category))).map(cat => (
                <option key={cat} value={cat} className="cursor-pointer">{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayData.map((product) => (
          <div 
            key={product.id}
            onClick={() => router.push(`/products/${product.id}`)}
            className="group bg-card rounded-[2.5rem] border overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
          >
            <div className="aspect-[4/3] overflow-hidden bg-muted relative">
              <Image 
                src={product.image} 
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-background/80 backdrop-blur-md text-[10px] font-black uppercase tracking-widest border shadow-sm">
                {product.category}
              </div>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-1">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm">{product.rating}</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed font-medium">
                {product.description}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-muted">
                <div className="text-2xl font-black text-primary">
                  {formatCurrency(product.price)}
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {displayData.length === 0 && (
        <div className="p-20 text-center space-y-3 bg-muted/30 rounded-[3rem] border-2 border-dashed">
          <div className="inline-flex p-4 rounded-full bg-muted">
            <Search className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-bold text-muted-foreground">{t.dashboard.table.noData}</h3>
          {aiMatchedIds !== null && (
             <p className="text-sm text-muted-foreground">ลองเปลี่ยนคำค้นหา AI ให้กว้างขึ้นดูนะครับ</p>
          )}
        </div>
      )}
    </div>
  );
}
