import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Product } from "@/types";

const productsFilePath = path.join(process.cwd(), "lib", "products.json");

// Helper to read JSON
const readProducts = () => {
  const data = fs.readFileSync(productsFilePath, "utf8");
  return JSON.parse(data);
};

// Helper to write JSON
const writeProducts = (products: any[]) => {
  fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), "utf8");
};

// Map Internal Product to JSON Schema
const toJSON = (p: Product) => ({
  id: p.id,
  product_id: p.id, // Support both for compatibility
  name: p.name,
  category: p.category,
  price: p.price,
  stock: p.stock,
  image: p.image,
  description: p.description,
  rating: p.rating || 0,
  reviews: Array.isArray(p.reviews) ? p.reviews : [],
  storeId: p.storeId,
  isOfficial: p.isOfficial || false,
  createdAt: p.createdAt || new Date().toISOString()
});

export async function GET() {
  try {
    const products = readProducts();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Failed to read products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const newProduct: Product = await req.json();
    const products = readProducts();
    
    // Ensure ID exists
    const pid = newProduct.id || (newProduct as any).product_id;
    if (!pid) return NextResponse.json({ error: "Missing product ID" }, { status: 400 });

    // Add to list, avoiding duplicates if possible
    const existingIndex = products.findIndex((p: any) => (p.product_id || p.id) === pid);
    if (existingIndex !== -1) {
       products[existingIndex] = toJSON(newProduct);
    } else {
       products.push(toJSON(newProduct));
    }
    
    writeProducts(products);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add product" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const updatedProduct: Product = await req.json();
    const pid = updatedProduct.id || (updatedProduct as any).product_id;
    
    if (!pid) return NextResponse.json({ error: "Missing product ID" }, { status: 400 });

    let products = readProducts();
    let found = false;
    
    products = products.map((p: any) => {
      if ((p.product_id || p.id) === pid) {
        found = true;
        return toJSON(updatedProduct);
      }
      return p;
    });
    
    if (!found) {
       // If not found during PUT, treat as new if it has required data
       products.push(toJSON(updatedProduct));
    }

    writeProducts(products);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    let products = readProducts();
    products = products.filter((p: any) => p.product_id !== id);
    
    writeProducts(products);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
