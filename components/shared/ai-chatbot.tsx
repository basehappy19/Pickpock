"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Loader2, Bot, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useGlobalData } from "@/hooks/use-global-data";
import { useRole } from "@/hooks/use-role";
import { cn } from "@/lib/utils";
import { getAIChatResponse } from "@/services/ai/ai-service";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "สวัสดีครับ! ผมคือผู้ช่วย AI ของ Pickpock ต้องการให้แนะนำสินค้าชิ้นไหนเป็นพิเศษไหมครับ? หรือมีคำถามเรื่องอะไรให้ช่วยไหมครับ?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const { products } = useGlobalData();
  const { tier } = useRole();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const response = await getAIChatResponse(
        [...messages, { role: "user", content: userMsg }],
        products,
        { tier }
      );
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "ขออภัยครับ ระบบ AI ขัดข้องชั่วคราว ลองถามอีกครั้งได้ไหมครับ?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[90vw] sm:w-[400px] h-[500px] bg-card border-2 border-primary/20 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-500">
          {/* Header */}
          <div className="p-6 bg-rainbow-gradient border-b flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary text-primary-foreground">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest">Pickpock AI</h3>
                <p className="text-[10px] text-primary/70 font-bold">พร้อมช่วยเหลือคุณครับ</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/10">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[80%] p-4 rounded-3xl text-sm font-medium shadow-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-card border rounded-tl-none"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-card border p-4 rounded-3xl rounded-tl-none">
                  <div className="flex gap-1 items-center">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">AI กำลังคิด...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 bg-card border-t flex gap-2">
            <input
              type="text"
              placeholder="ถาม AI ได้เลย..."
              className="flex-1 px-4 py-3 rounded-2xl bg-muted/50 border-none focus:ring-2 focus:ring-primary outline-none text-sm font-medium"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="p-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/20 cursor-pointer">
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-16 w-16 rounded-full bg-rainbow-gradient animate-rainbow shadow-2xl flex items-center justify-center text-primary border-4 border-background group hover:scale-110 active:scale-95 transition-all cursor-pointer relative"
      >
        <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all" />
        {isOpen ? <X className="h-7 w-7 relative z-10" /> : <Sparkles className="h-7 w-7 relative z-10 fill-current" />}
      </button>
    </div>
  );
}
