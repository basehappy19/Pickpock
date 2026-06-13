import { Suspense } from "react";
import { HomepageSkeleton, ProductGridSkeleton, CartSkeleton, OrderListSkeleton, DashboardStatsSkeleton, ProductDetailSkeleton } from "./skeleton";

interface SuspenseBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  type?: "default" | "product-grid" | "cart" | "orders" | "dashboard" | "product-detail" | "homepage";
}

const fallbackMap = {
  default: <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>,
  "product-grid": <ProductGridSkeleton />,
  cart: <CartSkeleton />,
  orders: <OrderListSkeleton />,
  dashboard: <DashboardStatsSkeleton />,
  "product-detail": <ProductDetailSkeleton />,
  homepage: <HomepageSkeleton />,
};

export function SuspenseBoundary({ children, fallback, type }: SuspenseBoundaryProps) {
  return (
    <Suspense fallback={fallback || fallbackMap[type || "default"]}>
      {children}
    </Suspense>
  );
}

export default SuspenseBoundary;
