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
      const store = stores.find((s: any) => s.owner_id === user.id);

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tier: user.isVip ? "VIP" : "MEMBER",
          store: store || null
        }
      });
    }

    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}
