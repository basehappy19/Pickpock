"use client";

import { useGlobalData } from "@/hooks/use-global-data";
import { useLanguage } from "@/hooks/use-language";
import { useRole } from "@/hooks/use-role";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Store, Star, Package, MapPin, Calendar, ShieldCheck, ArrowLeft, Box, X, Save, Edit2, MessageCircle, Send } from "lucide-react";
import { cn, formatCurrency, getImgSrc } from "@/lib/utils";
import NextImage from "next/image";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";

interface Props {
  storeId: string;
  initialStore?: any;
  storeNotFound?: boolean;
}

export default function StoreDetailClient({ storeId, initialStore, storeNotFound = false }: Props) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { products } = useGlobalData();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { user } = useRole();

  const [store, setStore] = useState<any>(initialStore || null);
  const [loading, setLoading] = useState(!initialStore);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Contact modal state
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  const isStoreOwner = user && store && user.id === store.owner_id;

  useEffect(() => {
    if (initialStore) return;

    const fetchStore = async () => {
      try {
        const res = await fetch("/api/stores");
        const stores = await res.json();
        // Handle 'mall' as s-001 or find by ID
        const foundStoreId = storeId === 'mall' ? 's-001' : storeId;
        const found = stores.find((s: any) => s.store_id === foundStoreId);
        setStore(found);

        // Increment views if it's a real partner store
        if (found && foundStoreId !== 's-001') {
          fetch("/api/stores", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ store_id: foundStoreId, views: 1 })
          }).catch(console.error);
        }
      } catch (e) {
        console.error("Failed to fetch store", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [storeId, initialStore]);

  const handleSaveEdit = async () => {
    if (!store) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/stores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: store.store_id,
          name: editName,
          description: editDescription
        })
      });

      if (res.ok) {
        const data = await res.json();
        setStore(data.store);
        setIsEditing(false);
      }
    } catch (e) {
      console.error("Failed to update store", e);
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = () => {
    if (store) {
      setEditName(store.name);
      setEditDescription(store.description);
      setIsEditing(true);
    }
  };

  const handleSendContact = async () => {
    if (!contactMessage.trim() || !user) return;

    setIsSending(true);
    // Simulate sending message
    setTimeout(() => {
      setIsSending(false);
      setContactSent(true);
      setContactMessage("");
      setTimeout(() => {
        setIsContactOpen(false);
        setContactSent(false);
      }, 2000);
    }, 1000);
  };

  const openContactModal = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setIsContactOpen(true);
    setContactSent(false);
  };

  const storeProducts = useMemo(() => {
    // If id is 'mall' or 's-001', show official products. Otherwise, show products by storeId.
    const isMall = storeId === 'mall' || storeId === 's-001' || store?.store_id === 's-001';
    return products.filter(p => p.storeId === store?.store_id || (isMall && (p.isOfficial || p.storeId === 'mall' || p.storeId === 's-001')));
  }, [products, store, storeId]);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="font-black text-xs uppercase tracking-widest text-muted-foreground">{t.common.loading}</p>
    </div>
  );

  if (!store && storeId !== 'mall' && storeId !== 's-001' && !storeNotFound) return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-6">
      <Box className="h-16 w-16 text-muted-foreground/20" />
      <h2 className="text-3xl font-black tracking-tight">{t.store.notFound}</h2>
      <button onClick={() => router.back()} className="h-12 px-6 rounded-xl bg-primary text-white font-black">{t.store.goBack}</button>
    </div>
  );

  const displayStore = store || {
    name: "PickPock Mall",
    rating: 4.9,
    description: language === 'th'
      ? "แหล่งรวมสินค้าพรีเมียมอย่างเป็นทางการโดย PickPock มั่นใจในคุณภาพและของแท้ 100% พร้อมบริการเหนือระดับ"
      : "The official premium collection by PickPock. Trusted quality, guaranteed authenticity with superior service.",
    joined_at: "2026-01-01"
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Store Header Banner */}
      <div className="relative h-64 lg:h-96 rounded-[3.5rem] overflow-hidden group shadow-2xl border-4 border-card">
        <NextImage
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop"
          alt="Banner"
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        <div className="absolute bottom-10 left-10 lg:left-16 flex flex-col md:flex-row items-end md:items-center gap-10 w-full pr-10">
           <div className="h-28 w-24 lg:h-40 lg:w-40 rounded-[3rem] bg-white p-2 shadow-2xl overflow-hidden shrink-0 group-hover:rotate-3 transition-transform duration-500 flex items-center justify-center">
              {store?.store_id === "mall" || storeId === "mall" ? (
                <NextImage
                  src="/brand/logo_full.png"
                  alt="PickPock Mall Logo"
                  width={150}
                  height={150}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="h-full w-full rounded-[2.8rem] bg-primary flex items-center justify-center text-white shadow-inner">
                  <Store className="h-14 w-14 lg:h-20 lg:w-20" />
                </div>
              )}
           </div>
           <div className="text-white space-y-3 flex-1">
              <div className="flex items-center gap-4">
                 <h1 className="text-4xl lg:text-7xl font-black tracking-tighter uppercase leading-none">{displayStore.name}</h1>
                 {isStoreOwner && (
                   <button
                     onClick={openEditModal}
                     className="p-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
                     title="Edit store"
                   >
                     <Edit2 className="h-5 w-5" />
                   </button>
                 )}
                 <div className="p-2 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                    <ShieldCheck className="h-6 w-6 lg:h-8 lg:w-8" />
                 </div>
              </div>
              <div className="flex flex-wrap items-center gap-8 text-sm font-black uppercase tracking-widest opacity-90">
                 <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {Number(displayStore.rating).toFixed(1)} (2.4k+ {t.store.ratings})
                 </span>
                 <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
                    <Package className="h-4 w-4" /> {storeProducts.length} {t.nav.products}
                 </span>
                 <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
                    <Calendar className="h-4 w-4" /> {t.store.joined} {new Date(displayStore.joined_at).getFullYear()}
                 </span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-12 pt-4">
        {/* Left: About */}
        <aside className="space-y-8">
           <div className="bg-card border-2 border-primary/5 rounded-[2.5rem] p-8 space-y-6 shadow-xl shadow-primary/5">
              <h3 className="text-xs font-black uppercase tracking-widest text-primary">{t.store.about}</h3>
              <p className="text-muted-foreground font-bold leading-relaxed text-sm">{displayStore.description}</p>
              <div className="pt-4 space-y-4 border-t border-muted">
                 <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><MapPin className="h-4 w-4" /></div>
                    {t.store.globalShipping}
                 </div>
                 <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600"><ShieldCheck className="h-4 w-4" /></div>
                    {t.store.responseRate}
                 </div>
              </div>
              <button onClick={openContactModal} className="w-full py-4 rounded-2xl bg-muted text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all cursor-pointer">
                {t.store.contact}
              </button>
           </div>
        </aside>

        {/* Right: Products */}
        <div className="lg:col-span-3 space-y-8">
           <div className="flex items-center justify-between border-b border-muted pb-6">
              <h2 className="text-4xl font-black tracking-tight">{t.store.collection.split(" ")[0]} <span className="text-primary uppercase">{t.store.collection.split(" ").slice(1).join(" ")}</span></h2>
              <div className="px-4 py-1.5 rounded-full bg-muted font-black text-[10px] uppercase tracking-widest text-muted-foreground">
                {storeProducts.length} {t.store.itemsAvailable}
              </div>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
              {storeProducts.map(product => (
                <div
                  key={product.id}
                  className="group bg-card rounded-[2rem] border overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col h-full"
                  onClick={() => {
                    addToRecentlyViewed(product);
                    router.push(`/product/${product.id}`);
                  }}
                >
                  <div className="aspect-square relative bg-muted overflow-hidden">
                    <NextImage src={getImgSrc(product.image)} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" sizes="(max-width: 768px) 50vw, 20vw" />
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-background/80 backdrop-blur-md text-[8px] font-black uppercase tracking-widest shadow-sm border">
                      {(t.categories as Record<string, string>)[product.category] || product.category}
                    </div>
                  </div>
                  <div className="p-5 lg:p-6 space-y-3 flex-1 flex flex-col justify-between">
                    <h4 className="font-black text-sm lg:text-base uppercase line-clamp-2 leading-tight group-hover:text-primary transition-colors">{product.name}</h4>
                    <div className="flex items-center justify-between pt-2">
                       <p className="text-primary font-black text-lg lg:text-2xl tracking-tighter">{formatCurrency(product.price)}</p>
                       <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ArrowLeft className="h-4 w-4 rotate-180" /></div>
                    </div>
                  </div>
                </div>
              ))}
           </div>

           {storeProducts.length === 0 && (
             <div className="py-20 text-center space-y-4 bg-muted/30 rounded-[3rem] border-4 border-dashed">
                <Box className="h-16 w-16 mx-auto text-muted-foreground/20" />
                <p className="font-black text-muted-foreground uppercase tracking-widest">{t.store.noProducts}</p>
             </div>
           )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between border-b border-muted pb-4">
              <h3 className="text-xl font-black tracking-tight">{t.store.editStoreDetails}</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-xl hover:bg-muted transition-all cursor-pointer"
                title={t.common.close}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.store.storeName}</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-muted border-2 border-transparent focus:border-primary focus:outline-none font-bold transition-all"
                  placeholder={t.store.storeNamePlaceholder}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.store.storeDescription}</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-muted border-2 border-transparent focus:border-primary focus:outline-none font-bold resize-none transition-all"
                  placeholder={t.store.storeDescPlaceholder}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl bg-muted font-black uppercase tracking-widest hover:bg-muted/80 transition-all disabled:opacity-50 cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving || !editName.trim()}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-black uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t.store.saving}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {t.common.save}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {isContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between border-b border-muted pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">{t.store.contact}</h3>
                  <p className="text-xs text-muted-foreground font-medium">{displayStore.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsContactOpen(false)}
                className="p-2 rounded-xl hover:bg-muted transition-all cursor-pointer"
                title={t.common.close}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {contactSent ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <Send className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-black text-green-600">{t.common.confirm}</h4>
                <p className="text-muted-foreground">{language === 'th' ? 'ส่งข้อความถึงเจ้าของร้านแล้ว' : 'Message sent to store owner!'}</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {!user && (
                    <div className="p-4 rounded-xl bg-amber-50 text-amber-800 text-sm font-medium text-center">
                      {language === 'th' ? 'กรุณาเข้าสู่ระบบก่อนติดต่อผู้ขาย' : 'Please login to contact the seller'}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      {language === 'th' ? 'ข้อความ' : 'Message'}
                    </label>
                    <textarea
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      rows={5}
                      disabled={!user}
                      className="w-full px-4 py-3 rounded-xl bg-muted border-2 border-transparent focus:border-primary focus:outline-none font-bold resize-none transition-all disabled:opacity-50"
                      placeholder={language === 'th' ? 'พิมพ์ข้อความที่คุณต้องการถามเจ้าของร้าน...' : 'Type your message to the store owner...'}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsContactOpen(false)}
                    disabled={isSending}
                    className="flex-1 py-3 rounded-xl bg-muted font-black uppercase tracking-widest hover:bg-muted/80 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    onClick={handleSendContact}
                    disabled={isSending || !contactMessage.trim() || !user}
                    className="flex-1 py-3 rounded-xl bg-primary text-white font-black uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSending ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {language === 'th' ? 'กำลังส่ง...' : 'Sending...'}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {language === 'th' ? 'ส่งข้อความ' : 'Send Message'}
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
