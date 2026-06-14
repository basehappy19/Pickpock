import { Metadata } from "next";
import StoreDetailClient from "./store-detail-client";
import initialStores from "@/lib/stores.json";
import { generateBreadcrumbSchema, generateOrganizationSchema } from "@/lib/seo-utils";

interface Props {
  params: Promise<{ id: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  // Handle 'mall' as special case
  const storeId = id === 'mall' ? 'mall' : id;
  const store = initialStores.find((s: any) => s.store_id === storeId || s.store_id === 'mall');

  if (!store) {
    return {
      title: "Store Not Found | PickPock",
    };
  }

  const title = `${store.name} | PickPock`;
  const description = store.description;
  const keywords = [
    store.name,
    "PickPock",
    "e-commerce",
    "Thailand",
    "shopping",
    "online store",
  ];

  return {
    title,
    description,
    keywords: keywords.join(", "),
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
      url: `https://pickpock.com/stores/${store.store_id}`,
      title,
      description,
      siteName: "PickPock",
      type: "website",
      images: [
        {
          url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop",
          width: 1200,
          height: 630,
          alt: store.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop"],
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

// Server Component
export default async function StoreDetailPage({ params }: Props) {
  const { id } = await params;
  const storeId = id === 'mall' ? 'mall' : id;
  const store = initialStores.find((s: any) => s.store_id === storeId || s.store_id === 'mall');

  if (!store) {
    return <StoreDetailClient storeId={id} storeNotFound={true} />;
  }

  // Generate structured data for SEO
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "https://pickpock.com/" },
    { name: "Stores", item: "https://pickpock.com/stores" },
    { name: store.name, item: `https://pickpock.com/stores/${store.store_id}` },
  ]);

  const organizationSchema = generateOrganizationSchema();

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <StoreDetailClient storeId={id} initialStore={store} />
    </>
  );
}
