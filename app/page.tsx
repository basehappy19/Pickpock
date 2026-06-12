import { dataService } from "@/services/data-service";
import DashboardContent from "@/components/dashboard/dashboard-content";

// This is a Server Component (Best for Performance & SEO)
export default async function Page() {
  // Fetch data on the server
  const products = await dataService.getProducts();

  // Pass data to Client Component for interactivity
  return <DashboardContent initialProducts={products} />;
}
