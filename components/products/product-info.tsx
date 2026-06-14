"use client";

import { useLanguage } from "@/hooks/use-language";
import { formatCurrency, formatDate, cn, getImgSrc } from "@/lib/utils";
import { Star, ShieldCheck, ShoppingCart, Heart, Truck, MessageSquare, Store as StoreIcon, ArrowRight, Share2, CheckCircle2, GitCompare, Info, Edit, Ticket } from "lucide-react";
import { useState, useEffect } from "react";
import NextImage from "next/image";
import { Product, Store } from "@/types";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { useCompare } from "@/hooks/use-compare";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/use-role";
import { useGlobalData } from "@/hooks/use-global-data";
import AIBundleSuggest from "./ai-bundle-suggest";
import ProductEditModal from "./product-edit-modal";
import { toast } from "sonner";

export default function ProductInfo({ product, allProducts }: { product: Product, allProducts: Product[] }) {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { addToCompare } = useCompare();
  const { role, user } = useRole();
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [storeData, setStoreData] = useState<Store | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const router = useRouter();

  const { coupons } = useGlobalData();
  const [userOwnedCodes, setUserOwnedCodes] = useState<string[]>([]);

  const isRestricted = role === "founder" || role === "partner";
  const isOwner = (role === "founder" && product.isOfficial) || (role === "partner" && user?.store?.store_id === product.storeId);

  useEffect(() => {
    if (user) {
      fetch(`/api/user-data/${user.id}`)
        .then(r => r.json())
        .then(data => {
          if (data.coupons) setUserOwnedCodes(data.coupons);
        });
    } else {
      const guestCoupons = localStorage.getItem("guest_coupons");
      if (guestCoupons) setUserOwnedCodes(JSON.parse(guestCoupons));
    }
  }, [user]);

  const myAvailableCoupons = coupons.filter((c: any) => userOwnedCodes.includes(c.code));

  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);

      const fetchStore = async () => {
        try {
          const res = await fetch("/api/stores");
          if (res.ok) {
            const stores: Store[] = await res.json();
            const found = stores.find((s) => s.store_id === product.storeId || (product.isOfficial && s.store_id === 's-001'));
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

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(t.products.copied);
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handleInquiry = () => {
    window.dispatchEvent(new CustomEvent('openChat', { detail: { product } }));
  };

  const placeholderImg = "https://placehold.co/800x800?text=Product+Not+Found";

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {isRestricted && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-200 dark:border-rose-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-800">
              <ShoppingCart className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="font-semibold text-rose-900 dark:text-rose-100 text-lg">{t.products.restrictedTitle}</p>
              <p className="text-sm text-rose-700 dark:text-rose-300 font-medium">{t.products.restrictedDesc}</p>
            </div>
          </div>
        </div>
      )}
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square relative rounded-[2.5rem] overflow-hidden border-2 border-primary/5 bg-muted shadow-2xl">
            <NextImage
              src={getImgSrc(product.image) || placeholderImg}
              alt={product.name}
              fill
              priority
              className="object-cover transition-transform duration-1000 hover:scale-110"
            />
            {product.isOfficial && (
              <div className="absolute top-6 left-6 px-4 py-1.5 bg-amber-500 text-white text-xs font-semibold uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> {t.products.officialStore}
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
        </div>

        {/* Right: Info */}
        <div className="flex flex-col justify-between py-2 space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest">
                  {(t.categories as Record<string, string>)[product.category] || product.category}
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-semibold">{Number(product.rating).toFixed(1)}</span>
                  <span className="text-muted-foreground font-medium text-xs">({product.reviews.length} รีวิว)</span>
                </div>
              </div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-4xl lg:text-5xl font-semibold tracking-tighter leading-none">{product.name}</h1>
                {isOwner && (
                  <button onClick={() => setShowEditModal(true)} className="shrink-0 h-10 px-4 rounded-xl bg-primary text-primary-foreground flex items-center gap-2 font-semibold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 cursor-pointer">
                    <Edit className="h-4 w-4" /> {t.dashboard?.editProduct || "Edit"}
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-semibold text-primary tracking-tighter">{formatCurrency(product.price)}</span>
              {product.stock < 10 && product.stock > 0 && (
                <span className="text-rose-500 font-semibold text-xs uppercase tracking-widest animate-pulse">{t.products.stockAlert1}{product.stock}{t.products.stockAlert2}</span>
              )}
              {product.stock === 0 && (
                <span className="text-rose-500 font-semibold text-xs uppercase tracking-widest">{t.products.outOfStock}</span>
              )}
            </div>

            <p className="text-muted-foreground font-medium leading-relaxed max-w-lg">
              {product.description || t.products.defaultDesc}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50 border border-primary/5">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{t.products.shippingDetails}</p>
                  <p className="text-xs font-semibold">{t.products.freeShipping}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50 border border-primary/5">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{t.products.warrantyDetails}</p>
                  <p className="text-xs font-semibold">{t.products.oneYearWarranty}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-8 border-t">
            {myAvailableCoupons.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3 animate-in fade-in zoom-in-95">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                  <Ticket className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-0.5">
                    {language === 'th' ? "คูปองของคุณที่มีอยู่" : "My Available Coupons"}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {myAvailableCoupons.map((c: any) => (
                      <span key={c.code} className="inline-flex items-center gap-1 bg-white text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-md border border-emerald-200">
                        {c.code} ({c.type === 'percent' ? `${c.discount}%` : `฿${c.discount}`})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">{t.products.quantity}</label>
                <div className="flex items-center bg-muted rounded-2xl p-1 border-2 border-transparent focus-within:border-primary/20">
                  <button
                    onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                    className="w-10 h-10 flex items-center justify-center font-semibold hover:bg-background rounded-xl transition-all"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold text-lg">{selectedQuantity}</span>
                  <button
                    onClick={() => setSelectedQuantity(Math.min(product.stock, selectedQuantity + 1))}
                    className="w-10 h-10 flex items-center justify-center font-semibold hover:bg-background rounded-xl transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex-1 pt-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isRestricted}
                  className={cn(
                    "w-full h-16 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 cursor-pointer",
                    isRestricted
                      ? "bg-muted text-muted-foreground cursor-not-allowed grayscale"
                      : isAdded
                        ? "bg-emerald-500 text-white shadow-emerald-500/20"
                        : "bg-primary text-primary-foreground shadow-primary/20 hover:opacity-90"
                  )}
                >
                  {isRestricted ? (
                    <>
                      <Info className="h-6 w-6" />
                      {t.products.restrictedManager}
                    </>
                  ) : isAdded ? (
                    <>
                      <CheckCircle2 className="h-6 w-6" />
                      {t.products.addedToCart}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-6 w-6" />
                      {product.stock === 0 ? t.products.outOfStock : t.products.addToCart}
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <div 
                onClick={handleShare}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
              >
                <Share2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold uppercase tracking-widest">{t.products.shareProduct}</span>
              </div>
              <div 
                onClick={handleInquiry}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
              >
                <MessageSquare className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold uppercase tracking-widest">{t.products.inquiry}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Bundle Suggestion */}
      <div className="pt-8">
        <AIBundleSuggest currentProduct={product} allProducts={allProducts} />
      </div>

      {/* Tabs Section */}
      <div className="pt-12">
        <div className="flex border-b border-muted overflow-x-auto scrollbar-hide">
          {(["description", "specs", "reviews"] as const).map((tab) => {
            if (tab === "specs" && (!product.specs || Object.keys(product.specs).length === 0)) return null;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-8 py-4 text-xs font-semibold uppercase tracking-widest border-b-4 transition-all whitespace-nowrap",
                  activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab === "description" ? t.products.tabsData.description : tab === "specs" ? t.products.tabsData.specs : t.products.tabsData.reviews}
              </button>
            );
          })}
        </div>
        <div className="py-12 animate-in fade-in duration-500">
          {activeTab === "description" && (
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-3xl font-semibold tracking-tight">{t.products.tabsData.description}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed text-lg whitespace-pre-wrap">
                  {product.description}
                </p>
                
                <div className="pt-6 space-y-4 border-t border-muted">
                  <h4 className="font-semibold text-lg">{t.products.tabsData.specs || "Product Details"}</h4>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 font-medium text-sm uppercase tracking-tight">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <span className="text-muted-foreground">{t.dashboard?.extendedFields?.weight || "Weight"}:</span> {product.weight || "-"}
                    </li>
                    <li className="flex items-center gap-3 font-medium text-sm uppercase tracking-tight">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <span className="text-muted-foreground">{t.dashboard?.extendedFields?.dimensions || "Dimensions"}:</span> {product.dimensions || "-"}
                    </li>
                    <li className="flex items-center gap-3 font-medium text-sm uppercase tracking-tight">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <span className="text-muted-foreground">{t.dashboard?.extendedFields?.warranty || "Warranty"}:</span> {product.warranty || "-"}
                    </li>
                    <li className="flex items-start gap-3 font-medium text-sm uppercase tracking-tight">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-muted-foreground">{t.dashboard?.extendedFields?.additionalDetails || "Details"}:</span> 
                        <p className="mt-1 lowercase normal-case">{product.additionalDetails || "-"}</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
                <NextImage src={getImgSrc(product.image) || placeholderImg} alt="Detail" fill className="object-cover" />
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]" />
              </div>
            </div>
          )}
          {activeTab === "specs" && product.specs && (
            <div className="max-w-3xl space-y-4">
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="flex justify-between py-4 border-b border-muted group hover:bg-muted/30 px-4 rounded-xl transition-all">
                  <span className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">{key}</span>
                  <span className="font-semibold text-sm uppercase">{String(val)}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === "reviews" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row items-center gap-8 p-8 rounded-4xl bg-muted/30 border-2 border-primary/5">
                <div className="text-center space-y-2">
                  <p className="text-7xl font-semibold tracking-tighter text-primary">{Number(product.rating).toFixed(1)}</p>
                  <div className="flex items-center justify-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={cn("h-4 w-4", star <= Math.round(product.rating) ? "fill-current" : "text-muted")} />
                    ))}
                  </div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{t.products.reviewDetails.total1}{product.reviews.length}{t.products.reviewDetails.total2}</p>
                </div>
                <div className="flex-1 space-y-2 w-full">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-4">
                      <span className="text-xs font-semibold w-4">{star}</span>
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
                  <div key={review.id} className="p-8 rounded-4xl bg-card border-2 border-primary/5 shadow-xl shadow-primary/5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center font-semibold text-primary">
                          {review.user.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{review.user}</p>
                          <p className="text-xs font-medium text-muted-foreground">{t.products.reviewDetails.verified}{formatDate(review.date, language)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={cn("h-3 w-3", star <= review.rating ? "fill-current" : "text-muted")} />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground font-medium italic">"{review.comment}"</p>
                    {review.sentiment && (
                      <div className={cn(
                        "inline-flex px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-tight",
                        review.sentiment === 'positive' ? "bg-emerald-50 text-emerald-600" :
                          review.sentiment === 'negative' ? "bg-rose-50 text-rose-600" : "bg-muted text-muted-foreground"
                      )}>
                        {t.products.reviewDetails.sentimentPrefix}{review.sentiment === 'positive' ? t.products.reviewDetails.positive : review.sentiment === 'negative' ? t.products.reviewDetails.negative : t.products.reviewDetails.neutral}
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground font-medium">{t.products.reviewDetails.noReviews}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Store Section */}
      <div className="bg-secondary border border-border rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
            <StoreIcon className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-[15px] font-medium text-foreground mb-0.5">
              {storeData?.name || "MSU Founder Store"}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                <Star className="inline w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                {Number(storeData?.rating || 4.9).toFixed(1)}
              </span>
              <span>·</span>
              <span className="text-emerald-700 font-medium">{t.products.storeData.fastReply}</span>
              <span>·</span>
              <span className="bg-background border border-border px-1.5 py-px rounded-full text-[11px] text-muted-foreground">
                {product.isOfficial ? "Official" : "Trusted"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push(`/stores/${storeData?.store_id || "mall"}`)}
          className="h-8.5 px-4 rounded-lg bg-background text-foreground border border-border text-[13px] hover:bg-accent transition-colors cursor-pointer whitespace-nowrap"
        >
          {t.products.storeData.visitStore}
        </button>
      </div>

      {/* Related Products */}
      <div className="space-y-8 pt-12">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold tracking-tight">{t.products.related.title1}<span className="text-primary">{t.products.related.title2}</span></h2>
            <p className="text-muted-foreground font-medium">{t.products.related.fromCategory}<span className="text-primary uppercase">{(t.categories as Record<string, string>)[product.category] || product.category}</span></p>
          </div>
          <button onClick={() => router.push('/products')} className="h-12 px-6 rounded-xl border-2 border-primary/10 font-semibold text-xs uppercase tracking-widest hover:bg-primary/5 transition-all">
            {t.products.related.viewAll}
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {relatedProducts.map((p) => (
            <div
              key={p.id}
              className="group bg-card rounded-2xl border overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer"
              onClick={() => router.push(`/product/${p.id}`)}
            >
              <div className="aspect-square relative overflow-hidden bg-muted">
                <NextImage
                  src={getImgSrc(p.image) || placeholderImg}
                  alt={p.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-4 space-y-2 text-center">
                <h4 className="font-semibold text-xs uppercase tracking-tight line-clamp-1">{p.name}</h4>
                <p className="text-primary font-semibold tracking-tighter">{formatCurrency(p.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ProductEditModal 
        product={product} 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
      />
    </div>
  );
}
