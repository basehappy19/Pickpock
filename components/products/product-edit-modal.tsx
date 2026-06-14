"use client";

import React, { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { uploadProductImage } from "@/lib/supabase";
import { toast } from "sonner";
import { Edit, Plus, X, Image as ImageIcon, Loader2, Sparkles } from "lucide-react";
import { cn, getImgSrc } from "@/lib/utils";
import { useGlobalData } from "@/hooks/use-global-data";

export default function ProductEditModal({ 
  product, 
  isOpen, 
  onClose,
  onSuccess
}: { 
  product: any; 
  isOpen: boolean; 
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { t } = useLanguage();
  const { updateProduct } = useGlobalData();
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  
  const [editData, setEditData] = useState({
    ...product,
    weight: product.weight || "",
    dimensions: product.dimensions || "",
    warranty: product.warranty || "",
    additionalDetails: product.additionalDetails || "",
    description: product.description || ""
  });

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const url = await uploadProductImage(file);
    if (url) {
      setEditData((prev: any) => ({ ...prev, image: url }));
      toast.success(t.dashboard.uploadSuccess);
    } else {
      toast.error(t.dashboard.uploadError);
    }
    setIsUploading(false);
  };

  const typeText = (text: string) => {
    let index = 0;
    setEditData((prev: any) => ({ ...prev, description: "" }));
    
    const interval = setInterval(() => {
      if (index < text.length) {
        const char = text[index];
        setEditData((prev: any) => ({
          ...prev,
          description: prev.description + char
        }));
        index++;
      } else {
        clearInterval(interval);
        setIsGeneratingDesc(false);
        toast.success(t.dashboard.aiGeneratedSuccess);
      }
    }, 15);
  };

  const generateAIDescription = async () => {
    if (!editData.name.trim()) {
      toast.error(t.dashboard.enterProductName);
      return;
    }

    setIsGeneratingDesc(true);
    try {
      const res = await fetch("/api/ai/product-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: editData.name,
          category: editData.category,
          language: "both"
        })
      });

      const data = await res.json();
      if (data.success && data.description) {
        const fullDesc = data.description.th || data.description.en || data.description.description || data.description;
        typeText(fullDesc);
      } else {
        setIsGeneratingDesc(false);
        toast.error(t.dashboard.aiGenerateError);
      }
    } catch (e) {
      setIsGeneratingDesc(false);
      toast.error(t.dashboard.aiGenerateError);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading || isGeneratingDesc) return;
    
    if (!editData.name || editData.price === "" || editData.stock === "") {
        toast.error(t.dashboard.saveError || "Please fill required fields");
        return;
    }

    try {
      await updateProduct(editData);
      toast.success(t.dashboard.updateSuccess);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(t.dashboard.saveError);
    }
  };

  const isSubmitDisabled = isUploading || isGeneratingDesc || !editData.name || editData.price === "" || editData.stock === "" || !editData.category;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 p-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card w-full h-[100dvh] sm:h-auto max-w-4xl sm:max-h-[90vh] flex flex-col sm:rounded-4xl sm:border-2 border-primary/20 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 bg-rainbow-gradient border-b flex justify-between items-center text-primary shrink-0">
          <h3 className="text-2xl font-semibold tracking-tight flex items-center gap-3 uppercase tracking-tighter">
            <Edit className="h-6 w-6" /> {t.dashboard.editProduct}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full cursor-pointer"><X /></button>
        </div>
        <form onSubmit={handleUpdate} className="p-8 space-y-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.table.name}</label>
              <input type="text" required placeholder={t.dashboard.productNamePlaceholder} className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-medium" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.table.price} (฿)</label>
              <input type="number" required className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-medium" value={editData.price} onChange={(e) => setEditData({...editData, price: Number(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.table.stock}</label>
              <input type="number" required className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-medium" value={editData.stock} onChange={(e) => setEditData({...editData, stock: Number(e.target.value)})} />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.uploadImage}</label>
              <div className="flex items-center gap-4">
                <div className="h-24 w-24 rounded-2xl bg-muted border-2 border-dashed border-primary/20 flex items-center justify-center overflow-hidden shrink-0 relative group">
                  {editData.image ? (<img src={getImgSrc(editData.image)} className="h-full w-full object-cover" alt="Preview" />) : (<ImageIcon className="h-8 w-8 text-primary/20" />)}
                  {isUploading && (<div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="h-6 w-6 text-white animate-spin" /></div>)}
                </div>
                <div className="flex-1 space-y-2">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="edit-product-image-upload" disabled={isUploading} />
                  <label htmlFor="edit-product-image-upload" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest hover:bg-primary/20 transition-all cursor-pointer disabled:opacity-50">
                    <ImageIcon className="h-3.5 w-3.5" />{isUploading ? t.dashboard.uploading : t.dashboard.selectPhoto}
                  </label>
                  <p className="text-xs text-muted-foreground font-medium italic leading-tight">{t.dashboard.photoDesc}</p>
                </div>
              </div>
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.table.category}</label>
              <select className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-semibold uppercase text-xs" value={editData.category || "Electronics"} onChange={(e) => setEditData({...editData, category: e.target.value})}>
                <option value="Electronics">{t.dashboard.categories?.electronics || "Electronics"}</option>
                <option value="Fashion">{t.dashboard.categories?.fashion || "Fashion"}</option>
                <option value="Home">{t.dashboard.categories?.home || "Home"}</option>
                <option value="Sports">{t.dashboard.categories?.sports || "Sports"}</option>
                <option value="Beauty">{t.dashboard.categories?.beauty || "Beauty"}</option>
                <option value="Toys">{t.dashboard.categories?.toys || "Toys"}</option>
              </select>
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.extendedFields?.weight} <span className="lowercase">{t.dashboard.extendedFields?.optional}</span></label><input type="text" placeholder={t.dashboard.extendedFields?.weightPlaceholder} className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-medium" value={editData.weight || ""} onChange={(e) => setEditData({...editData, weight: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.extendedFields?.dimensions} <span className="lowercase">{t.dashboard.extendedFields?.optional}</span></label><input type="text" placeholder={t.dashboard.extendedFields?.dimensionsPlaceholder} className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-medium" value={editData.dimensions || ""} onChange={(e) => setEditData({...editData, dimensions: e.target.value})} /></div>
            </div>
            <div className="col-span-2 space-y-2"><label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.extendedFields?.warranty} <span className="lowercase">{t.dashboard.extendedFields?.optional}</span></label><input type="text" placeholder={t.dashboard.extendedFields?.warrantyPlaceholder} className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-medium" value={editData.warranty || ""} onChange={(e) => setEditData({...editData, warranty: e.target.value})} /></div>
            <div className="col-span-2 space-y-2"><label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.extendedFields?.additionalDetails} <span className="lowercase">{t.dashboard.extendedFields?.optional}</span></label><textarea rows={2} placeholder={t.dashboard.extendedFields?.additionalDetailsPlaceholder} className="w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-medium resize-none" value={editData.additionalDetails || ""} onChange={(e) => setEditData({...editData, additionalDetails: e.target.value})} /></div>
            <div className="col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">{t.dashboard.descPlaceholderLabel}</label>
                <button 
                  type="button" 
                  onClick={generateAIDescription} 
                  disabled={isGeneratingDesc || !editData.name.trim()} 
                  className={cn(
                    "flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all",
                    (isGeneratingDesc || !editData.name.trim()) 
                      ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50" 
                      : "bg-linear-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 cursor-pointer shadow-md active:scale-95"
                  )}
                >
                  <Sparkles className="h-3 w-3" />{isGeneratingDesc ? t.dashboard.generating : t.dashboard.aiWrite}
                </button>
              </div>
              <textarea rows={3} placeholder={t.dashboard.descPlaceholder} className={cn("w-full px-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none transition-all font-medium resize-none", isGeneratingDesc && "animate-pulse")} value={editData.description} onChange={(e) => setEditData({...editData, description: e.target.value})} />
              {isGeneratingDesc && (<div className="flex items-center gap-2 px-2 text-xs font-semibold text-primary animate-bounce"><Sparkles className="h-3 w-3" />AI IS TYPING...</div>)}
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isSubmitDisabled}
            className={cn(
              "w-full h-16 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-3",
              isSubmitDisabled ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 cursor-pointer"
            )}
          >
            <Edit className="h-6 w-6" /> {t.dashboard.updateProduct}
          </button>
        </form>
      </div>
    </div>
  );
}
