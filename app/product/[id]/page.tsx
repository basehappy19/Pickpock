import { notFound, useParams } from "next/navigation";
import { Metadata } from "next";
import ProductInfoClient from "./product-info-client";
import { generateProductSchema, generateBreadcrumbSchema, generateOrganizationSchema } from "@/lib/seo-utils";
import { products as initialProducts } from "@/lib/initial-data";

interface Props {
  params: { id: string };
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = initialProducts.find(p => p.id === params.id);

  if (!product) {
    return {
      title: "Product Not Found | PickPock",
    };
  }

  const title = `${product.name} | PickPock Mall`;
  const description = product.fullDescription || product.description;
  const keywords = [
    product.name,
    product.category,
    "PickPock",
    "e-commerce",
    "Thailand",
    "shopping",
    "online",
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
      url: `https://pickpock.com/product/${product.id}`,
      title,
      description,
      siteName: "PickPock",
      type: "website",
      images: [
        {
          url: product.image,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.image],
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
export default function ProductDetailPage({ params }: Props) {
  const product = initialProducts.find(p => p.id === params.id);

  if (!product) {
    notFound();
  }

  // Generate structured data for SEO
  const productSchema = generateProductSchema({
    id: product.id,
    name: product.name,
    description: product.fullDescription || product.description,
    image: product.image,
    price: product.price,
    category: product.category,
    availability: product.stock > 0 ? "InStock" : "OutOfStock",
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: "https://pickpock.com/" },
    { name: "Products", item: "https://pickpock.com/products" },
    { name: product.name, item: `https://pickpock.com/product/${product.id}` },
  ]);

  const organizationSchema = generateOrganizationSchema();

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <ProductInfoClient productId={params.id} />
    </>
  );
}
