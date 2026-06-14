import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseUrl() {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  return "https://team-msudeng-msu.basehappy19.site";
}

export function formatDate(date: string | Date, lang: string = "th") {
  const locale = lang === "th" ? "th-TH" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(amount);
}

export function getImgSrc(src: string | null | undefined): string {
  if (!src || src.trim() === "" || src === "undefined") {
    return "https://placehold.co/600x600/f1f5f9/6366f1?text=No+Image";
  }
  return src;
}
