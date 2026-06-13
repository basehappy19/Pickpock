"use client";

import DashboardContent from "@/components/dashboard/dashboard-content";
import { useGlobalData } from "@/hooks/use-global-data";
import { useRole } from "@/hooks/use-role";
import AccessRestricted from "@/components/shared/access-restricted";

export default function DashboardPage() {
  const { products } = useGlobalData();
  const { role } = useRole();

  if (role === "customer") {
    return <AccessRestricted requiredRole={["founder"]} currentPage="Dashboard" />;
  }

  return <DashboardContent initialProducts={products} />;
}
