import { dataService } from "@/services/data-service";
import { notFound } from "next/navigation";
import ProductInfo from "@/components/products/product-info";

export default async function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const product = await dataService.getProductById(id);
  const allProducts = await dataService.getProducts();

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4 lg:p-8">
      <ProductInfo product={product} allProducts={allProducts} />
    </div>
  );
}
