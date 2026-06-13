"use client";

import { useState, useEffect } from "react";
import { useRole } from "@/hooks/use-role";
import { useLanguage } from "@/hooks/use-language";
import { User, Mail, Phone, Save, Loader2, ShieldCheck, Star, Clock, ShoppingBag, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const { user, logout } = useRole();
  const { t } = useLanguage();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Fetch full user data to get phone
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const users = await res.json();
          const currentUser = users.find((u: any) => u.id === user.id);
          if (currentUser) {
            setName(currentUser.name);
            setEmail(currentUser.email);
            setPhone(currentUser.phone);
          }
        }
      } catch (e) {
        console.error("Failed to fetch user data", e);
      }
    };

    fetchUserData();
  }, [user, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, name, email, phone })
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        // Optionally update local user state if needed, but role hook handles basic info
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to update profile" });
      }
    } catch (e) {
      setMessage({ type: "error", text: "Network error" });
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 py-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Side: Avatar and Stats */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="bg-card border-2 border-primary/10 rounded-[2.5rem] p-8 text-center space-y-4 shadow-xl shadow-primary/5">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full bg-rainbow-gradient p-1 shadow-lg shadow-primary/20">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  <User className="h-16 w-16 text-primary" />
                </div>
              </div>
              <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-xl shadow-lg border-4 border-card">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight">{name}</h2>
              <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">{user.role}</p>
            </div>
            <button 
              onClick={logout}
              className="w-full py-3 rounded-xl bg-muted text-muted-foreground font-black text-xs hover:bg-rose-50 hover:text-rose-500 transition-all uppercase tracking-widest"
            >
              Log Out
            </button>
          </div>

          <div className="bg-card border-2 border-primary/10 rounded-[2.5rem] p-6 space-y-4 shadow-xl shadow-primary/5">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">My Activity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-muted/50 text-center space-y-1">
                <ShoppingBag className="h-5 w-5 mx-auto text-primary" />
                <p className="text-xl font-black">12</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Orders</p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/50 text-center space-y-1">
                <Star className="h-5 w-5 mx-auto text-amber-500" />
                <p className="text-xl font-black">450</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Points</p>
              </div>
            </div>
          </div>

          {/* Store Status / Become a Partner */}
          <div className="bg-card border-2 border-primary/10 rounded-[2.5rem] p-6 space-y-4 shadow-xl shadow-primary/5">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Store Management</h3>
            {user.store ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-2">
                <div className="flex items-center gap-2 text-emerald-600">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs font-black uppercase tracking-tighter">Verified Partner</span>
                </div>
                <p className="font-black text-sm line-clamp-1">{user.store.name}</p>
                <Link 
                  href="/dashboard" 
                  className="block w-full py-2 rounded-xl bg-emerald-600 text-white text-center text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
                >
                  Manage My Shop
                </Link>
              </div>
            ) : user.role === "customer" ? (
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                <p className="text-xs font-bold text-muted-foreground">Want to sell your own products on Pickpock Mall?</p>
                <Link 
                  href="/partner/register" 
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                  <Plus className="h-3.5 w-3.5" /> Become a Partner
                </Link>
              </div>
            ) : (
              <p className="text-xs font-bold text-muted-foreground px-2 italic">Platform administrator account.</p>
            )}
          </div>
        </div>

        {/* Right Side: Edit Form */}
        <div className="w-full md:w-2/3 bg-card border-2 border-primary/10 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl shadow-primary/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Account <span className="text-primary">Settings</span></h1>
              <p className="text-muted-foreground text-sm font-bold">Update your personal information</p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            {message.text && (
              <div className={`p-4 rounded-2xl font-black text-xs uppercase tracking-tight text-center ${
                message.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
              }`}>
                {message.text}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-muted/50 border-2 border-transparent focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
              SAVE CHANGES
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
