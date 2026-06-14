"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Loader2, Bot, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useGlobalData } from "@/hooks/use-global-data";
import { useRole } from "@/hooks/use-role";
import { cn, formatCurrency, getImgSrc } from "@/lib/utils";
import { getAIChatResponse } from "@/services/ai/ai-service";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "สวัสดีครับ! ผมคือผู้ช่วย AI จาก PickPock Mall ยินดีที่ได้พบคุณครับ มีอะไรที่ผมพอจะแนะนำสินค้าหรือช่วยเหลือคุณได้ในวันนี้ไหมครับ?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);
  const { products } = useGlobalData();
  const { role } = useRole();
  const { language } = useLanguage();

  const assistantTitle = language === 'th' ? "ผู้ช่วยออนไลน์" : "Online Assistant";

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const processMessage = async (displayMsg: string, aiMsg?: string) => {
    const currentMsgs = messagesRef.current;
    setMessages((prev) => [...prev, { role: "user", content: displayMsg }]);
    setLoading(true);

    try {
      const response = await getAIChatResponse(
        [...currentMsgs, { role: "user", content: aiMsg || displayMsg }],
        products,
        { tier: role === "founder" ? "FOUNDER" : "MEMBER" }
      );
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "ขออภัยครับ ระบบ AI ขัดข้องชั่วคราว ลองถามอีกครั้งได้ไหมครับ?" }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleOpenChat = (e: any) => {
      setIsOpen(true);
      if (e.detail && e.detail.product) {
        const p = e.detail.product;
        const displayMsg = `สอบถามข้อมูลสินค้า: ${p.name}`;
        const aiMsg = `ฉันต้องการสอบถามข้อมูลเกี่ยวกับสินค้าชื่อ "${p.name}" [PRODUCT:${p.id || p.product_id}]`;
        processMessage(displayMsg, aiMsg);
      }
    };
    window.addEventListener('openChat', handleOpenChat);
    return () => window.removeEventListener('openChat', handleOpenChat);
  }, [products, role]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    await processMessage(userMsg);
  };

  const renderMessageContent = (content: string) => {
    const parts = content.split(/(\[PRODUCT:[\w-]+\])/g);
    const renderedIds = new Set<string>();

    return parts.map((part, idx) => {
      if (part.startsWith('[PRODUCT:') && part.endsWith(']')) {
        const productId = part.slice(9, -1);
        const product = products.find(p => p.id === productId || (p as any).product_id === productId);
        
        if (product) {
          if (renderedIds.has(productId)) return null;
          renderedIds.add(productId);

          return (
            <Link key={idx} href={`/product/${product.id || (product as any).product_id}`} className="block my-4 first:mt-2 last:mb-2 no-underline group">
              <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all shadow-sm hover:shadow-md active:scale-[0.98]">
                <div className="flex items-center gap-4 p-3">
                  <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                    <img src={getImgSrc(product.image)} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs text-foreground uppercase truncate mb-0.5">{product.name}</p>
                    <p className="font-semibold text-primary text-xs">{formatCurrency(product.price)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          );
        }
      }
      
      // Parse **bold** text
      const boldParts = part.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={idx} className="whitespace-pre-line leading-relaxed tracking-tight inline-block">
          {boldParts.map((bp, i) => {
            if (bp.startsWith('**') && bp.endsWith('**')) {
              return <strong key={i} className="font-medium text-foreground">{bp.slice(2, -2)}</strong>;
            }
            return bp;
          })}
        </span>
      );
    });
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-6 z-[100]">
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 z-50 w-full sm:absolute sm:inset-auto sm:bottom-20 sm:lg:bottom-24 sm:right-0 sm:w-[420px] sm:h-[550px] bg-background sm:border border-border sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in sm:slide-in-from-bottom-6 zoom-in-95 sm:zoom-in-100 duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-border flex justify-between items-center bg-muted/50 shrink-0 mt-[env(safe-area-inset-top)]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-foreground text-background flex items-center justify-center shadow-lg shadow-black/10 overflow-hidden">
                <img src="/brand/mascot.jpeg" className="h-full w-full object-cover" alt="AI Mascot" />
              </div>
              <div>
                <h3 className="font-medium text-sm text-foreground uppercase tracking-wider">PickPock AI</h3>
                <p className="text-xs text-emerald-500 font-semibold uppercase tracking-widest flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> {assistantTitle}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-all cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/10">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
                <div className={cn(
                  "max-w-[85%] px-5 py-3.5 text-sm font-medium shadow-sm transition-all",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-none"
                    : "bg-card border border-border text-card-foreground rounded-2xl rounded-tl-none leading-relaxed"
                )}>
                  {msg.role === "assistant" ? renderMessageContent(msg.content) : msg.content}
                </div>
                <span className="text-[8px] font-medium text-muted-foreground uppercase tracking-widest mt-1.5 mx-1">
                  {msg.role === "assistant" ? "PickPock AI" : "You"}
                </span>
              </div>
            ))}
            {loading && (
              <div className="flex flex-col items-start animate-in fade-in duration-300">
                <div className="bg-card border border-border px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                   <div className="flex gap-1">
                     <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                     <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                     <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                   </div>
                   <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">AI กำลังหาข้อมูล...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 sm:p-4 bg-background border-t border-border flex gap-2 shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <input
              type="text"
              placeholder={language === 'th' ? "พิมพ์ข้อความถาม AI..." : "Ask AI..."}
              className="flex-1 px-4 sm:px-5 py-3 rounded-xl bg-muted/50 border border-transparent focus:bg-background focus:border-primary/30 outline-none text-base font-medium transition-all text-foreground placeholder:text-muted-foreground"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || loading}
              className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center justify-center"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full shadow-2xl flex items-center justify-center text-primary-foreground hover:scale-110 active:scale-95 transition-all cursor-pointer group relative z-10",
          isOpen ? "hidden sm:flex bg-foreground border-2 border-background" : "flex bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 border-2 border-white/50"
        )}
      >
        {!isOpen && (
          <>
            {/* Animated Glow Behind */}
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full blur-xl opacity-60 group-hover:opacity-100 animate-pulse transition-opacity duration-500 -z-10" />
            {/* Inner Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full" />
          </>
        )}
        {isOpen ? (
          <X className="h-6 w-6 relative z-10" />
        ) : (
          <div className="h-[90%] w-[90%] rounded-full overflow-hidden relative z-10 border-2 border-white/50 bg-white shadow-sm group-hover:scale-105 transition-transform">
            <img src="/brand/mascot.jpeg" className="h-full w-full object-cover rounded-full" alt="AI Chat" />
          </div>
        )}
      </button>
    </div>
  );
}
