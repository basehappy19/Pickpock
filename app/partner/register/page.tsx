"use client";

import { useState, useEffect } from "react";
import { useRole } from "@/hooks/use-role";
import { useLanguage } from "@/hooks/use-language";
import { Store, ShoppingBag, ShieldCheck, Loader2, CheckCircle2, ArrowRight, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PartnerRegisterPage() {
  const { user, updateUserStore } = useRole();
  const { t } = useLanguage();
  const router = useRouter();

  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError("User session not found. Please login again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner_id: user?.id,
          name: storeName,
          description: description
        })
      });

      if (res.ok) {
        const data = await res.json();
        updateUserStore(data.store);
        setStep("success");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create store");
      }
    } catch (e) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 py-12 animate-in fade-in zoom-in-95 duration-700">
      {step === "form" ? (
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex p-4 rounded-3xl bg-primary/10 text-primary mb-2">
              <Building2 className="h-10 w-10" />
            </div>
            <h1 className="text-5xl font-semibold tracking-tighter leading-none uppercase">
              {t.partner.heroTitle} <span className="text-primary text-rainbow-animate">{t.partner.heroHighlight}</span>
            </h1>
            <p className="text-muted-foreground font-medium text-lg">
              {t.partner.heroSubtitle}
            </p>
            <ul className="space-y-4">
              {t.partner.benefits.map((benefit: string, i: number) => (
                <li key={i} className="flex items-center gap-3 font-semibold text-sm uppercase tracking-tight">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card border-2 border-primary/10 rounded-xl p-8 lg:p-10 shadow-2xl shadow-primary/5">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">{t.partner.storeName}</label>
                  <input
                    type="text"
                    required
                    placeholder={t.partner.namePlaceholder}
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-6 py-4 rounded-xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">{t.partner.phone}</label>
                  <input
                    type="tel"
                    required
                    placeholder={t.partner.phonePlaceholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-6 py-4 rounded-xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">{t.partner.description}</label>
                  <textarea
                    required
                    rows={4}
                    placeholder={t.partner.descPlaceholder}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-6 py-4 rounded-xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium resize-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-16 rounded-xl bg-primary text-primary-foreground font-semibold text-lg shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ShoppingBag className="h-6 w-6" />}
                {t.partner.submit}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 space-y-8 max-w-2xl mx-auto">
          <div className="inline-flex p-6 rounded-full bg-emerald-100 text-emerald-600 mb-4 animate-bounce">
            <CheckCircle2 className="h-16 w-16" />
          </div>
          <h2 className="text-4xl font-semibold tracking-tighter uppercase">{t.partner.successTitle}</h2>
          <p className="text-muted-foreground font-medium text-lg">
            {t.partner.successDesc}
          </p>
          <button
            onClick={() => router.push("/")}
            className="h-14 px-10 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center gap-2 mx-auto hover:opacity-90 transition-all shadow-xl shadow-primary/20 cursor-pointer"
          >
            {t.partner.returnHome} <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
