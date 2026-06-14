import { useState, useEffect } from "react";
import { toast } from "sonner";
import { initialCoupons } from "@/lib/initial-data";

export function useCouponClaim(user: any, orders: any[]) {
  const [claimedCodes, setClaimedCodes] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetch(`/api/user-data/${user.id}`)
        .then(r => r.json())
        .then(data => {
          if (data.coupons) setClaimedCodes(data.coupons);
        });
    } else {
      setClaimedCodes([]);
    }
  }, [user]);

  const handleClaim = async (code: string) => {
    if (claimedCodes.includes(code)) return;
    
    const coupon = initialCoupons.find(c => c.code === code);
    if (!coupon) return;

    if (coupon.newMemberOnly) {
      if (!user) {
        toast.error("กรุณาเข้าสู่ระบบก่อนเก็บคูปองนี้");
        return;
      }
      const userOrders = orders.filter((o: any) => o.customerId === user.id);
      if (userOrders.length > 0) {
        toast.error("คูปองนี้สำหรับสมาชิกใหม่ที่ไม่เคยสั่งซื้อเท่านั้น");
        return;
      }
    }

    if (coupon.applicableRoles && coupon.applicableRoles.length > 0) {
      if (!user || !coupon.applicableRoles.includes(user.role as any)) {
        toast.error("คุณไม่เข้าเงื่อนไขสำหรับคูปองนี้ (เฉพาะผู้ใช้งานบางประเภท)");
        return;
      }
    }

    const newCoupons = [...claimedCodes, code];
    setClaimedCodes(newCoupons);

    if (user) {
      try {
        await fetch(`/api/user-data/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coupons: newCoupons })
        });
      } catch (e) {
        console.error("Failed to save coupon to user data", e);
      }
    }

    toast.success(`คูปอง ${code} ถูกเก็บแล้ว!`);
  };

  return { claimedCodes, handleClaim };
}
