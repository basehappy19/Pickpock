import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("th-TH", {
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
