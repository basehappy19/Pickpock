"use client";

import { useRole } from "@/hooks/use-role";
import { cn } from "@/lib/utils";
import { User, ShieldCheck, ShoppingBag, Fingerprint } from "lucide-react";

export default function UserSessionBanner() {
  const { user, role } = useRole();

  if (!user) return null;

  return (
    <div className={cn(
      "w-full py-1.5 px-4 flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] z-[60] shadow-sm",
      role === "founder" ? "bg-amber-500 text-white" : 
      user.tier === "VIP" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
    )}>
      <div className="flex items-center gap-2">
        <Fingerprint className="h-3 w-3" />
        <span>Session ID: {user.id}</span>
      </div>
      <div className="h-3 w-[1px] bg-current opacity-20" />
      <div className="flex items-center gap-2">
        {role === "founder" ? <ShieldCheck className="h-3 w-3" /> : <User className="h-3 w-3" />}
        <span>Logged in as: <span className="underline decoration-2 underline-offset-4">{user.name}</span></span>
      </div>
      <div className="h-3 w-[1px] bg-current opacity-20 hidden sm:block" />
      <div className="hidden sm:flex items-center gap-2">
        <span className="opacity-70">Role:</span>
        <span className="bg-white/20 px-1.5 rounded">{role}</span>
        <span className="opacity-70 ml-2">Membership:</span>
        <span className="bg-white/20 px-1.5 rounded">{user.tier}</span>
      </div>
      <div className="h-3 w-[1px] bg-current opacity-20 hidden md:block" />
      <div className="hidden md:flex items-center gap-2">
        <span className="opacity-70 italic">{user.email}</span>
      </div>
    </div>
  );
}
