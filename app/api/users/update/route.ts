import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const usersFilePath = path.join(process.cwd(), "lib", "users.json");

export async function PUT(req: Request) {
  try {
    const { userId, name, email, phone } = await req.json();

    const data = fs.readFileSync(usersFilePath, "utf8");
    const users = JSON.parse(data);

    const userIndex = users.findIndex((u: any) => u.id === userId);

    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check email uniqueness if changed
    if (email !== users[userIndex].email) {
      const emailExists = users.some((u: any) => u.email === email);
      if (emailExists) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
    }

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      email: email || users[userIndex].email,
      phone: phone || users[userIndex].phone
    };

    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

    return NextResponse.json({ 
      success: true, 
      user: {
        id: users[userIndex].id,
        name: users[userIndex].name,
        email: users[userIndex].email,
        role: users[userIndex].role,
        isVip: users[userIndex].isVip
      } 
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
