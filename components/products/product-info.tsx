"use client";

import { useFilter } from "@/hooks/use-filter";
import { useLanguage } from "@/hooks/use-language";
import { formatCurrency, cn } from "@/lib/utils";
import { Star, ShieldCheck, ShoppingCart, Heart, Package, Truck, Info, MessageSquare, Store, ArrowRight, Share2, CheckCircle2, GitCompare } from "lucide-react";
import { useState, useEffect } from "react";
import NextImage from "next/image";
import { Product } from "@/types";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { useCompare } from "@/hooks/use-compare";
import { useRouter } from "next/navigation";

export default function ProductInfo({ product, allProducts }: { product: Product, allProducts: Product[] }) {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { addToCompare } = useCompare();
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [storeData, setStoreData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
      
      const fetchStore = async () => {
        try {
          const res = await fetch("/api/stores");
          if (res.ok) {
            const stores = await res.json();
            const found = stores.find((s: any) => s.store_id === product.storeId || (product.isOfficial && s.store_id === 's-001'));
            if (found) setStoreData(found);
          }
        } catch (e) {
          console.error("Failed to fetch store data", e);
        }
      };
      fetchStore();
    }
  }, [product, addToRecentlyViewed]);

  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < selectedQuantity; i++) {
      addToCart(product);
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const placeholderImg = "https://placehold.co/800x800?text=Product+Not+Found";

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square relative rounded-[2.5rem] overflow-hidden border-2 border-primary/5 bg-muted shadow-2xl">
            <NextImage
              src={product.image || placeholderImg}
              alt={product.name}
              fill
              priority
              className="object-cover transition-transform duration-1000 hover:scale-110"
            />
            {product.isOfficial && (
              <div className="absolute top-6 left-6 px-4 py-1.5 bg-amber-500 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Official Store
              </div>
            )}
            <div className="absolute top-6 right-6 flex flex-col gap-2">
               <button 
                 onClick={() => inWishlist ? removeFromWishlist(product.id) : addToWishlist(product)}
                 className={cn(
                   "p-4 rounded-2xl backdrop-blur-md transition-all shadow-xl cursor-pointer group",
                   inWishlist ? "bg-rose-500 text-white" : "bg-white/80 text-rose-500 hover:bg-rose-500 hover:text-white"
                 )}
               >
                 <Heart className={cn("h-6 w-6 transition-transform group-hover:scale-110", inWishlist ? "fill-current" : "")} />
               </button>
               <button 
                 onClick={() => addToCompare(product)}
                 className="p-4 rounded-2xl bg-white/80 backdrop-blur-md text-primary hover:bg-primary hover:text-white transition-all shadow-xl cursor-pointer group"
               >
                 <GitCompare className="h-6 w-6 transition-transform group-hover:scale-110" />
               </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
             {[1,2,3,4].map((i) => (
               <div key={i} className="aspect-square rounded-2xl bg-muted border-2 border-transparent hover:border-primary/20 cursor-pointer overflow-hidden transition-all">
                 <NextImage src={product.image || placeholderImg} alt={product.name} width={200} height={200} className="object-cover h-full w-full opacity-50 hover:opacity-100" />
               </div>
             ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col justify-between py-2 space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                  {product.category}
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-black">{product.rating}</span>
                  <span className="text-muted-foreground font-bold text-xs">({product.reviews.length} reviews)</span>
                </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tighter leading-none">{product.name}</h1>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-black text-primary tracking-tighter">{formatCurrency(product.price)}</span>
              {product.stock < 10 && product.stock > 0 && (
                <span className="text-rose-500 font-black text-xs uppercase tracking-widest animate-pulse">Only {product.stock} left in stock!</span>
              )}
            </div>

            <p className="text-muted-foreground font-bold leading-relaxed max-w-lg">
              {product.description || "Elevate your lifestyle with this premium product, designed for performance and style. Part of our exclusive AI-curated collection."}
            </p>

            <div className="grid grid-cols-2 gap-4">
               <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50 border border-primary/5">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Shipping</p>
                    <p className="text-xs font-black">Free Worldwide</p>
                  </div>
               </div>
               <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50 border border-primary/5">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Warranty</p>
                    <p className="text-xs font-black">2 Years Global</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-6 pt-8 border-t">
            <div className="flex items-center gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Quantity</label>
                <div className="flex items-center bg-muted rounded-2xl p-1 border-2 border-transparent focus-within:border-primary/20">
                  <button 
                    onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                    className="w-10 h-10 flex items-center justify-center font-black hover:bg-background rounded-xl transition-all"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-black text-lg">{selectedQuantity}</span>
                  <button 
                    onClick={() => setSelectedQuantity(Math.min(product.stock, selectedQuantity + 1))}
                    className="w-10 h-10 flex items-center justify-center font-black hover:bg-background rounded-xl transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex-1 pt-6">
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={cn(
                    "w-full h-16 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 cursor-pointer",
                    isAdded 
                      ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                      : "bg-primary text-primary-foreground shadow-primary/20 hover:opacity-90"
                  )}
                >
                  {isAdded ? (
                    <>
                      <CheckCircle2 className="h-6 w-6" />
                      ADDED TO CART
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-6 w-6" />
                      {product.stock === 0 ? "OUT OF STOCK" : "ADD TO CART"}
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer group">
                  <Share2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Share this product</span>
               </div>
               <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer group">
                  <MessageSquare className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Ask a question</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="pt-12">
        <div className="flex border-b border-muted overflow-x-auto scrollbar-hide">
          {(["description", "specs", "reviews"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-8 py-4 text-xs font-black uppercase tracking-widest border-b-4 transition-all whitespace-nowrap",
                activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "description" ? "Description" : tab === "specs" ? "Specifications" : "Reviews"}
            </button>
          ))}
        </div>
        <div className="py-12 animate-in fade-in duration-500">
          {activeTab === "description" && (
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-3xl font-black tracking-tight">The ultimate <span className="text-primary">experience.</span></h3>
                <p className="text-muted-foreground font-medium leading-relaxed text-lg">
                  {product.description} This high-quality {product.category.toLowerCase()} item is engineered to provide the best possible experience for our customers. We focus on durability, aesthetics, and pure performance in every detail.
                </p>
                <ul className="space-y-4">
                   {["Premium Materials", "Eco-friendly Packaging", "User-centric Design"].map((item) => (
                     <li key={item} className="flex items-center gap-3 font-black text-sm uppercase tracking-tight">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        {item}
                     </li>
                   ))}
                </ul>
              </div>
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
                 <NextImage src={product.image || placeholderImg} alt="Detail" fill className="object-cover" />
                 <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border-2 border-white/30 cursor-pointer hover:scale-110 transition-transform">
                       <ArrowRight className="h-10 w-10" />
                    </div>
                 </div>
              </div>
            </div>
          )}
          {activeTab === "specs" && (
            <div className="max-w-3xl space-y-4">
              {Object.entries(product.specs || {
                "Material": "Premium Composite",
                "Weight": "450g",
                "Dimensions": "25 x 15 x 10 cm",
                "Connectivity": "Wireless / Wired",
                "Battery": "Up to 40 Hours"
              }).map(([key, val]) => (
                <div key={key} className="flex justify-between py-4 border-b border-muted group hover:bg-muted/30 px-4 rounded-xl transition-all">
                  <span className="font-black text-xs uppercase tracking-widest text-muted-foreground">{key}</span>
                  <span className="font-black text-sm uppercase">{val}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === "reviews" && (
             <div className="space-y-8">
                <div className="flex flex-col sm:flex-row items-center gap-8 p-8 rounded-[2rem] bg-muted/30 border-2 border-primary/5">
                   <div className="text-center space-y-2">
                      <p className="text-7xl font-black tracking-tighter text-primary">{product.rating}</p>
                      <div className="flex items-center justify-center gap-1 text-amber-500">
                        {[1,2,3,4,5].map(star => (
                          <Star key={star} className={cn("h-4 w-4", star <= Math.round(product.rating) ? "fill-current" : "text-muted")} />
                        ))}
                      </div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground">Based on {product.reviews.length} reviews</p>
                   </div>
                   <div className="flex-1 space-y-2 w-full">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className="flex items-center gap-4">
                           <span className="text-[10px] font-black w-4">{star}</span>
                           <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full" 
                                style={{ 
                                  width: `${product.reviews.length > 0 ? (product.reviews.filter(r => Math.round(r.rating) === star).length / product.reviews.length) * 100 : 0}%` 
                                }} 
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
                
                <div className="space-y-6">
                   {product.reviews.length > 0 ? product.reviews.map((review) => (
                     <div key={review.id} className="p-8 rounded-[2rem] bg-card border-2 border-primary/5 shadow-xl shadow-primary/5 space-y-4">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center font-black text-primary">
                                {review.user.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                 <p className="font-black text-sm">{review.user}</p>
                                 <p className="text-[10px] font-bold text-muted-foreground">Verified Purchase • {review.date}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-1 text-amber-500">
                              {[1,2,3,4,5].map(star => (
                                <Star key={star} className={cn("h-3 w-3", star <= review.rating ? "fill-current" : "text-muted")} />
                              ))}
                           </div>
                        </div>
                        <p className="text-muted-foreground font-medium italic">"{review.comment}"</p>
                        {review.sentiment && (
                          <div className={cn(
                            "inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight",
                            review.sentiment === 'positive' ? "bg-emerald-50 text-emerald-600" : 
                            review.sentiment === 'negative' ? "bg-rose-50 text-rose-600" : "bg-muted text-muted-foreground"
                          )}>
                            AI Sentiment: {review.sentiment}
                          </div>
                        )}
                     </div>
                   )) : (
                     <div className="text-center py-10">
                       <p className="text-muted-foreground font-bold">No reviews yet. Be the first to review this product!</p>
                     </div>
                   )}
                </div>
             </div>
          )}
        </div>
      </div>

      {/* Store Section */}
      <div className="p-10 rounded-[3rem] bg-rainbow-gradient border-4 border-white shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-20 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-1000" />
         <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-8">
               <div className="h-24 w-24 rounded-[2rem] bg-white flex items-center justify-center text-primary shadow-2xl group-hover:rotate-12 transition-transform duration-500">
                  <Store className="h-12 w-12" />
               </div>
               <div className="text-white space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{product.isOfficial ? "Official Partner" : "Trusted Partner"}</p>
                  <h3 className="text-4xl font-black tracking-tighter uppercase">{storeData?.name || "MSU FOUNDER STORE"}</h3>
                  <div className="flex items-center gap-4 text-xs font-bold">
                     <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-white" /> {storeData?.rating || "4.9"} (2.4k Ratings)</span>
                     <span className="px-2 py-0.5 rounded-md bg-white/20">99% Positive Feedback</span>
                  </div>
               </div>
            </div>
            <button 
               onClick={() => router.push(`/stores/${storeData?.store_id || 'mall'}`)}
               className="h-16 px-10 rounded-2xl bg-white text-primary font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-opacity-90 active:scale-95 transition-all cursor-pointer"
            >
               Visit Store
            </button>
         </div>
      </div>

      {/* Related Products */}
      <div className="space-y-8 pt-12">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight">You might also <span className="text-primary">like.</span></h2>
            <p className="text-muted-foreground font-bold">Based on the category <span className="text-primary uppercase">{product.category}</span></p>
          </div>
          <button className="h-12 px-6 rounded-xl border-2 border-primary/10 font-black text-xs uppercase tracking-widest hover:bg-primary/5 transition-all">
            See All
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {relatedProducts.map((p) => (
            <div
              key={p.id}
              className="group bg-card rounded-2xl border overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer"
              onClick={() => window.location.href = `/products/${p.id}`}
            >
              <div className="aspect-square relative overflow-hidden bg-muted">
                <NextImage
                  src={p.image || placeholderImg}
                  alt={p.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-4 space-y-2 text-center">
                <h4 className="font-black text-xs uppercase tracking-tight line-clamp-1">{p.name}</h4>
                <p className="text-primary font-black tracking-tighter">{formatCurrency(p.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
