"use client";

import Link from "next/link";
import { ShoppingCart, Search, Menu, Globe, Box, User, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { ThemeToggle } from "./theme-toggle";
import { useCart } from "@/hooks/use-cart";
import { useRole } from "@/hooks/use-role";

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { totalCount } = useCart();
  const { role, setRole } = useRole();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md transition-all">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter hover:opacity-80 transition-opacity">
            <div className="bg-primary p-1 rounded-lg shadow-lg shadow-primary/20">
              <Box className="h-6 w-6 text-primary-foreground" />
            </div>
            <span>
              MSU <span className="text-primary">FOUNDER</span>
            </span>
          </Link>
          
          <div className="hidden lg:flex gap-6">
            <Link href="/" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
              {t.nav.dashboard}
            </Link>
            <Link href="/orders" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
              {t.nav.orders}
            </Link>
            <Link href="/products" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
              {t.nav.products}
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Role Switcher (Hackathon Demo Only) */}
          <button 
            onClick={() => setRole(role === "customer" ? "founder" : "customer")}
            className={`hidden sm:flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black uppercase transition-all border-2 cursor-pointer ${
              role === "founder" 
                ? "bg-amber-500/10 border-amber-500/20 text-amber-600" 
                : "bg-blue-500/10 border-blue-500/20 text-blue-600"
            }`}
          >
            {role === "founder" ? <ShieldCheck className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
            {role} mode
          </button>

          <div className="relative hidden md:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="search"
              placeholder={t.nav.search}
              className="h-10 w-48 lg:w-64 rounded-full border border-input bg-muted/50 pl-10 pr-4 text-sm focus:bg-background focus:ring-2 focus:ring-primary focus:outline-none transition-all font-medium"
            />
          </div>

          <div className="flex items-center border-l pl-4 gap-2 sm:gap-3">
            <button 
              onClick={() => setLanguage(language === "th" ? "en" : "th")}
              className="flex items-center gap-2 rounded-full border border-input px-3 py-1.5 text-xs font-black hover:bg-accent transition-colors uppercase cursor-pointer"
            >
              <Globe className="h-3.5 w-3.5" />
              {language}
            </button>

            <ThemeToggle />

            <Link href="/cart" className="relative rounded-full p-2.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors border cursor-pointer group">
              <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
              {totalCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground shadow-sm animate-in zoom-in duration-300">
                  {totalCount}
                </span>
              )}
            </Link>

            <button className="lg:hidden rounded-full p-2.5 text-muted-foreground hover:bg-accent transition-colors border cursor-pointer">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
