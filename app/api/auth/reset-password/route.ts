import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const usersFilePath = path.join(process.cwd(), "lib", "users.json");

export async function POST(req: Request) {
  try {
    const { phone, otp, newPassword, step } = await req.json();

    const data = fs.readFileSync(usersFilePath, "utf8");
    const users = JSON.parse(data);

    const userIndex = users.findIndex((u: any) => u.phone === phone);

    if (userIndex === -1) {
      return NextResponse.json({ error: "Phone number not found" }, { status: 404 });
    }

    if (step === "request") {
      // Mock OTP sending
      console.log(`Demo: OTP for ${phone} is 123456`);
      return NextResponse.json({ success: true, message: "OTP sent to your phone" });
    }

    if (step === "verify") {
      if (otp !== "123456") {
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
      }

      users[userIndex].password = newPassword;
      fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

      return NextResponse.json({ success: true, message: "Password updated successfully" });
    }

    return NextResponse.json({ error: "Invalid step" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
