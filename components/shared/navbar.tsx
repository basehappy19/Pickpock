"use client";

import Link from "next/link";
import { ShoppingCart, LayoutDashboard, Search, Menu, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold tracking-tighter text-blue-600">
            MSU SHOP <span className="text-gray-400">AI</span>
          </Link>
          <div className="hidden md:flex gap-4">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-blue-600">
              {t.nav.dashboard}
            </Link>
            <Link href="/products" className="text-sm font-medium transition-colors hover:text-blue-600">
              {t.nav.products}
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="search"
              placeholder={t.nav.search}
              className="h-9 w-64 rounded-md border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button 
            onClick={() => setLanguage(language === "th" ? "en" : "th")}
            className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span className="uppercase">{language}</span>
          </button>

          <button className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100">
            <ShoppingCart className="h-5 w-5" />
          </button>
          <button className="md:hidden rounded-full p-2 text-gray-600 hover:bg-gray-100">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
