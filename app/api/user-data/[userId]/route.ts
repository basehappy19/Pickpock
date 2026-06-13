import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const userDataFilePath = path.join(process.cwd(), "lib", "user-data.json");

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const data = fs.readFileSync(userDataFilePath, "utf8");
    const allUserData = JSON.parse(data);

    const userData = allUserData[userId] || {
      user_id: userId,
      cart: [],
      wishlist: [],
      reviews: [],
      recentlyViewed: [],
      compare: []
    };

    return NextResponse.json(userData);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const updates = await req.json();

    const data = fs.readFileSync(userDataFilePath, "utf8");
    const allUserData = JSON.parse(data);

    if (!allUserData[userId]) {
      allUserData[userId] = {
        user_id: userId,
        cart: [],
        wishlist: [],
        reviews: [],
        recentlyViewed: [],
        compare: []
      };
    }

    allUserData[userId] = { ...allUserData[userId], ...updates };

    fs.writeFileSync(userDataFilePath, JSON.stringify(allUserData, null, 2));

    return NextResponse.json({ success: true, data: allUserData[userId] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user data" }, { status: 500 });
  }
}
