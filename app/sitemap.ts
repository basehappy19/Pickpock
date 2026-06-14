import { MetadataRoute } from 'next';
import { initialProducts } from '@/lib/initial-data';
import stores from '@/lib/stores.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pickpock.com';

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ];

  // Product pages
  const productPages = initialProducts.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: new Date(product.createdAt || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Store pages
  const storePages = stores.map((store: any) => ({
    url: `${baseUrl}/stores/${store.store_id}`,
    lastModified: new Date(store.joined_at || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...storePages];
}
