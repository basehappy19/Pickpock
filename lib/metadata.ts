/**
 * Metadata utilities for SEO optimization
 */

import { Metadata } from 'next';

interface PageMetadataProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  keywords?: string[];
}

export function generatePageMetadata({
  title = 'Pickpock - AI-Powered E-commerce Platform',
  description = 'แพลตฟอร์มอีคอมเมิร์ซที่ขับเคลื่อนด้วย AI ช้อปปิ้งสินค้าคุณภาพดี พร้อมบริการแนะนำสินค้าด้วย AI | AI-powered shopping platform for quality products',
  path = '',
  image = '/opengraph-image.png',
  keywords = ['e-commerce', 'AI', 'shopping', 'Thailand', 'Pickpock', 'อีคอมเมิร์ซ', 'ช้อปปิ้งออนไลน์']
}: PageMetadataProps): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pickpock.com';
  const url = `${siteUrl}${path}`;

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'Pickpock Team' }],
    creator: 'Pickpock',
    publisher: 'Pickpock',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      url,
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: 'Pickpock',
      locale: 'th_TH',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
  };
}

export const DEFAULT_METADATA = generatePageMetadata({});
