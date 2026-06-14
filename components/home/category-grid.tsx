import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";

export const CATEGORIES = [
  { name: "Electronics",      icon: "💻", href: "/products?category=Electronics" },
  { name: "Fashion",          icon: "👗", href: "/products?category=Fashion" },
  { name: "Home & Living",    icon: "🏠", href: "/products?category=Home+%26+Living" },
  { name: "Furniture",        icon: "🛋️", href: "/products?category=Furniture" },
  { name: "Beauty",           icon: "💄", href: "/products?category=Beauty" },
  { name: "Sports",           icon: "⚽", href: "/products?category=Sports" },
  { name: "Toys",             icon: "🧸", href: "/products?category=Toys" },
  { name: "Food",             icon: "🍜", href: "/products?category=Food" },
  { name: "Books",            icon: "📚", href: "/products?category=Books" },
  { name: "Baby & Kids",      icon: "👶", href: "/products?category=Baby+%26+Kids" },
  { name: "Health",           icon: "💊", href: "/products?category=Health" },
  { name: "Music",            icon: "🎵", href: "/products?category=Music" },
  { name: "Art",              icon: "🎨", href: "/products?category=Art" },
  { name: "Home & Garden",     icon: "🌻", href: "/products?category=Home+%26+Garden" },
  { name: "Stationery",       icon: "✏️", href: "/products?category=Stationery" },
  { name: "Gaming & Tech",    icon: "🎮", href: "/products?category=Gaming+%26+Tech" },
  { name: "Student Lifestyle", icon: "🎓", href: "/products?category=Student+Lifestyle" },
  { name: "Jewelry",          icon: "💎", href: "/products?category=Jewelry" },
  { name: "Pets",             icon: "🐕", href: "/products?category=Pets" },
  { name: "Automotive",       icon: "🚗", href: "/products?category=Automotive" },
  { name: "Travel",           icon: "✈️", href: "/products?category=Travel" },
  { name: "Kitchen",          icon: "🍳", href: "/products?category=Kitchen" },
  { name: "Office",           icon: "💼", href: "/products?category=Office" },
];

export function CategoryGrid() {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-8 xl:grid-cols-12 gap-2">
      {CATEGORIES.map((cat, i) => (
        <Link
          key={`cat-${cat.name}-${i}`}
          href={cat.href}
          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
          aria-label={`Category ${cat.name}`}
        >
          <span className="text-2xl" aria-hidden="true">{cat.icon}</span>
          <span className="text-[11px] text-muted-foreground text-center leading-tight">
            {(t.categories as Record<string, string>)[cat.name] || cat.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
