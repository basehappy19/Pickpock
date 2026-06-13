"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type Role = "customer" | "founder";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface RoleContextType {
  user: User | null;
  role: Role;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setRole: (role: Role) => void; // For manual toggle in demo
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<Role>("customer");
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem("authUser");
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      setRoleState(u.role);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setRoleState(data.user.role);
        localStorage.setItem("authUser", JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setRoleState("customer");
    localStorage.removeItem("authUser");
    router.push("/");
  };

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem("authUser", JSON.stringify(updatedUser));
    }
  };

  return (
    <RoleContext.Provider value={{ user, role, login, logout, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
