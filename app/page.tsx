"use client";

import { useGlobalData } from "@/hooks/use-global-data";
import HomepageClient from "./homepage-client";

export default function Homepage() {
  const { products } = useGlobalData();

  return <HomepageClient products={products} />;
}
