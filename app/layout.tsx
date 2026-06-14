import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/shared/navbar";
import UserSessionBanner from "@/components/shared/user-session-banner";
import HackathonBanner from "@/components/shared/hackathon-banner";
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
import { Toaster } from "sonner";

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

const promptFont = localFont({
  src: [
    { path: "../public/fonts/Prompt-Thin.ttf", weight: "100", style: "normal" },
    { path: "../public/fonts/Prompt-ThinItalic.ttf", weight: "100", style: "italic" },
    { path: "../public/fonts/Prompt-ExtraLight.ttf", weight: "200", style: "normal" },
    { path: "../public/fonts/Prompt-ExtraLightItalic.ttf", weight: "200", style: "italic" },
    { path: "../public/fonts/Prompt-Light.ttf", weight: "300", style: "normal" },
    { path: "../public/fonts/Prompt-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "../public/fonts/Prompt-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/Prompt-Italic.ttf", weight: "400", style: "italic" },
    { path: "../public/fonts/Prompt-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/Prompt-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "../public/fonts/Prompt-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/Prompt-SemiBoldItalic.ttf", weight: "600", style: "italic" },
    { path: "../public/fonts/Prompt-Bold.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/Prompt-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "../public/fonts/Prompt-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../public/fonts/Prompt-ExtraBoldItalic.ttf", weight: "800", style: "italic" },
    { path: "../public/fonts/Prompt-Black.ttf", weight: "900", style: "normal" },
    { path: "../public/fonts/Prompt-BlackItalic.ttf", weight: "900", style: "italic" },
  ],
  variable: "--font-prompt",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("language")?.value || "th";

  const title = lang === "th" ? "PickPock - แพลตฟอร์มอีคอมเมิร์ซที่ขับเคลื่อนด้วย AI" : "PickPock - AI-Powered E-commerce Platform";
  const description = lang === "th" ? "แพลตฟอร์มอีคอมเมิร์ซที่ขับเคลื่อนด้วย AI สุดล้ำ" : "State-of-the-art AI-Powered Shopping Experience";

  return {
    title,
    description,
    keywords: "e-commerce, AI, shopping, Thailand, PickPock",
    authors: [{ name: "PickPock Team" }],
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
        { url: "/favicon.svg", type: "image/svg+xml" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        { url: "/apple-icon.png", sizes: "120x120", type: "image/png" },
      ],
    },
    manifest: "/site.webmanifest",
    openGraph: {
      title,
      description,
      url: "https://pickpock.com",
      siteName: "PickPock",
      images: [
        {
          url: "/banner.png",
          width: 1200,
          height: 630,
          alt: "PickPock Banner",
        },
      ],
      locale: lang === "th" ? "th_TH" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/banner.png"],
    },
  };
}

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
      className={`${geistSans.variable} ${geistMono.variable} ${promptFont.variable} h-full antialiased`}
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
                        <HackathonBanner />
                        <UserSessionBanner />
                        <Navbar />
                        <main className="flex-1">
                          {children}
                        </main>
                        <AIChatbot />
                        <Toaster 
                          position="bottom-right" 
                          richColors 
                          closeButton 
                          toastOptions={{
                            className: "mb-[140px] lg:mb-[90px]"
                          }}
                        />
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
