import { Metadata } from "next";
import ProductListContent from "@/components/products/product-list-content";

// Generate metadata for products page
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Products | PickPock - AI-Powered E-commerce Platform",
    description: "Browse our wide selection of premium products. From electronics to fashion, find everything you need at PickPock Mall. AI-powered recommendations for the best shopping experience.",
    keywords: "products, shopping, e-commerce, Thailand, PickPock, electronics, fashion, beauty, toys",
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
      url: "https://pickpock.com/products",
      title: "Products | PickPock - AI-Powered E-commerce Platform",
      description: "Browse our wide selection of premium products. AI-powered recommendations for the best shopping experience.",
      siteName: "PickPock",
      type: "website",
      images: [
        {
          url: "https://pickpock.com/og-image.png",
          width: 1200,
          height: 630,
          alt: "PickPock Products",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Products | PickPock",
      description: "Browse our wide selection of premium products.",
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
    const { getBaseUrl } = await import("@/lib/utils");
    const res = await fetch(`${getBaseUrl()}/api/products`, {
      cache: 'no-store',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }
  return [];
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="container mx-auto p-4 lg:p-8">
      <ProductListContent initialProducts={products} />
    </div>
  );
}
