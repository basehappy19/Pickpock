interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  locale?: string;
  siteName?: string;
}

const defaultSiteName = "PickPock - AI-Powered E-commerce Platform";
const defaultDescription = "แพลตฟอร์มอีคอมเมิร์ซที่ขับเคลื่อนด้วย AI | AI-Powered Shopping Experience";

export function generateMetadata(props: SEOProps = {}) {
  const {
    title,
    description = defaultDescription,
    keywords = [],
    image,
    url,
    type = "website",
    locale = "th_TH",
    siteName = defaultSiteName,
  } = props;

  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const siteUrl = url || process.env.NEXT_PUBLIC_SITE_URL || "https://pickpock.com";
  const imageUrl = image || `${siteUrl}/og-image.png`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(", "),
    openGraph: {
      type,
      locale,
      url: siteUrl,
      title: fullTitle,
      description,
      siteName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
    },
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
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
}

export function generateProductSchema(product: {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  availability?: "InStock" | "OutOfStock";
}) {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "@id": product.id,
    name: product.name,
    description: product.description,
    image: product.image,
    category: product.category,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "THB",
      availability: `https://schema.org/${product.availability || "InStock"}`,
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

export function generateOrganizationSchema() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pickpock.com";
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PickPock",
    url: siteUrl,
    logo: `${siteUrl}/brand/logo_full.png`,
    description: defaultDescription,
    sameAs: [
      "https://facebook.com/pickpock",
      "https://twitter.com/pickpock",
      "https://instagram.com/pickpock",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+66-XXX-XXX-XXXX",
      contactType: "Customer Service",
      availableLanguage: ["Thai", "English"],
    },
  };
}
