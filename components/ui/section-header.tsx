import Link from "next/link";
import React from "react";

export function SectionHeader({
  title,
  icon: Icon,
  href,
}: {
  title: string;
  icon?: React.ElementType;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="flex items-center gap-2 text-sm font-medium text-foreground">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ดูทั้งหมด
        </Link>
      )}
    </div>
  );
}
