"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Search, Menu, Globe, Box, User, ShieldCheck, Home, LayoutDashboard, Package, LogOut, LogIn, Heart, GitCompare, X } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { ThemeToggle } from "./theme-toggle";
import { useCart } from "@/hooks/use-cart";
import { useRole } from "@/hooks/use-role";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCompare } from "@/hooks/use-compare";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { totalCount } = useCart();
  const { role, user, logout } = useRole();
  const { wishlist } = useWishlist();
  const { compareList } = useCompare();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t.nav.home, icon: Home },
    { href: "/products", label: t.nav.products, icon: Package },
    { href: "/history", label: t.nav.history, icon: LayoutDashboard },
    ...(role === "founder" ? [
      { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
      { href: "/orders", label: t.nav.orders, icon: Package },
    ] : []),
  ];

  return (
    <>
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md transition-all font-sans">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter hover:opacity-80 transition-opacity">
              <div className="bg-primary p-1.5 rounded-xl shadow-lg shadow-primary/20">
                <Box className="h-6 w-6 text-primary-foreground" />
              </div>
              <span>
                MSU <span className="text-primary">{role === "customer" ? "MALL" : "FOUNDER"}</span>
              </span>
            </Link>
            
            <div className="hidden lg:flex gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={cn(
                    "text-sm font-bold transition-colors hover:text-primary",
                    pathname === link.href ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <div className="flex items-center gap-2">
                <div className={cn(
                  "hidden xs:flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase border-2",
                  role === "founder" ? "bg-amber-500/10 border-amber-500/20 text-amber-600" : "bg-blue-500/10 border-blue-500/20 text-blue-600"
                )}>
                  {role === "founder" ? <ShieldCheck className="h-3 w-3" /> : <User className="h-3 w-3" />}
                  {user.name.split(" ")[0]}
                </div>
                <button onClick={logout} className="p-2.5 rounded-xl border hover:bg-rose-50 hover:text-rose-500 transition-colors cursor-pointer">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase bg-primary text-primary-foreground hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20">
                <LogIn className="h-4 w-4" />
                {t.nav.login}
              </Link>
            )}

            <div className="flex items-center border-l pl-4 gap-2">
              <button
                onClick={() => setLanguage(language === "th" ? "en" : "th")}
                className="flex items-center gap-2 rounded-xl border border-input px-3 py-2 text-xs font-black hover:bg-accent transition-colors uppercase cursor-pointer"
              >
                <Globe className="h-3.5 w-3.5" />
                {language}
              </button>

              <ThemeToggle />

              <Link href="/wishlist" className="relative hidden sm:flex rounded-xl p-2.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors border cursor-pointer group">
                <Heart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {wishlist.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-sm">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              <Link href="/compare" className="relative hidden md:flex rounded-xl p-2.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors border cursor-pointer group">
                <GitCompare className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {compareList.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white shadow-sm">
                    {compareList.length}
                  </span>
                )}
              </Link>

              <Link href="/cart" className="relative hidden lg:flex rounded-xl p-2.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors border cursor-pointer group">
                <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {totalCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground shadow-sm">
                    {totalCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navbar (Mobile only) */}
      <nav className="lg:hidden fixed bottom-0 left-0 z-50 w-full bg-background/95 backdrop-blur-lg border-t border-border px-4 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-14">
          {navLinks.slice(0, 3).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[56px] transition-all",
                pathname === link.href ? "text-primary scale-110" : "text-muted-foreground"
              )}
            >
              <link.icon className="h-6 w-6" />
              <span className="text-[10px] font-black uppercase tracking-tighter">{link.label}</span>
            </Link>
          ))}
          <Link
            href="/wishlist"
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 min-w-[56px] transition-all",
              pathname === "/wishlist" ? "text-primary scale-110" : "text-muted-foreground"
            )}
          >
            <div className="relative">
              <Heart className="h-6 w-6" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">Wishlist</span>
          </Link>
          <Link
            href="/compare"
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 min-w-[56px] transition-all",
              pathname === "/compare" ? "text-primary scale-110" : "text-muted-foreground"
            )}
          >
            <div className="relative">
              <GitCompare className="h-6 w-6" />
              {compareList.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white shadow-sm">
                  {compareList.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">Compare</span>
          </Link>
          <Link
            href="/cart"
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 min-w-[56px] transition-all",
              pathname === "/cart" ? "text-primary scale-110" : "text-muted-foreground"
            )}
          >
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground shadow-sm">
                  {totalCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">Cart</span>
          </Link>
        </div>
      </nav>

      {/* Spacer for bottom nav on mobile */}
      <div className="lg:hidden h-16" />
    </>
  );
}
