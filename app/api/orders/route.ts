import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Order } from "@/types";

const ordersFilePath = path.join(process.cwd(), "lib", "ecommerce_orders.json");

const readOrders = () => {
  const data = fs.readFileSync(ordersFilePath, "utf8");
  return JSON.parse(data);
};

const writeOrders = (orders: any[]) => {
  fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), "utf8");
};

// Map Internal Order to JSON Schema
const toJSON = (o: Order) => ({
  order_id: o.id,
  user_id: o.customerId,
  items: o.items.map(i => ({
    product_id: i.productId,
    qty: i.quantity
  })),
  total_price: o.totalAmount,
  status: o.status.toUpperCase(),
  timestamp: o.createdAt
});

export async function POST(req: Request) {
  try {
    const newOrder: Order = await req.json();
    const orders = readOrders();
    
    orders.push(toJSON(newOrder));
    writeOrders(orders);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add order" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const orders = readOrders();
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to read orders" }, { status: 500 });
  }
}
