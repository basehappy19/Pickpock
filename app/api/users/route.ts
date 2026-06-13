import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const usersFilePath = path.join(process.cwd(), "lib", "users.json");

// Helper to read JSON
const readUsers = () => {
  try {
    const data = fs.readFileSync(usersFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Helper to write JSON
const writeUsers = (users: any[]) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf8");
};

// GET all users
export async function GET() {
  try {
    const users = readUsers();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to read users" }, { status: 500 });
  }
}

// POST new user
export async function POST(req: Request) {
  try {
    const newUser = await req.json();
    const users = readUsers();

    // Check if email already exists
    if (users.find((u: any) => u.email === newUser.email)) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // Generate new user ID
    const maxId = users.reduce((max: number, u: any) => {
      const num = parseInt(u.user_id.replace('u', ''));
      return num > max ? num : max;
    }, 0);

    const userWithId = {
      user_id: `u${String(maxId + 1).padStart(3, '0')}`,
      ...newUser,
      loyalty_points: newUser.loyalty_points || 0,
      password: newUser.password || "1234"
    };

    users.push(userWithId);
    writeUsers(users);

    return NextResponse.json({ success: true, user: userWithId });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

// PUT update user
export async function PUT(req: Request) {
  try {
    const updatedUser = await req.json();
    let users = readUsers();

    const index = users.findIndex((u: any) => u.user_id === updatedUser.user_id);
    if (index === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    users[index] = { ...users[index], ...updatedUser };
    writeUsers(users);

    return NextResponse.json({ success: true, user: users[index] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    let users = readUsers();
    const initialLength = users.length;
    users = users.filter((u: any) => u.user_id !== id);

    if (users.length === initialLength) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    writeUsers(users);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
