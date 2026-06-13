import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ordersFilePath = path.join(process.cwd(), "lib", "ecommerce_orders.json");

export async function PUT(req: Request) {
  try {
    const { orderId, status } = await req.json();
    const data = fs.readFileSync(ordersFilePath, "utf8");
    let orders = JSON.parse(data);

    const orderIndex = orders.findIndex((o: any) => o.order_id === orderId);
    if (orderIndex === -1) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    orders[orderIndex].status = status.toUpperCase();
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));

    return NextResponse.json({ success: true, order: orders[orderIndex] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
