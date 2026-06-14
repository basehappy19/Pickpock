import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Store, User } from "@/types";

const storesFilePath = path.join(process.cwd(), "lib", "stores.json");
const usersFilePath = path.join(process.cwd(), "lib", "users.json");

const readStores = (): Store[] => {
  const data = fs.readFileSync(storesFilePath, "utf8");
  return JSON.parse(data);
};

const writeStores = (stores: Store[]) => {
  fs.writeFileSync(storesFilePath, JSON.stringify(stores, null, 2), "utf8");
};

export async function DELETE(req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  try {
    const { storeId } = await params;
    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
    }

    let stores = readStores();
    const storeIndex = stores.findIndex(s => s.store_id === storeId);
    
    if (storeIndex === -1) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const owner_id = stores[storeIndex].owner_id;
    
    // Remove the store
    stores.splice(storeIndex, 1);
    writeStores(stores);

    // Update user role back to customer
    try {
      const usersData = fs.readFileSync(usersFilePath, "utf8");
      let users: User[] = JSON.parse(usersData);
      const userIndex = users.findIndex((u) => u.id === owner_id);
      
      if (userIndex !== -1 && users[userIndex].role === 'partner') {
        users[userIndex].role = 'customer';
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf8");
      }
    } catch (e) {
      console.error("Failed to update user role on store deletion", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete store" }, { status: 500 });
  }
}
