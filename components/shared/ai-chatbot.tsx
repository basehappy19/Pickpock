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
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-primary/50 transition-all shadow-sm hover:shadow-md active:scale-[0.98]">
                <div className="flex items-center gap-4 p-3">
                  <div className="h-14 w-14 rounded-lg overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                    <img src={getImgSrc(product.image)} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-slate-900 uppercase truncate mb-0.5">{product.name}</p>
                    <p className="font-black text-primary text-xs">{formatCurrency(product.price)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
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
              return <strong key={i} className="font-bold text-slate-900">{bp.slice(2, -2)}</strong>;
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
        <div className="absolute bottom-20 lg:bottom-24 right-0 w-[90vw] sm:w-[420px] h-[550px] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-6 duration-500">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/10">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">PickPock AI</h3>
                <p className="text-xs text-emerald-600 font-black uppercase tracking-widest flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online Assistant
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-all cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
                <div className={cn(
                  "max-w-[85%] px-5 py-3.5 text-sm font-medium shadow-sm transition-all",
                  msg.role === "user"
                    ? "bg-slate-900 text-white rounded-2xl rounded-tr-none"
                    : "bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-none leading-relaxed"
                )}>
                  {msg.role === "assistant" ? renderMessageContent(msg.content) : msg.content}
                </div>
                <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1.5 mx-1">
                  {msg.role === "assistant" ? "PickPock AI" : "You"}
                </span>
              </div>
            ))}
            {loading && (
              <div className="flex flex-col items-start animate-in fade-in duration-300">
                <div className="bg-white border border-slate-100 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                   <div className="flex gap-1">
                     <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                     <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                     <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                   </div>
                   <span className="text-xs font-black text-slate-400 uppercase tracking-widest">AI กำลังหาข้อมูล...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              placeholder="พิมพ์ข้อความถาม AI..."
              className="flex-1 px-5 py-3 rounded-xl bg-slate-50 border border-transparent focus:bg-white focus:border-primary/30 outline-none text-sm font-medium transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || loading}
              className="p-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-900/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-slate-900 shadow-2xl flex items-center justify-center text-white border-4 border-white hover:scale-110 active:scale-95 transition-all cursor-pointer group relative"
      >
        <div className="absolute -inset-1.5 bg-slate-900/10 rounded-full blur-xl group-hover:bg-slate-900/20 transition-all" />
        {isOpen ? <X className="h-6 w-6 relative z-10" /> : <Sparkles className="h-6 w-6 relative z-10" />}
      </button>
    </div>
  );
}
