import NextImage from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";

export function ProductCard({
  product,
  badge,
  priority,
}: {
  product: Product;
  badge?: string;
  priority?: boolean;
}) {
  const imgSrc = product.image?.trim() || "https://placehold.co/600x600?text=No+Image";

  return (
    <Link
      href={`/product/${product.id}`}
      className="group bg-card border rounded-xl overflow-hidden flex flex-col hover:border-border/60 transition-colors"
    >
      <div className="aspect-square relative bg-muted overflow-hidden">
        <NextImage
          src={imgSrc}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, 25vw"
          priority={priority}
        />
        {badge && (
          <span className="absolute top-2 left-2 bg-background/90 backdrop-blur border text-xs text-muted-foreground px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-muted-foreground leading-snug line-clamp-2 mb-2 h-8">
          {product.name}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{formatCurrency(product.price)}</span>
          {product.rating && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {Number(product.rating).toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
