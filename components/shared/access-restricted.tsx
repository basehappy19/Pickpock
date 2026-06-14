"use client";

import { useRole } from "@/hooks/use-role";
import { Role } from "@/types";
import { ShieldAlert, RefreshCw } from "lucide-react";

interface AccessRestrictedProps {
  requiredRole: Role[];
  currentPage: string;
}

export default function AccessRestricted({ requiredRole, currentPage }: AccessRestrictedProps) {
  const { setRole } = useRole();

  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-700">
      <div className="relative">
        <div className="absolute -inset-10 bg-rose-500/20 blur-3xl rounded-full"></div>
        <div className="p-8 rounded-full bg-rose-500/10 border-2 border-rose-500/20 relative z-10">
          <ShieldAlert className="h-20 w-20 text-rose-500" />
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        <h2 className="text-3xl font-semibold tracking-tight uppercase">Access Restricted</h2>
        <p className="text-muted-foreground font-medium max-w-md mx-auto">
          The <span className="text-foreground">"{currentPage}"</span> page is only accessible to 
          <span className="text-primary uppercase ml-1">{requiredRole.join(" or ")}</span>.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm relative z-10">
        <button 
          onClick={() => setRole(requiredRole[0])}
          className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 cursor-pointer"
        >
          <RefreshCw className="h-5 w-5" /> Switch to {requiredRole[0]}
        </button>
      </div>
      
      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest pt-4 opacity-50">
        Hackathon Demo: Switch role above to continue testing
      </p>
    </div>
  );
}
