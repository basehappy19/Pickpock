"use client";

import { useState } from "react";
import { Leaf, Recycle, Droplets, Zap, Loader2, ArrowRight } from "lucide-react";
import { useAIStream } from "@/hooks/use-ai-stream";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/shared/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface AISustainabilityAdvisorProps {
  products?: Product[];
  storeProducts?: Product[];
}

interface SustainabilityMetrics {
  score: number;
  categories: {
    eco_friendly_materials: number;
    packaging: number;
    local_sourcing: number;
    carbon_footprint: number;
  };
  recommendations: string[];
  certifications: string[];
}

export function AISustainabilityAdvisor({ products = [], storeProducts = [] }: AISustainabilityAdvisorProps) {
  const { t, language } = useLanguage();
  const [metrics, setMetrics] = useState<SustainabilityMetrics | null>(null);

  const { isStreaming, response, error, startStream } = useAIStream({
    onSuccess: (data) => {
      try {
        const parsed = JSON.parse(data) as SustainabilityMetrics;
        setMetrics(parsed);
      } catch {
        setMetrics(null);
      }
    },
  });

  const analyzedProducts = storeProducts.length > 0 ? storeProducts : products.slice(0, 20);

  const generateMetrics = async () => {
    const prompt = language === "th"
      ? `วิเคราะห์ผลกระทบสิ่งแวดล้อมของสินค้าเหล่านี้และให้คะแนนความยั่งยืนในรูปแบบ JSON:
{
  "score": 0-100,
  "categories": {
    "eco_friendly_materials": 0-100,
    "packaging": 0-100,
    "local_sourcing": 0-100,
    "carbon_footprint": 0-100
  },
  "recommendations": ["ข้อเสนอแนะ 1", "ข้อเสนอแนะ 2"],
  "certifications": ["มาตรฐานที่แนะนำ"]
}

สินค้า: ${analyzedProducts.map((p) => `- ${p.name} (${p.category})`).join("\n")}

เน้นการวิเคราะห์ที่เป็นประโยชน์ทางธุรกิจ สุภาษมืออาชีพ`
      : `Analyze the environmental impact of these products and provide sustainability scores in JSON format:
{
  "score": 0-100,
  "categories": {
    "eco_friendly_materials": 0-100,
    "packaging": 0-100,
    "local_sourcing": 0-100,
    "carbon_footprint": 0-100
  },
  "recommendations": ["actionable recommendation 1", "recommendation 2"],
  "certifications": ["recommended certifications"]
}

Products: ${analyzedProducts.map((p) => `- ${p.name} (${p.category})`).join("\n")}

Focus on actionable business insights. Professional and concise.`;

    await startStream(prompt, { language, productsCount: analyzedProducts.length });
  };

  const scoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-500";
    if (score >= 40) return "text-amber-500";
    return "text-rose-500";
  };

  const scoreBg = (score: number) => {
    if (score >= 70) return "bg-emerald-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-rose-500";
  };

  const metricItems = [
    { id: "eco_friendly_materials", icon: Leaf, label: language === "th" ? "วัสดุเป็นมิตร" : "Eco Materials" },
    { id: "packaging", icon: Recycle, label: language === "th" ? "บรรจุภัณฑ์" : "Packaging" },
    { id: "local_sourcing", icon: Zap, label: language === "th" ? "การจัดซื้อในประเทศ" : "Local Sourcing" },
    { id: "carbon_footprint", icon: Droplets, label: language === "th" ? "ปริมาณคาร์บอน" : "Carbon Footprint" },
  ];

  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {language === "th" ? "ที่ปรึกษาความยั่งยืน" : "Sustainability Advisor"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {language === "th" ? "วิเคราะห์ผลกระทบสิ่งแวดล้อม" : "Environmental impact analysis"}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={generateMetrics}
            disabled={isStreaming || analyzedProducts.length === 0}
          >
            {isStreaming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Leaf className="h-4 w-4 mr-2" />
                {language === "th" ? "วิเคราะห์" : "Analyze"}
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 border-l-4 border-destructive bg-destructive/5">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {metrics && (
        <div className="p-4 space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative h-24 w-24">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-muted opacity-20"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${metrics.score}, 100`}
                  className={scoreColor(metrics.score)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className={cn("text-2xl font-bold", scoreColor(metrics.score))}>
                  {metrics.score}
                </span>
                <span className="text-xs text-muted-foreground">
                  {language === "th" ? "คะแนน" : "Score"}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {metricItems.map((item) => {
                const Icon = item.icon;
                const score = metrics.categories[item.id as keyof typeof metrics.categories];
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">{item.label}</span>
                        <span className={cn("font-bold", scoreColor(score))}>{score}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", scoreBg(score))}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {metrics.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {language === "th" ? "ข้อเสนอแนะ" : "Recommendations"}
              </h4>
              <div className="space-y-2">
                {metrics.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border">
                    <ArrowRight className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {metrics.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {metrics.certifications.map((cert, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                >
                  <Leaf className="h-3 w-3 mr-1.5" />
                  {cert}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
