"use client";

import { useState } from "react";
import { Product } from "@/types";
import { Sparkles, Loader2, MessageSquareText } from "lucide-react";
import { aiService } from "@/services/api-service";
import { useLanguage } from "@/hooks/use-language";

export default function AIInsights({ product }: { product: Product }) {
  const { t } = useLanguage();
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsight = async () => {
    setInsight(null);
    setLoading(true);
    try {
      const prompt = `จากข้อมูลสินค้าและรีวิวที่มี ช่วยสรุปข้อดีและข้อเสียสั้นๆ สำหรับลูกค้ารายนี้หน่อย โดยใช้ภาษาที่เป็นกันเองและน่าเชื่อถือในมุมมองของเจ้าของร้าน`;
      const result = await aiService.askGemini(prompt, { 
        product: {
          name: product.name,
          description: product.description,
          rating: product.rating,
          reviews: product.reviews
        }
      });
      setInsight(result);
    } catch (error) {
      console.error(error);
      setInsight(t.products.aiInsights.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-1 rounded-[2.2rem] bg-rainbow-gradient animate-rainbow shadow-2xl">
      <div className="p-8 lg:p-10 rounded-[2rem] bg-card/90 backdrop-blur-xl relative overflow-hidden group border border-primary/10">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700">
          <Sparkles size={150} className="text-rainbow" />
        </div>

        <div className="relative space-y-6">
          <div className="flex items-center gap-3 text-rainbow font-semibold tracking-widest uppercase text-xs">
            <Sparkles className="h-5 w-5 fill-current animate-pulse" />
            {t.products.aiInsights.title}
          </div>
          
          <h3 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/50">
            {t.products.aiInsights.subtitle}
          </h3>
          
          {loading ? (
            <div className="flex items-center gap-2 p-6 rounded-2xl bg-muted/30 border-2 border-dashed border-primary/20 animate-pulse">
              <span className="text-sm font-medium text-muted-foreground">{t.products.aiInsights.analyzing}</span>
              <div className="flex gap-1 items-center">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          ) : insight ? (
            <div className="bg-background/50 backdrop-blur-sm p-6 rounded-2xl border-2 border-primary/5 shadow-inner animate-in zoom-in-95 duration-500 text-foreground/90 leading-relaxed whitespace-pre-line font-medium border-l-4 border-l-primary">
              {insight}
            </div>
          ) : (
            <p className="text-muted-foreground text-lg font-medium italic">
              "{t.products.aiInsights.placeholder}"
            </p>
          )}

          <button
            onClick={generateInsight}
            disabled={loading}
            className="group relative h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-primary/20 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-rainbow-gradient opacity-0 group-hover:opacity-20 transition-opacity" />
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageSquareText className="h-5 w-5 group-hover:scale-110 transition-transform" />}
            <span className="relative">{insight ? t.products.aiInsights.buttonRetry : t.products.aiInsights.button}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
