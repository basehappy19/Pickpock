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
    <div className="p-6 lg:p-8 rounded-[2rem] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
        <Sparkles size={120} className="text-primary" />
      </div>

      <div className="relative space-y-4">
        <div className="flex items-center gap-2 text-primary font-bold tracking-tight">
          <Sparkles className="h-5 w-5 fill-current animate-pulse" />
          {t.products.aiInsights.title}
        </div>
        
        <h3 className="text-xl font-bold">{t.products.aiInsights.subtitle}</h3>
        
        {insight ? (
          <div className="bg-background/80 backdrop-blur-sm p-6 rounded-2xl border-2 border-primary/10 shadow-sm animate-in zoom-in-95 duration-500 text-foreground/90 leading-relaxed whitespace-pre-line">
            {insight}
          </div>
        ) : (
          <p className="text-muted-foreground font-medium">
            {t.products.aiInsights.placeholder}
          </p>
        )}

        <button
          onClick={generateInsight}
          disabled={loading}
          className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20 cursor-pointer"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquareText className="h-4 w-4" />}
          {insight ? t.products.aiInsights.buttonRetry : t.products.aiInsights.button}
        </button>
      </div>
    </div>
  );
}
