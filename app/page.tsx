import { Metadata } from "next";
import HomepageClient from "./homepage-client";



// Server Component - fetches data on server for instant load
async function getProducts() {
  try {
    const { getBaseUrl } = await import("@/lib/utils");
    const res = await fetch(`${getBaseUrl()}/api/products`, {
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
