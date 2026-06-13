import ProductListContent from "@/components/products/product-list-content";

// Server Component - fetches data on server for instant load
async function getProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/products`, {
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
