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
  product_id: p.id,
  name: p.name,
  category: p.category,
  price: p.price,
  stock: p.stock,
  image: p.image
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
    
    // Add to list
    products.push(toJSON(newProduct));
    writeProducts(products);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add product" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const updatedProduct: Product = await req.json();
    let products = readProducts();
    
    products = products.map((p: any) => 
      p.product_id === updatedProduct.id ? toJSON(updatedProduct) : p
    );
    
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
