"use client";

import { useRole } from "@/hooks/use-role";
import { useLanguage } from "@/hooks/use-language";
import { useGlobalData } from "@/hooks/use-global-data";
import { useState, useEffect, useMemo } from "react";
import { 
  Trophy, 
  Target, 
  CheckCircle2, 
  Timer, 
  ArrowRight, 
  Gift, 
  Sparkles, 
  Tag, 
  Zap, 
  Share2, 
  ShoppingBag, 
  UserCheck,
  Loader2
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Coupon } from "@/types";

interface Mission {
  id: string;
  title: string;
  description: string;
  icon: any;
  target: number;
  current: number;
  rewardCode: string;
  color: string;
}

export default function VouchersPage() {
  const { user, updateUserInfo } = useRole();
  const { t } = useLanguage();
  const { coupons: allCoupons, orders } = useGlobalData();
  const router = useRouter();
  
  const [userOwnedCodes, setUserOwnedCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Mock progress state (in real app, this would come from server/db)
  const [progress, setProgress] = useState({
    login: 1, // User is logged in
    share: 0,
    buy: 0
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const res = await fetch(`/api/user-data/${user.id}`);
          if (res.ok) {
            const data = await res.json();
            setUserOwnedCodes(data.coupons || []);
          }
        } catch (e) {
          console.error("Failed to load user coupons", e);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, [user]);

  const missions: Mission[] = [
    {
      id: "m1",
      title: t.vouchers.loginMission,
      description: t.vouchers.loginMissionDesc,
      icon: UserCheck,
      target: 1,
      current: progress.login,
      rewardCode: "WELCOME100",
      color: "from-blue-500 to-indigo-600"
    },
    {
      id: "m2",
      title: t.vouchers.shareMission,
      description: t.vouchers.shareMissionDesc,
      icon: Share2,
      target: 1,
      current: progress.share,
      rewardCode: "FREESHIP",
      color: "from-purple-500 to-pink-600"
    },
    {
      id: "m3",
      title: t.vouchers.buyMission,
      description: t.vouchers.buyMissionDesc,
      icon: ShoppingBag,
      target: 1,
      current: progress.buy,
      rewardCode: "MSU500",
      color: "from-amber-500 to-orange-600"
    }
  ];

  const handleClaim = async (mission: Mission) => {
    if (!user) {
      toast.error(t.vouchers.loginRequired);
      router.push("/login");
      return;
    }

    if (userOwnedCodes.includes(mission.rewardCode)) {
      toast.info(t.vouchers.alreadyClaimed);
      return;
    }

    const coupon = allCoupons.find(c => c.code === mission.rewardCode);
    if (coupon) {
      if (coupon.newMemberOnly) {
        const userOrders = orders.filter((o: any) => o.customerId === user.id);
        if (userOrders.length > 0) {
          toast.error("คูปองนี้สำหรับสมาชิกใหม่ที่ไม่เคยสั่งซื้อเท่านั้น");
          return;
        }
      }
      if (coupon.applicableRoles && coupon.applicableRoles.length > 0) {
        if (!coupon.applicableRoles.includes(user.role as any)) {
          toast.error("คุณไม่เข้าเงื่อนไขสำหรับคูปองนี้ (เฉพาะผู้ใช้งานบางประเภท)");
          return;
        }
      }
    }

    setClaimingId(mission.id);
    try {
      const newCoupons = [...userOwnedCodes, mission.rewardCode];
      const res = await fetch(`/api/user-data/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coupons: newCoupons })
      });

      if (res.ok) {
        setUserOwnedCodes(newCoupons);
        toast.success(`${t.vouchers.claimSuccess1}${mission.rewardCode}${t.vouchers.claimSuccess2}`);
      }
    } catch (e) {
      toast.error(t.vouchers.claimError);
    } finally {
      setClaimingId(null);
    }
  };

  const handleCollectVoucher = async (code: string) => {
    if (!user) {
      toast.error(t.vouchers.loginRequired);
      router.push("/login");
      return;
    }

    if (userOwnedCodes.includes(code)) {
      toast.info(t.vouchers.couponAlreadyCollected);
      return;
    }
    const coupon = allCoupons.find(c => c.code === code);
    if (coupon) {
      if (coupon.newMemberOnly) {
        const userOrders = orders.filter((o: any) => o.customerId === user.id);
        if (userOrders.length > 0) {
          toast.error("คูปองนี้สำหรับสมาชิกใหม่ที่ไม่เคยสั่งซื้อเท่านั้น");
          return;
        }
      }
      if (coupon.applicableRoles && coupon.applicableRoles.length > 0) {
        if (!coupon.applicableRoles.includes(user.role as any)) {
          toast.error("คุณไม่เข้าเงื่อนไขสำหรับคูปองนี้ (เฉพาะผู้ใช้งานบางประเภท)");
          return;
        }
      }
    }

    try {
      const newCoupons = [...userOwnedCodes, code];
      const res = await fetch(`/api/user-data/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coupons: newCoupons })
      });

      if (res.ok) {
        setUserOwnedCodes(newCoupons);
        toast.success(`${t.vouchers.couponCollectSuccess1}${code}${t.vouchers.couponCollectSuccess2}`);
      }
    } catch (e) {
      toast.error(t.vouchers.couponCollectError);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="font-semibold text-xs uppercase tracking-widest text-muted-foreground animate-pulse">{t.vouchers.loadingRewards}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-8 lg:p-16 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 h-96 w-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 h-64 w-64 bg-purple-500/20 rounded-full blur-[100px]" />
        
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
            <Trophy className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">{t.vouchers.collected}: {userOwnedCodes.length}</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-semibold tracking-tighter leading-none">
            {t.vouchers.title.split(" & ")[0]} <br />
            <span className="text-primary text-rainbow-animate">& {t.vouchers.title.split(" & ")[1]}</span>
          </h1>
          <p className="text-lg lg:text-xl text-white/60 font-medium max-w-md">
            {t.vouchers.subtitle}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Missions Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-3">
            <Target className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-semibold tracking-tight uppercase">{t.vouchers.missions}</h2>
          </div>

          <div className="grid gap-6">
            {missions.map((mission) => {
              const isCompleted = mission.current >= mission.target;
              const isClaimed = userOwnedCodes.includes(mission.rewardCode);

              return (
                <div 
                  key={mission.id} 
                  className={cn(
                    "group relative p-8 rounded-[2.5rem] border-2 transition-all overflow-hidden",
                    isClaimed ? "bg-muted/50 border-transparent opacity-70" : "bg-card border-primary/5 hover:border-primary/20 shadow-xl shadow-primary/5"
                  )}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="flex items-start gap-6">
                      <div className={cn("p-4 rounded-3xl shrink-0 bg-gradient-to-br text-white shadow-lg", mission.color)}>
                        <mission.icon className="h-8 w-8" />
                      </div>
                      <div className="space-y-1 pt-1">
                        <h3 className="text-2xl font-semibold tracking-tight">{mission.title}</h3>
                        <p className="text-muted-foreground font-medium">{mission.description}</p>
                        <div className="flex items-center gap-3 mt-4">
                           <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={cn("h-full transition-all duration-1000", isCompleted ? "bg-emerald-500" : "bg-primary")} 
                                style={{ width: `${(mission.current / mission.target) * 100}%` }} 
                              />
                           </div>
                           <span className="text-xs font-semibold uppercase text-muted-foreground">{mission.current}/{mission.target}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {isClaimed ? (
                        <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/10 text-emerald-600 font-semibold uppercase tracking-widest text-xs">
                          <CheckCircle2 className="h-4 w-4" /> {t.vouchers.claimed}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleClaim(mission)}
                          disabled={!isCompleted || claimingId === mission.id}
                          className={cn(
                            "h-14 px-8 rounded-2xl font-semibold text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-2",
                            isCompleted 
                              ? "bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 cursor-pointer" 
                              : "bg-muted text-muted-foreground cursor-not-allowed"
                          )}
                        >
                          {claimingId === mission.id ? <Loader2 className="h-4 w-4 animate-spin" /> : isCompleted ? <Zap className="h-4 w-4" /> : <Timer className="h-4 w-4" />}
                          {isCompleted ? t.vouchers.claim : t.vouchers.inProgress}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Reward Badge */}
                  {!isClaimed && (
                    <div className="mt-6 pt-6 border-t border-dashed flex items-center gap-3">
                       <Gift className="h-4 w-4 text-rose-500" />
                       <span className="text-xs font-semibold text-rose-500 uppercase tracking-widest">{t.vouchers.rewardCouponCode}{mission.rewardCode}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Available Rewards Sidebar */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <h2 className="text-2xl font-semibold tracking-tight uppercase">{t.vouchers.available}</h2>
          </div>

          <div className="space-y-4">
            {allCoupons.map((coupon) => {
              const isOwned = userOwnedCodes.includes(coupon.code);
              
              return (
                <div 
                  key={coupon.code}
                  className={cn(
                    "p-6 rounded-[2rem] border-2 transition-all relative overflow-hidden",
                    isOwned ? "bg-emerald-500/5 border-emerald-500/10" : "bg-card border-primary/5 shadow-lg"
                  )}
                >
                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-primary uppercase tracking-widest leading-none mb-1">{coupon.code}</p>
                        <p className="text-2xl font-semibold tracking-tighter text-foreground leading-none">
                          {coupon.type === 'percent' ? `${coupon.discount}% OFF` : `฿${coupon.discount} OFF`}
                        </p>
                      </div>
                      {isOwned && <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-lg"><CheckCircle2 className="h-4 w-4" /></div>}
                    </div>
                    
                    <p className="text-xs font-medium text-muted-foreground">{coupon.description}</p>
                    
                    {!isOwned && (
                      <button 
                        onClick={() => handleCollectVoucher(coupon.code)}
                        className="w-full py-3 rounded-xl bg-secondary font-semibold text-xs uppercase tracking-widest hover:bg-secondary/80 transition-all cursor-pointer shadow-md active:scale-95"
                      >
                        {t.vouchers.collect}
                      </button>
                    )}
                  </div>
                  
                  {!isOwned && (
                    <div className="absolute -bottom-4 -right-4 opacity-5 rotate-12">
                      <Tag className="h-24 w-24" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="p-8 rounded-[2.5rem] bg-indigo-50 border-2 border-indigo-100 text-center space-y-4">
             <div className="p-4 rounded-full bg-white w-16 h-16 flex items-center justify-center mx-auto shadow-xl shadow-indigo-100">
                <Timer className="h-8 w-8 text-indigo-500 animate-pulse" />
             </div>
             <p className="text-xs font-semibold text-indigo-900 uppercase tracking-widest">{t.vouchers.noMissions}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
