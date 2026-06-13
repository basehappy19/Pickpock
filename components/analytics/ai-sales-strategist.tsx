"use client";

import { useState } from "react";
import { TrendingUp, Target, Lightbulb, Zap, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useAIStream } from "@/hooks/use-ai-stream";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/shared/button";
import { cn } from "@/lib/utils";
import type { Order, Product } from "@/types";

interface AISalesStrategistProps {
  orders?: Order[];
  products?: Product[];
  timeRange?: "7d" | "30d" | "90d";
}

type InsightCategory = "opportunities" | "risks" | "recommendations" | "forecast";

interface ParsedInsight {
  summary: string;
  categories: {
    opportunities: string[];
    risks: string[];
    recommendations: string[];
    forecast: string;
  };
}

export function AISalesStrategist({ orders = [], products = [], timeRange = "7d" }: AISalesStrategistProps) {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<InsightCategory>("opportunities");
  const [isExpanded, setIsExpanded] = useState(false);
  const [parsedInsights, setParsedInsights] = useState<ParsedInsight | null>(null);

  const { isStreaming, response, error, startStream, stopStream } = useAIStream({
    onSuccess: (data) => {
      try {
        const parsed = JSON.parse(data) as ParsedInsight;
        setParsedInsights(parsed);
      } catch {
        setParsedInsights(null);
      }
    },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const topProducts = products.slice(0, 5);

  const generateInsights = async () => {
    const prompt = language === "th"
      ? `วิเคราะห์ข้อมูลขายของฉันในช่วง ${timeRange} วันที่ผ่านมา และให้คำแนะนำเชิงลึกในรูปแบบ JSON:
{
  "summary": "สรุปภาพรวม 2-3 ประโยค",
  "categories": {
    "opportunities": ["โอกาสทอง 1", "โอกาสทอง 2"],
    "risks": ["ความเสี่ยง 1", "ความเสี่ยง 2"],
    "recommendations": ["คำแนะนำ 1", "คำแนะนำ 2"],
    "forecast": "การคาดการณ์ยอดขายใน 7 วันถัดไป"
  }
}

ข้อมูล:
- ยอดขายรวม: ฿${totalRevenue.toLocaleString()}
- คำสั่งซื้อ: ${orders.length} รายการ
- ค่าเฉลี่ยต่อออเดอร์: ฿${avgOrderValue.toLocaleString()}
- สินค้าขายดี: ${topProducts.map((p) => p.name).join(", ")}

เน้นคำแนะนำที่เป็นประโยชน์ทางธุรกิจจริง ห้ามใช้วลีสากลๆ ที่ดูเป็น AI สุภาษมืออาชีพ`
      : `Analyze my sales data for the past ${timeRange} days and provide deep business insights in JSON format:
{
  "summary": "2-3 sentence executive summary",
  "categories": {
    "opportunities": ["opportunity 1", "opportunity 2"],
    "risks": ["risk 1", "risk 2"],
    "recommendations": ["actionable recommendation 1", "actionable recommendation 2"],
    "forecast": "7-day sales forecast"
  }
}

Data:
- Total Revenue: ฿${totalRevenue.toLocaleString()}
- Orders: ${orders.length} transactions
- Avg Order Value: ฿${avgOrderValue.toLocaleString()}
- Top Products: ${topProducts.map((p) => p.name).join(", ")}

Focus on actionable business insights. Avoid generic AI-sounding language. Professional and concise.`;

    await startStream(prompt, { language, totalRevenue, ordersCount: orders.length });
  };

  const categories = [
    { id: "opportunities", icon: Target, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
    { id: "risks", icon: Zap, color: "text-amber-500", bgColor: "bg-amber-500/10" },
    { id: "recommendations", icon: Lightbulb, color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { id: "forecast", icon: TrendingUp, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  ] as const;

  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Sales Strategist</h3>
              <p className="text-xs text-muted-foreground">Founder-level insights for growth</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={isStreaming ? stopStream : generateInsights}
            disabled={orders.length === 0}
          >
            {isStreaming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Lightbulb className="h-4 w-4 mr-2" />
                Generate Insights
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

      {response && (
        <div className="p-4 space-y-4">
          {parsedInsights?.summary && (
            <div className="p-3 rounded-lg bg-muted/50 border">
              <p className="text-sm leading-relaxed">{parsedInsights.summary}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                    activeCategory === cat.id
                      ? `${cat.bgColor} ${cat.color} border border-current`
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="capitalize">{cat.id}</span>
                </button>
              );
            })}
          </div>

          <div className={cn("space-y-2", !isExpanded && "max-h-40 overflow-hidden")}>
            {parsedInsights?.categories[activeCategory] && (
              <div className="space-y-2">
                {Array.isArray(parsedInsights.categories[activeCategory]) ? (
                  (parsedInsights.categories[activeCategory] as string[]).map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <p>{item}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-relaxed">{parsedInsights.categories[activeCategory] as string}</p>
                )}
              </div>
            )}
          </div>

          {response.length > 500 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  Show More
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
