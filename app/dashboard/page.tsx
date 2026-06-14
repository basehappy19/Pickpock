"use client";

import { useRole } from "@/hooks/use-role";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { role, user } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (role === "founder") {
      router.push("/founder/dashboard");
    } else {
      router.push("/partner/dashboard");
    }
  }, [role, user, router]);

  return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-12 w-12 text-primary animate-spin" />
      <p className="font-semibold text-xs uppercase tracking-widest text-muted-foreground animate-pulse">Redirecting to your dashboard...</p>
    </div>
  );
}
