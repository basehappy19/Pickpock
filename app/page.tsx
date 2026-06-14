import { Metadata } from "next";
import HomepageClient from "./homepage-client";

// Generate metadata for homepage
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "PickPock - AI-Powered E-commerce Platform | แพลตฟอร์มอีคอมเมิร์ซที่ขับเคลื่อนด้วย AI",
    description: "PickPock is a cutting-edge e-commerce platform that combines artificial intelligence with seamless shopping experiences. Built for the Thai market with full bilingual support (TH/EN), PickPock offers intelligent product recommendations, smart search, and real-time inventory management.",
    keywords: "e-commerce, AI, shopping, Thailand, PickPock, artificial intelligence, online shopping, product recommendations, Thai marketplace, bilingual shopping",
    authors: [{ name: "PickPock Team" }],
    creator: "PickPock",
    publisher: "PickPock",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      url: "https://pickpock.com",
      title: "PickPock - AI-Powered E-commerce Platform",
      description: "Discover the future of online shopping with AI-powered recommendations, smart search, and seamless experiences.",
      siteName: "PickPock",
      type: "website",
      locale: "th_TH",
      images: [
        {
          url: "https://pickpock.com/og-image.png",
          width: 1200,
          height: 630,
          alt: "PickPock - AI-Powered E-commerce Platform",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "PickPock - AI-Powered E-commerce Platform",
      description: "Discover the future of online shopping with AI-powered recommendations.",
      images: ["https://pickpock.com/og-image.png"],
    },
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
  };
}

// Server Component - fetches data on server for instant load
async function getProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/products`, {
      cache: 'no-store', // Always fresh data
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }
  return [];
}

export default async function Homepage() {
  // Fetch data on server for instant page load
  const products = await getProducts();

  return <HomepageClient initialProducts={products} />;
}
