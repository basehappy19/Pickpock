"use client";

import { useRole } from "@/hooks/use-role";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";
import { User, ShieldCheck, Crown } from "lucide-react";

export default function UserSessionBanner() {
  const { user, role, tier } = useRole();
  const { t, language } = useLanguage();

  if (!user) return null;

  return (
    <div className="w-full flex justify-center py-2 px-4 z-[60]">
      <div className={cn(
        "rounded-full px-4 py-1.5 flex items-center gap-3 text-xs font-medium shadow-md",
        role === "founder" ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white" :
        tier === "VIP" ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white" :
        "bg-muted/90 text-muted-foreground"
      )}>
        <div className="flex items-center gap-2">
          {role === "founder" ? (
            <ShieldCheck className="h-4 w-4" />
          ) : tier === "VIP" ? (
            <Crown className="h-4 w-4" />
          ) : (
            <User className="h-4 w-4" />
          )}
          <span className="font-medium">{user.name}</span>
        </div>

        <div className="h-4 w-[1px] bg-current opacity-30" />

        <div className="flex items-center gap-2">
          <span className="text-xs uppercase opacity-80">
            {role === "customer" 
              ? (language === "th" ? "ลูกค้าทั่วไป" : "Customer")
              : role === "partner"
              ? (language === "th" ? "พาร์ทเนอร์ร้านค้า" : "Partner")
              : role === "founder"
              ? (language === "th" ? "ผู้จัดการ" : "Founder")
              : role}
          </span>
          {tier === "VIP" && (
            <>
              <span className="w-1 h-1 rounded-full bg-current opacity-50" />
              <span className="text-xs font-semibold text-amber-200">VIP</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
