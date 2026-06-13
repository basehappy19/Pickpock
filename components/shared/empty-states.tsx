import { Package, ShoppingCart, Heart, GitCompare, FileX, Search, Gift, ClipboardList, Sparkles, ShoppingBag, Store } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/shared/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  type: "cart" | "wishlist" | "compare" | "search" | "404" | "orders" | "products" | "coupons" | "stores";
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

const iconMap = {
  cart: ShoppingCart,
  wishlist: Heart,
  compare: GitCompare,
  search: Search,
  "404": FileX,
  orders: ClipboardList,
  products: Package,
  coupons: Gift,
  stores: Store,
};

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  const { t } = useLanguage();
  const Icon = iconMap[type] || Package;

  const defaultContent = {
    cart: {
      title: t.cart.empty,
      description: t.cart.emptyDesc,
      actionLabel: t.cart.startShopping,
      actionHref: "/products",
    },
    wishlist: {
      title: t.wishlist.empty,
      description: t.wishlist.emptyDesc,
      actionLabel: t.wishlist.startBrowsing,
      actionHref: "/products",
    },
    compare: {
      title: t.compare.empty,
      description: t.compare.emptyDesc,
      actionLabel: t.cart.startShopping,
      actionHref: "/products",
    },
    search: {
      title: t.common.noResults,
      description: "Try adjusting your search or filters to find what you're looking for",
      actionLabel: t.common.clear,
      actionHref: "/products",
    },
    "404": {
      title: "Page Not Found",
      description: "The page you're looking for doesn't exist or has been moved",
      actionLabel: t.common.back,
      actionHref: "/",
    },
    orders: {
      title: t.history.noHistory,
      description: "Your order history will appear here once you make a purchase",
      actionLabel: "Start Shopping",
      actionHref: "/products",
    },
    products: {
      title: t.dashboard.table.noData,
      description: "No products found. Add your first product to get started",
      actionLabel: t.dashboard.addProduct,
      actionHref: "#",
    },
    coupons: {
      title: "No Coupons Available",
      description: "Check back later for new exclusive deals and offers",
      actionLabel: "Browse Products",
      actionHref: "/products",
    },
    stores: {
      title: "No Stores Found",
      description: "Be the first to open a store on our platform",
      actionLabel: t.partner.submit,
      actionHref: "/partner/register",
    },
  };

  const content = defaultContent[type];

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-4 text-center",
      className
    )}>
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/5 rounded-full scale-150" />
        <div className="relative bg-muted rounded-full p-6 border">
          <Icon className="h-10 w-10 text-muted-foreground" />
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-2">
        {title || content.title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {description || content.description}
      </p>

      {actionHref && (
        <Link href={actionHref}>
          <Button variant="default" size="default">
            {actionLabel || content.actionLabel}
            <Sparkles className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}

interface InlineEmptyProps {
  message: string;
  className?: string;
}

export function InlineEmpty({ message, className }: InlineEmptyProps) {
  return (
    <div className={cn(
      "flex items-center justify-center gap-2 py-8 text-muted-foreground text-sm",
      className
    )}>
      <FileX className="h-4 w-4 opacity-50" />
      <span>{message}</span>
    </div>
  );
}

interface EmptyStateCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyStateCard({ icon: Icon, title, description, action }: EmptyStateCardProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20">
      <div className="bg-muted rounded-full p-4 mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground mb-4 max-w-xs">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm font-medium text-primary hover:underline"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
