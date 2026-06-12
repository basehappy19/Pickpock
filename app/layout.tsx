import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/navbar";
import { LanguageProvider } from "@/hooks/use-language";
import { cookies } from "next/headers";
import { Language } from "@/lib/translations";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Best for Lighthouse
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MSU SHOP AI - Hackathon 2026",
  description: "AI-Powered E-commerce Management System",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("language")?.value as Language) || "th";

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50/50">
        <LanguageProvider initialLanguage={lang}>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
