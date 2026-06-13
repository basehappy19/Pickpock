import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const usersFilePath = path.join(process.cwd(), "lib", "users.json");

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const data = fs.readFileSync(usersFilePath, "utf8");
    const users = JSON.parse(data);

    // Match email and password
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (user) {
      // Find store
      const storesPath = path.join(process.cwd(), "lib", "stores.json");
      const storesData = fs.readFileSync(storesPath, "utf8");
      const stores = JSON.parse(storesData);
      const store = stores.find((s: any) => s.owner_id === user.user_id);

      // Determine role: founder stays founder, others with stores become partner, else customer
      let assignedRole = "customer";
      if (user.type === "founder") {
        assignedRole = "founder";
      } else if (store || user.type === "partner") {
        assignedRole = "partner";
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          loyaltyPoints: user.loyalty_points,
          role: assignedRole,
          tier: user.role === "VIP" ? "VIP" : "MEMBER",
          store: store || null
        }
      });
    }

    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}
