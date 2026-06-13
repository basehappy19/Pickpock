"use client";

import Link from "next/link";
import { AnchorHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface AccessibleLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  external?: boolean;
  variant?: "default" | "button" | "nav" | "breadcrumb";
}

const linkVariants = {
  default: "text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded",
  button: "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  nav: "text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded-md px-3 py-2",
  breadcrumb: "text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded",
};

export const AccessibleLink = forwardRef<HTMLAnchorElement, AccessibleLinkProps>(
  ({ href, external = false, variant = "default", className, children, ...props }, ref) => {
    const baseClass = linkVariants[variant];

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(baseClass, className)}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        {...props}
      >
        {children}
        {external && (
          <span className="sr-only">(opens in new tab)</span>
        )}
      </Link>
    );
  }
);

AccessibleLink.displayName = "AccessibleLink";
