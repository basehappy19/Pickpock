import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const usersFilePath = path.join(process.cwd(), "lib", "users.json");

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword, step } = await req.json();

    const data = fs.readFileSync(usersFilePath, "utf8");
    const users = JSON.parse(data);

    const userIndex = users.findIndex((u: any) => u.email === email);

    if (userIndex === -1) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    if (step === "request") {
      // Mock OTP sending
      console.log(`Demo: OTP for ${email} is 123456`);
      return NextResponse.json({ success: true, message: "OTP sent to your email" });
    }

    if (step === "verify-otp") {
      if (otp !== "123456") {
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: "OTP verified" });
    }

    if (step === "update") {
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

export async function PUT(req: Request) {
  try {
    const { email, currentPassword, newPassword } = await req.json();

    const data = fs.readFileSync(usersFilePath, "utf8");
    const users = JSON.parse(data);

    const userIndex = users.findIndex((u: any) => u.email === email);

    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (users[userIndex].password !== currentPassword) {
      return NextResponse.json({ error: "Invalid current password" }, { status: 400 });
    }

    users[userIndex].password = newPassword;
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
