"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Role, Tier } from "@/types";

interface UserWithDiscounts extends User {
  discountPercent: number;
  hasFreeShipping: boolean;
}

interface RoleContextType {
  user: UserWithDiscounts | null;
  role: Role;
  tier: Tier;
  login: (email: string, password: string) => Promise<boolean>;
  registerUser: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setRole: (role: Role) => void;
  updateUserStore: (store: any) => void;
  cancelUserStore: () => Promise<boolean>;
  updateUserInfo: (info: Partial<User>) => void;
  upgradeToVIP: () => Promise<boolean>;
  getUserDiscount: () => number;
  hasFreeShipping: () => boolean;
  canAccessPartnerFeatures: () => boolean;
  canAccessFounderFeatures: () => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<Role>("customer");
  const [tier, setTierState] = useState<Tier>("MEMBER");
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem("authUser");
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      setRoleState(u.role);
      setTierState(u.tier || 'MEMBER');
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
        setTierState(data.user.tier || 'MEMBER');
        
        // Clear all localStorage except recentlyViewed and theme to prevent data leaking to guest session
        const recentlyViewed = localStorage.getItem("recentlyViewed");
        const theme = localStorage.getItem("theme");
        localStorage.clear();
        if (recentlyViewed) {
          localStorage.setItem("recentlyViewed", recentlyViewed);
        }
        if (theme) {
          localStorage.setItem("theme", theme);
        }
        
        localStorage.setItem("authUser", JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const registerUser = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "customer", isVip: false })
      });

      if (res.ok) {
        // Automatically login after successful registration
        return await login(email, password);
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setRoleState("customer");
    setTierState("MEMBER");
    
    // Clear all localStorage except recentlyViewed and theme for a clean slate
    const recentlyViewed = localStorage.getItem("recentlyViewed");
    const theme = localStorage.getItem("theme");
    localStorage.clear();
    if (recentlyViewed) {
      localStorage.setItem("recentlyViewed", recentlyViewed);
    }
    if (theme) {
      localStorage.setItem("theme", theme);
    }
    
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

  const updateUserStore = (store: any) => {
    if (user) {
      const updatedUser: User = { 
        ...user, 
        store,
        role: (user.role === 'founder' ? 'founder' : 'partner') as Role
      };
      setUser(updatedUser);
      setRoleState(updatedUser.role);
      localStorage.setItem("authUser", JSON.stringify(updatedUser));
    }
  };

  const cancelUserStore = async () => {
    if (user && user.store) {
      try {
        const res = await fetch(`/api/stores/${user.store.store_id}`, {
          method: 'DELETE',
        });
        
        if (res.ok) {
          const { store, ...userWithoutStore } = user;
          const updatedUser: User = { 
            ...userWithoutStore, 
            role: 'customer' as Role 
          };
          setUser(updatedUser);
          setRoleState('customer');
          localStorage.setItem("authUser", JSON.stringify(updatedUser));
          return true;
        }
      } catch (e) {
        console.error("Failed to cancel store", e);
      }
    }
    return false;
  };

  const updateUserInfo = (info: Partial<User>) => {
    if (user) {
      const updatedUser: User = { ...user, ...info };
      setUser(updatedUser);
      if (info.role) setRoleState(info.role);
      if (info.tier) setTierState(info.tier);
      localStorage.setItem("authUser", JSON.stringify(updatedUser));
    }
  };

  const getUserDiscount = (): number => {
    if (!user || tier !== 'VIP') return 0;
    if (user.vipExpiresAt && new Date(user.vipExpiresAt) < new Date()) {
      return 0;
    }
    return 10;
  };

  const hasFreeShipping = (): boolean => {
    return tier === 'VIP';
  };

  const canAccessPartnerFeatures = (): boolean => {
    return role === 'partner' || role === 'founder';
  };

  const canAccessFounderFeatures = (): boolean => {
    return role === 'founder';
  };

  const upgradeToVIP = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const res = await fetch("/api/users/upgrade-vip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });

      if (res.ok) {
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        setTierState('VIP');
        const updatedUser: User = {
          ...user,
          tier: 'VIP' as Tier,
          vipExpiresAt: expiresAt.toISOString()
        };
        setUser(updatedUser);
        localStorage.setItem("authUser", JSON.stringify(updatedUser));
        return true;
      }
      return false;
    } catch (e) {
      console.error("VIP upgrade failed", e);
      return false;
    }
  };

  const userWithDiscounts: UserWithDiscounts | null = user ? {
    ...user,
    discountPercent: getUserDiscount(),
    hasFreeShipping: hasFreeShipping()
  } : null;

  return (
    <RoleContext.Provider value={{
      user: userWithDiscounts,
      role,
      tier,
      login,
      registerUser,
      logout,
      setRole,
      updateUserStore,
      cancelUserStore,
      updateUserInfo,
      upgradeToVIP,
      getUserDiscount,
      hasFreeShipping,
      canAccessPartnerFeatures,
      canAccessFounderFeatures
    }}>
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
