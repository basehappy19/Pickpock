import { dataService } from "@/services/data-service";
import ProductListContent from "@/components/products/product-list-content";

export default async function ProductsPage() {
  const products = await dataService.getProducts();

  return (
    <div className="container mx-auto p-4 lg:p-8">
      <ProductListContent initialProducts={products} />
    </div>
  );
}
