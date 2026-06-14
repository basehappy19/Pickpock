"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingCart, Search, Menu, Globe, Box, User, ShieldCheck, Home, LayoutDashboard, Package, LogOut, LogIn, Heart, GitCompare, X, ShoppingBag, Gift } from "lucide-react";
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
    ...(role !== "founder" && role !== "partner" ? [{ href: "/history", label: t.nav.history, icon: LayoutDashboard }] : []),
    ...(role === "founder" || role === "partner" ? [
      { 
        href: "/dashboard", 
        label: role === "founder" ? t.nav.platformManagement : t.nav.storeManagement, 
        icon: LayoutDashboard 
      },
      { href: "/orders", label: t.nav.orders, icon: Package },
    ] : user ? [
      { href: "/partner/register", label: t.nav.becomePartner, icon: ShoppingBag },
    ] : []),
  ];

  return (
    <>
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md transition-all font-sans">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-xl font-medium tracking-tighter hover:opacity-80 transition-opacity">
              <Image
                src="/brand/logo_full.png"
                alt="PickPock Logo"
                width={140}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>
            
            <div className="hidden lg:flex gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
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
                <Link href="/profile" className={cn(
                  "hidden xs:flex flex-col items-start gap-0.5 rounded-xl px-4 py-2 border-2 transition-all hover:scale-105 active:scale-95",
                  user.tier === "VIP" 
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-600 hover:bg-amber-500/20" 
                    : "bg-blue-500/10 border-blue-500/20 text-blue-600 hover:bg-blue-500/20"
                )}>
                  <div className="flex items-center gap-2">
                    {role === "founder" ? <ShieldCheck className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    <span className="text-xs font-semibold uppercase tracking-tighter">{user.name.split(" ")[0]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-semibold uppercase opacity-70 tracking-widest">{role}</span>
                    <span className={cn(
                      "text-[8px] font-semibold px-1.5 rounded-full",
                      user.tier === "VIP" ? "bg-amber-500 text-white" : "bg-blue-500 text-white"
                    )}>{user.tier}</span>
                  </div>
                </Link>
                <Link 
                  href="/profile" 
                  className="hidden md:flex p-2.5 rounded-xl border hover:bg-muted transition-colors cursor-pointer group"
                  title="Profile"
                >
                  <User className="h-4 w-4 group-hover:text-primary" />
                </Link>
                <button onClick={logout} className="p-2.5 rounded-xl border hover:bg-rose-50 hover:text-rose-500 transition-colors cursor-pointer">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold uppercase bg-primary text-primary-foreground hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20">
                <LogIn className="h-4 w-4" />
                {t.nav.login}
              </Link>
            )}

            <div className="flex items-center border-l pl-4 gap-2">
              <button
                onClick={() => setLanguage(language === "th" ? "en" : "th")}
                className="flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold hover:bg-accent transition-colors uppercase cursor-pointer shadow-sm"
              >
                <Globe className="h-3.5 w-3.5" />
                {language}
              </button>

              <ThemeToggle />

              <Link href="/wishlist" className="relative hidden sm:flex rounded-xl p-2.5 bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors border shadow-sm cursor-pointer group">
                <Heart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {wishlist.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-xs font-semibold text-white shadow-sm">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              <Link href="/compare" className="relative hidden md:flex rounded-xl p-2.5 bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors border shadow-sm cursor-pointer group">
                <GitCompare className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {compareList.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white shadow-sm">
                    {compareList.length}
                  </span>
                )}
              </Link>

              <Link href="/cart" className="relative hidden lg:flex rounded-xl p-2.5 bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors border shadow-sm cursor-pointer group">
                <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {totalCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-sm">
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
        <div className="flex justify-between items-center h-14 px-2 pb-1 relative">
          
          <Link
            href="/products"
            className={cn(
              "flex flex-col items-center justify-end h-full gap-1 flex-1 transition-all",
              pathname === "/products" ? "text-primary scale-105" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Package className="h-5 w-5" />
            <span className="text-[9px] font-semibold uppercase tracking-tighter">{t.nav.products}</span>
          </Link>

          <Link
            href="/wishlist"
            className={cn(
              "relative flex flex-col items-center justify-end h-full gap-1 flex-1 transition-all",
              pathname === "/wishlist" ? "text-primary scale-105" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="relative">
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm ring-1 ring-background">
                  {wishlist.length}
                </span>
              )}
            </div>
            <span className="text-[9px] font-semibold uppercase tracking-tighter">{t.nav.wishlist}</span>
          </Link>

          {/* HOME BUTTON (CENTER, PROMINENT) */}
          <Link
            href="/"
            className="group relative flex flex-col items-center justify-center flex-1 z-10 -mt-6"
          >
            <div className={cn(
              "flex items-center justify-center h-14 w-14 rounded-full shadow-lg transition-all duration-300 group-hover:scale-105 group-active:scale-95 ring-4 ring-background",
              pathname === "/" 
                ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-primary/40" 
                : "bg-background border shadow-md text-foreground hover:border-primary"
            )}>
              <Home className={cn("h-6 w-6", pathname === "/" ? "animate-pulse" : "")} />
            </div>
            <span className={cn(
              "text-[9px] font-bold uppercase tracking-tighter mt-1 transition-colors",
              pathname === "/" ? "text-primary" : "text-muted-foreground"
            )}>{t.nav.home}</span>
          </Link>

          <Link
            href="/cart"
            className={cn(
              "relative flex flex-col items-center justify-end h-full gap-1 flex-1 transition-all",
              pathname === "/cart" ? "text-primary scale-105" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-sm ring-1 ring-background">
                  {totalCount}
                </span>
              )}
            </div>
            <span className="text-[9px] font-semibold uppercase tracking-tighter">{t.nav.cart}</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className={cn(
              "flex flex-col items-center justify-end h-full gap-1 flex-1 transition-all",
              mobileMenuOpen ? "text-primary scale-105" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Menu className="h-5 w-5" />
            <span className="text-[9px] font-semibold uppercase tracking-tighter truncate max-w-[60px] text-center w-full">{language === 'th' ? 'เมนู' : 'Menu'}</span>
          </button>
        </div>
      </nav>

      {/* Spacer for bottom nav on mobile */}
      <div className="lg:hidden h-16" />

      {/* Full-Screen Mobile Menu Modal */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] w-full h-[100dvh] bg-background flex flex-col animate-in fade-in duration-200 lg:hidden overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b bg-card">
            <h2 className="text-lg font-bold tracking-tight">{language === 'th' ? 'เมนู' : 'Menu'}</h2>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-accent transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4 bg-slate-50 dark:bg-slate-900/50">
            {user && (
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-base text-foreground">{user.name}</p>
                  <p className="text-xs font-semibold text-primary uppercase tracking-widest">
                    {language === 'th' 
                      ? (role === 'founder' ? 'ผู้ก่อตั้ง' : role === 'partner' ? 'พาร์ทเนอร์' : role) 
                      : role} 
                    {' '}•{' '} 
                    {language === 'th' && user.tier === 'MEMBER' ? 'สมาชิก' : user.tier}
                  </p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex flex-col items-center justify-center p-5 rounded-2xl border bg-card text-card-foreground shadow-sm hover:border-primary/50 hover:bg-accent/50 transition-all",
                      pathname === link.href ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20" : ""
                    )}
                  >
                    <Icon className={cn("h-7 w-7 mb-2 opacity-80", pathname === link.href ? "text-primary opacity-100" : "")} />
                    <span className="font-bold text-xs text-center uppercase tracking-tighter">{link.label}</span>
                  </Link>
                );
              })}
              
              <Link
                href="/compare"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center justify-center p-5 rounded-2xl border bg-card text-card-foreground shadow-sm hover:border-primary/50 hover:bg-accent/50 transition-all"
              >
                <div className="relative">
                  <GitCompare className="h-7 w-7 mb-2 opacity-80" />
                  {compareList.length > 0 && (
                    <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
                      {compareList.length}
                    </span>
                  )}
                </div>
                <span className="font-bold text-xs text-center uppercase tracking-tighter">{language === 'th' ? 'เปรียบเทียบ' : 'Compare'}</span>
              </Link>
            </div>
            
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-colors mt-6 active:scale-95"
              >
                <LogOut className="h-5 w-5" />
                {language === 'th' ? 'ออกจากระบบ' : 'Logout'}
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity mt-6 shadow-md active:scale-95"
              >
                <LogIn className="h-5 w-5" />
                {t.nav.login}
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
