import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const couponsFilePath = path.join(process.cwd(), "lib", "coupons.json");

export async function GET() {
  try {
    const data = fs.readFileSync(couponsFilePath, "utf8");
    const coupons = JSON.parse(data);
    return NextResponse.json(coupons);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}
