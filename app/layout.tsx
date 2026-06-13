import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/navbar";
import UserSessionBanner from "@/components/shared/user-session-banner";
import { LanguageProvider } from "@/hooks/use-language";
import { cookies } from "next/headers";
import { Language } from "@/lib/translations";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { CartProvider } from "@/hooks/use-cart";
import { RoleProvider } from "@/hooks/use-role";
import { DataProvider } from "@/hooks/use-global-data";
import { WishlistProvider } from "@/hooks/use-wishlist";
import { CompareProvider } from "@/hooks/use-compare";
import { RecentlyViewedProvider } from "@/hooks/use-recently-viewed";
import AIChatbot from "@/components/shared/ai-chatbot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider initialLanguage={lang}>
            <RoleProvider>
              <DataProvider>
                <CartProvider>
                  <WishlistProvider>
                    <CompareProvider>
                      <RecentlyViewedProvider>
                        <UserSessionBanner />
                        <Navbar />
                        <main className="flex-1">
                          {children}
                        </main>
                        <AIChatbot />
                      </RecentlyViewedProvider>
                    </CompareProvider>
                  </WishlistProvider>
                </CartProvider>
              </DataProvider>
            </RoleProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
