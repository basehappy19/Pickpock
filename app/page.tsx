import { dataService } from "@/services/data-service";
import HomepageClient from "./homepage-client";

export default async function Homepage() {
  const products = await dataService.getProducts();

  return <HomepageClient products={products} />;
}
