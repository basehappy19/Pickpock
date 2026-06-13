import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const storesFilePath = path.join(process.cwd(), "lib", "stores.json");

// Helper to read JSON
const readStores = () => {
  const data = fs.readFileSync(storesFilePath, "utf8");
  return JSON.parse(data);
};

// Helper to write JSON
const writeStores = (stores: any[]) => {
  fs.writeFileSync(storesFilePath, JSON.stringify(stores, null, 2), "utf8");
};

export async function GET() {
  try {
    const stores = readStores();
    return NextResponse.json(stores);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stores" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { owner_id, name, description } = await req.json();
    const stores = readStores();

    // Check if user already has a store
    const existingStore = stores.find((s: any) => s.owner_id === owner_id);
    if (existingStore) {
      return NextResponse.json({ error: "User already has a store" }, { status: 400 });
    }

    const newStore = {
      store_id: "s-" + Math.random().toString(36).substr(2, 9),
      name,
      owner_id,
      description,
      status: "active",
      rating: 5.0,
      products: [],
      joined_at: new Date().toISOString()
    };

    stores.push(newStore);
    writeStores(stores);

    return NextResponse.json({ success: true, store: newStore });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create store" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { store_id, name, description, views } = body;
    
    if (!store_id) {
      return NextResponse.json({ error: "Missing store ID" }, { status: 400 });
    }

    let stores = readStores();
    let updatedStore = null;

    stores = stores.map((s: any) => {
      if (s.store_id === store_id) {
        updatedStore = {
          ...s,
          name: name !== undefined ? name : s.name,
          description: description !== undefined ? description : s.description,
          views: views !== undefined ? (s.views || 0) + views : (s.views || 0)
        };
        return updatedStore;
      }
      return s;
    });

    if (!updatedStore) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    writeStores(stores);
    return NextResponse.json({ success: true, store: updatedStore });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update store" }, { status: 500 });
  }
}
